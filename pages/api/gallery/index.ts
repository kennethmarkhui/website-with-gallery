import type { NextApiRequest, NextApiResponse } from 'next'

import type { GalleryErrorResponse, OmittedItem } from 'types/gallery'
import { prisma } from 'lib/prisma'

export async function fetchItems(): Promise<OmittedItem[]> {
  return await prisma.item.findMany({
    select: {
      itemId: true,
      name: true,
      storage: true,
      image: {
        select: {
          url: true,
          publicId: true,
        },
      },
    },
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OmittedItem[] | GalleryErrorResponse>
) {
  try {
    const items = await fetchItems()
    return res.status(200).json(items)
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: 'Failed to fetch data from the database.' } })
  }
}
