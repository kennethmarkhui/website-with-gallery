import type { NextApiRequest, NextApiResponse } from 'next'

import type { GalleryErrorResponse, GalleryItem } from 'types/gallery'
import { prisma } from 'lib/prisma'
import { isValidRequest } from 'lib/utils'

type RequestQuery = {
  id: string
}

export async function fetchItem(
  id: RequestQuery['id']
): Promise<GalleryItem | null> {
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

export async function fetchImage(id: RequestQuery['id']) {
  return await prisma.image.findFirst({
    where: { itemId: id },
    select: {
      url: true,
      publicId: true,
    },
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryItem | null | GalleryErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
      },
    })
  }

  if (!isValidRequest<RequestQuery>(req.query, ['id'])) {
    return res.status(400).json({
      error: {
        message: 'Provide an id.',
      },
    })
  }

  const { id } = req.query

  try {
    const item = await fetchItem(id)
    if (item) {
      return res.status(200).json(item)
    }
    return res
      .status(404)
      .json({ error: { message: 'Can not find data record in database.' } })
  } catch (error) {
    return res.status(500).json({
      error: { message: 'Failed to fetch data from the database.' },
    })
  }
}
