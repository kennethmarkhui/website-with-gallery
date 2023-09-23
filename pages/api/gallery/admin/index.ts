import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { Prisma } from 'prisma/prisma-client'
import { ZodError } from 'zod'

import type {
  GalleryAdminResponse,
  GalleryErrorResponse,
  GalleryOffsetQuery,
} from 'types/gallery'
import { authOptions } from 'lib/auth'
import { prisma } from 'lib/prisma'
import { GalleryOffsetQuerySchema } from 'lib/validations'
import { GALLERY_LIMIT, GALLERY_ORDER_BY_DIRECTION } from 'constants/gallery'

export async function fetchAdminItems({
  page,
  search,
  category,
  orderBy: orderByFilter,
}: GalleryOffsetQuery) {
  const orderBy = (
    orderByFilter
      ? orderByFilter.startsWith('id')
        ? Object.fromEntries([orderByFilter.split(',')])
        : [
            Object.fromEntries([orderByFilter.split(',')]),
            { id: GALLERY_ORDER_BY_DIRECTION },
          ]
      : [
          { updatedAt: GALLERY_ORDER_BY_DIRECTION },
          { id: GALLERY_ORDER_BY_DIRECTION },
        ]
  ) satisfies Prisma.Enumerable<Prisma.ItemOrderByWithRelationInput>

  const where = {
    AND: [
      { id: { contains: search, mode: 'insensitive' } },
      {
        category: category ? { id: { in: category.split(',') } } : undefined,
      },
    ],
  } satisfies Prisma.ItemWhereInput

  const [items, totalCount] = await prisma.$transaction([
    prisma.item.findMany({
      where,
      take: GALLERY_LIMIT,
      ...(page ? { skip: (+page - 1) * GALLERY_LIMIT } : {}),
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
      orderBy,
    }),
    prisma.item.count({
      where,
    }),
  ])

  return {
    items: items.map((item) => ({
      ...item,
      category: item.category?.id ?? null,
    })),
    totalCount,
    page: page ?? '1',
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryAdminResponse | GalleryErrorResponse>
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

    const parsedGalleryOffsetQuery = GalleryOffsetQuerySchema.parse(req.query)

    const { items, page, totalCount } = await fetchAdminItems(
      parsedGalleryOffsetQuery
    )

    return res.status(200).json({ items, page, totalCount })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(422).json({ error: { message: 'Invalid Input.' } })
    }
    return res
      .status(500)
      .json({ error: { message: 'Failed to fetch data from the database.' } })
  }
}
