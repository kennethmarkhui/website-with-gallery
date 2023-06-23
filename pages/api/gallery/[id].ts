import type { NextApiRequest, NextApiResponse } from 'next'

import type {
  GalleryErrorResponse,
  GalleryFormFields,
  GalleryItem,
} from 'types/gallery'
import { prisma } from 'lib/prisma'
import { GalleryFormFieldsSchema } from 'lib/validations'

export async function fetchItem(id: GalleryFormFields['id']) {
  const data = await prisma.item.findUnique({
    where: { id },
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
    },
  })

  return data ? { ...data, category: data.category?.id ?? null } : null
}

export async function fetchImage(id: GalleryFormFields['id']) {
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

  const parsedQuery = GalleryFormFieldsSchema.pick({ id: true }).safeParse(
    req.query
  )

  if (!parsedQuery.success) {
    return res.status(400).json({
      error: {
        message: 'Invalid Input.',
      },
    })
  }

  const { id } = parsedQuery.data

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
