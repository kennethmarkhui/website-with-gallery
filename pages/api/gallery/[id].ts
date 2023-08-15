import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { ZodError } from 'zod'

import type {
  GalleryErrorResponse,
  GalleryFormFields,
  GalleryItem,
} from 'types/gallery'
import { prisma } from 'lib/prisma'
import { authOptions } from 'lib/auth'
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
      dateAdded: true,
      updatedAt: true,
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
  res: NextApiResponse<GalleryItem | GalleryErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
      },
    })
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({
        error: {
          message: 'You must be an admin to view the protected content.',
        },
      })
    }
    const parsedQuery = GalleryFormFieldsSchema.pick({ id: true }).parse(
      req.query
    )

    const { id } = parsedQuery

    const item = await fetchItem(id)
    if (item) {
      return res.status(200).json(item)
    }
    return res
      .status(404)
      .json({ error: { message: 'Can not find data record in database.' } })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid Input.',
        },
      })
    }
    return res.status(500).json({
      error: { message: 'Failed to fetch data from the database.' },
    })
  }
}
