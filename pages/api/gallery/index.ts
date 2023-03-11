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
import { isValidRequest } from 'lib/utils'
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

  const orderByFilter = orderBy
    ? typeof orderBy === 'string'
      ? Object.fromEntries([orderBy.split(',')])
      : undefined
    : { updatedAt: GALLERY_ORDER_BY_DIRECTION }

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
            skip: (page - 1) * GALLERY_LIMIT,
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
      ? { page }
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

  if (
    isValidRequest<GalleryCursorQuery>(req.query, [
      'nextCursor',
      'search',
      'categories',
      'orderBy',
    ])
  ) {
    const {
      nextCursor: nextCursorQuery,
      search,
      categories,
      orderBy,
    } = req.query

    try {
      const { items, totalCount, nextCursor } = await fetchItems({
        nextCursor: nextCursorQuery,
        search,
        categories,
        orderBy,
      })
      return res.status(200).json({
        items,
        totalCount,
        nextCursor,
      })
    } catch (error) {
      return res
        .status(500)
        .json({ error: { message: 'Failed to fetch data from the database.' } })
    }
  }

  if (
    isValidRequest<GalleryOffsetQuery>(req.query, [
      'page',
      'search',
      'categories',
      'orderBy',
    ])
  ) {
    const { page: pageQuery, search, categories, orderBy } = req.query

    try {
      const { items, totalCount, page } = await fetchItems({
        page: pageQuery,
        search,
        categories,
        orderBy,
      })
      return res.status(200).json({
        items,
        totalCount,
        page,
      })
    } catch (error) {
      return res
        .status(500)
        .json({ error: { message: 'Failed to fetch data from the database.' } })
    }
  }
}
