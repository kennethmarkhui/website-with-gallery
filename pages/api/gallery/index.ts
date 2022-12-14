import type { NextApiRequest, NextApiResponse } from 'next'

import type {
  GalleryErrorResponse,
  GalleryQuery,
  GalleryResponse,
  OmittedItem,
} from 'types/gallery'
import { prisma } from 'lib/prisma'

const limit = 10

export async function fetchItems({
  nextCursor,
  search: searchFilter,
  categories: categoriesFilter,
}: GalleryQuery): Promise<OmittedItem[]> {
  return await prisma.item.findMany({
    where: {
      AND: [
        { id: { contains: searchFilter, mode: 'insensitive' } },
        {
          category: {
            in:
              typeof categoriesFilter === 'string'
                ? categoriesFilter.split(',')
                : undefined,
          },
        },
      ],
    },
    take: limit,
    skip: nextCursor === '0' ? 0 : 1,
    cursor: nextCursor === '0' ? undefined : { id: nextCursor },
    select: {
      id: true,
      name: true,
      storage: true,
      category: true,
      image: {
        select: {
          url: true,
          publicId: true,
          width: true,
          height: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryResponse | GalleryErrorResponse>
) {
  let { nextCursor, search, categories } = req.query as GalleryQuery

  try {
    const items = await fetchItems({ nextCursor, search, categories })
    nextCursor = items.length === limit ? items[limit - 1].id : undefined
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
