import type { NextApiRequest, NextApiResponse } from 'next'

import type { GalleryErrorResponse, OmittedItem } from 'types/gallery'
import { prisma } from 'lib/prisma'

export async function fetchItem(itemId: string): Promise<OmittedItem | null> {
  return await prisma.item.findUnique({
    where: { itemId },
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

export async function fetchImage(itemId: string) {
  return await prisma.image.findFirst({
    where: { itemId },
    select: {
      url: true,
      publicId: true,
    },
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OmittedItem | null | GalleryErrorResponse>
) {
  if (req.query.itemId) {
    try {
      const item = await fetchItem(req.query.itemId as string)
      if (item) res.status(200).json(item)
      return res
        .status(404)
        .json({ error: { message: 'Can not find data record in database.' } })
    } catch (error) {
      return res.status(500).json({
        error: { message: 'Failed to fetch data from the database.' },
      })
    }
  }
  res.status(422).json({ error: { message: 'Please provide an id.' } })
}
