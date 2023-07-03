import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from 'prisma/prisma-client'

import type {
  GalleryErrorResponse,
  GalleryQuery,
  GalleryResponse,
} from 'types/gallery'
import { prisma } from 'lib/prisma'
import { GalleryQuerySchema } from 'lib/validations'
import { GALLERY_LIMIT, GALLERY_ORDER_BY_DIRECTION } from 'constants/gallery'

export async function fetchItems({
  nextCursor,
  page,
  search,
  category,
  orderBy: orderByFilter,
}: GalleryQuery) {
  // https://github.com/prisma/prisma/discussions/4888#discussioncomment-403826
  const orderBy = (
    orderByFilter
      ? orderByFilter.startsWith('id')
        ? Object.fromEntries([orderByFilter.split(',')])
        : [
            Object.fromEntries([orderByFilter.split(',')]),
            { id: GALLERY_ORDER_BY_DIRECTION },
          ]
      : [
          { updatedAt: GALLERY_ORDER_BY_DIRECTION },
          { id: GALLERY_ORDER_BY_DIRECTION },
        ]
  ) satisfies Prisma.Enumerable<Prisma.ItemOrderByWithRelationInput>

  const where = {
    AND: [
      { id: { contains: search, mode: 'insensitive' } },
      {
        category: category ? { id: { in: category.split(',') } } : undefined,
      },
    ],
  } satisfies Prisma.ItemWhereInput

  const [items, totalItems] = await prisma.$transaction([
    prisma.item.findMany({
      where,
      take: GALLERY_LIMIT,
      ...(page
        ? {
            skip: (+page - 1) * GALLERY_LIMIT,
          }
        : {
            skip: nextCursor === '0' ? 0 : 1,
            cursor: nextCursor === '0' ? undefined : { id: nextCursor },
          }),
      select: {
        id: true,
        category: { select: { id: true } },
        image: {
          select: {
            url: true,
            publicId: true,
            width: true,
            height: true,
          },
        },
        translations: {
          select: {
            name: true,
            storage: true,
            language: { select: { code: true } },
          },
        },
        dateAdded: true,
        updatedAt: true,
      },
      orderBy,
    }),
    prisma.item.count({
      where,
    }),
  ])

  return {
    items: items.map((item) => ({
      ...item,
      category: item.category?.id ?? null,
    })),
    totalCount: totalItems,
    page,
    nextCursor:
      items.length === GALLERY_LIMIT ? items[GALLERY_LIMIT - 1].id : undefined,
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
