import type { NextApiRequest, NextApiResponse } from 'next'

import type {
  GalleryErrorResponse,
  GalleryCursorQuery,
  GalleryCursorResponse,
  GalleryOffsetQuery,
  GalleryQuery,
  GalleryResponse,
  GalleryOffsetResponse,
} from 'types/gallery'
import { prisma } from 'lib/prisma'
import { GalleryQuerySchema } from 'lib/validations'
import { GALLERY_LIMIT, GALLERY_ORDER_BY_DIRECTION } from 'constants/gallery'

export async function fetchItems({
  page,
  search,
  categories,
  orderBy,
}: GalleryOffsetQuery): Promise<GalleryOffsetResponse>
export async function fetchItems({
  nextCursor,
  search,
  categories,
  orderBy,
}: GalleryCursorQuery): Promise<GalleryCursorResponse>
export async function fetchItems({
  nextCursor,
  page,
  search: searchFilter,
  categories,
  orderBy,
}: GalleryQuery): Promise<GalleryResponse> {
  const categoriesFilter =
    typeof categories === 'string'
      ? { name: { in: categories.split(',') } }
      : undefined

  // https://github.com/prisma/prisma/discussions/4888#discussioncomment-403826
  const orderByFilter = orderBy
    ? typeof orderBy === 'string'
      ? orderBy.startsWith('id')
        ? Object.fromEntries([orderBy.split(',')])
        : [
            Object.fromEntries([orderBy.split(',')]),
            { id: GALLERY_ORDER_BY_DIRECTION },
          ]
      : undefined
    : [
        { updatedAt: GALLERY_ORDER_BY_DIRECTION },
        { id: GALLERY_ORDER_BY_DIRECTION },
      ]

  const [items, totalItems] = await prisma.$transaction([
    prisma.item.findMany({
      where: {
        AND: [
          { id: { contains: searchFilter, mode: 'insensitive' } },
          {
            category: categoriesFilter,
          },
        ],
      },
      take: GALLERY_LIMIT,
      ...(page
        ? {
            // TODO: safely check and convert page string into number
            skip: (+page - 1) * GALLERY_LIMIT,
          }
        : {
            skip: nextCursor === '0' ? 0 : 1,
            cursor: nextCursor === '0' ? undefined : { id: nextCursor },
          }),
      select: {
        id: true,
        name: true,
        storage: true,
        category: { select: { name: true } },
        image: {
          select: {
            url: true,
            publicId: true,
            width: true,
            height: true,
          },
        },
      },
      orderBy: orderByFilter,
    }),
    prisma.item.count({
      where: {
        AND: [
          { id: { contains: searchFilter, mode: 'insensitive' } },
          {
            category: categoriesFilter,
          },
        ],
      },
    }),
  ])

  return {
    items: items.map((item) => ({
      ...item,
      category: item.category?.name ?? null,
    })),
    totalCount: totalItems,
    ...(page
      ? {
          page,
        }
      : {
          nextCursor:
            items.length === GALLERY_LIMIT
              ? items[GALLERY_LIMIT - 1].id
              : undefined,
        }),
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryResponse | GalleryErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
      },
    })
  }

  const parsedGalleryQuery = GalleryQuerySchema.safeParse(req.query)
  if (!parsedGalleryQuery.success) {
    return res.status(422).json({ error: { message: 'Invalid Input.' } })
  }

  try {
    const items = await fetchItems(parsedGalleryQuery.data)
    return res.status(200).json(items)
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: 'Failed to fetch data from the database.' } })
  }
}
