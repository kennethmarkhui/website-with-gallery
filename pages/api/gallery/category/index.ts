import type { NextApiRequest, NextApiResponse } from 'next'
import type { Category } from 'prisma/prisma-client'

import type {
  GalleryCategoryResponse,
  GalleryErrorResponse,
} from 'types/gallery'
import { prisma } from 'lib/prisma'

export const fetchCategories = async () => {
  return await prisma.category.findMany({
    select: {
      id: true,
      translations: {
        select: { name: true, language: { select: { code: true } } },
        orderBy: { language: { code: 'asc' } },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryCategoryResponse | GalleryErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
      },
    })
  }

  try {
    const categoriesResponse = await fetchCategories()
    return res.status(200).json(categoriesResponse)
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: 'Failed to fetch data from the database.' } })
  }
}
