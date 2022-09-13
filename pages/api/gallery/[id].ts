import type { NextApiRequest, NextApiResponse } from 'next'

import type { GalleryErrorResponse, OmittedItem } from 'types/gallery'
import { prisma } from 'lib/prisma'

export async function fetchItem(id: string): Promise<OmittedItem | null> {
  return await prisma.item.findUnique({
    where: { id },
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
  })
}

export async function fetchImage(id: string) {
  return await prisma.image.findFirst({
    where: { id },
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
  if (req.query.id) {
    try {
      const item = await fetchItem(req.query.id as string)
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
