import type { NextApiRequest, NextApiResponse } from 'next'

import type {
  GalleryErrorResponse,
  GalleryQuery,
  GalleryResponse,
  GalleryItem,
  GalleryOrderByDirection,
} from 'types/gallery'
import { prisma } from 'lib/prisma'
import { isValidRequest } from 'lib/utils'

export const GALLERY_LIMIT = 10
export const GALLERY_ORDER_BY_DIRECTION: GalleryOrderByDirection = 'desc'

export async function fetchItems({
  nextCursor,
  search: searchFilter,
  categories,
  orderBy,
}: GalleryQuery): Promise<GalleryItem[]> {
  const categoriesFilter =
    typeof categories === 'string'
      ? { name: { in: categories.split(',') } }
      : undefined

  const orderByFilter = orderBy
    ? typeof orderBy === 'string'
      ? Object.fromEntries([orderBy.split(',')])
      : undefined
    : { updatedAt: GALLERY_ORDER_BY_DIRECTION }

  const data = await prisma.item.findMany({
    where: {
      AND: [
        { id: { contains: searchFilter, mode: 'insensitive' } },
        {
          category: categoriesFilter,
        },
      ],
    },
    take: GALLERY_LIMIT,
    skip: nextCursor === '0' ? 0 : 1,
    cursor: nextCursor === '0' ? undefined : { id: nextCursor },
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
  })

  return data.map((item) => ({
    ...item,
    category: item.category?.name ?? null,
  }))
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
    !isValidRequest<GalleryQuery>(req.query, [
      'nextCursor',
      'search',
      'categories',
      'orderBy',
    ])
  ) {
    return res.status(400).json({
      error: {
        message: 'Missing queries.',
      },
    })
  }

  let { nextCursor, search, categories, orderBy } = req.query

  try {
    const items = await fetchItems({ nextCursor, search, categories, orderBy })
    nextCursor =
      items.length === GALLERY_LIMIT ? items[GALLERY_LIMIT - 1].id : undefined
    return res.status(200).json({
      items,
      nextCursor,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: 'Failed to fetch data from the database.' } })
  }
}
