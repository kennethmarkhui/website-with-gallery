import type { NextApiRequest, NextApiResponse } from 'next'

import type { GalleryErrorResponse, OmittedItem } from 'types/gallery'
import { prisma } from 'lib/prisma'

export type NextCursor = string | undefined

const limit = 10

export async function fetchItems(
  nextCursor: NextCursor
): Promise<OmittedItem[]> {
  return await prisma.item.findMany({
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
  res: NextApiResponse<
    { items: OmittedItem[]; nextCursor: NextCursor } | GalleryErrorResponse
  >
) {
  let nextCursor: NextCursor = req.query.nextCursor as string

  try {
    const items = await fetchItems(nextCursor)
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
