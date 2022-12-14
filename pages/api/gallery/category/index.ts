import type { NextApiRequest, NextApiResponse } from 'next'
import { Category } from 'prisma/prisma-client'

import type { GalleryErrorResponse } from 'types/gallery'
import { prisma } from 'lib/prisma'

export const fetchCategories = async (): Promise<
  Pick<Category, 'id' | 'name'>[]
> => {
  return await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Pick<Category, 'id' | 'name'>[] | GalleryErrorResponse>
) {
  try {
    const categoriesResponse = await fetchCategories()
    return res.status(200).json(categoriesResponse)
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: 'Failed to fetch data from the database.' } })
  }
}
