import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from 'prisma/prisma-client'
import { ZodError } from 'zod'

import type {
  GalleryCursorQuery,
  GalleryErrorResponse,
  GalleryResponse,
} from 'types/gallery'
import { prisma } from 'lib/prisma'
import { GalleryCursorQuerySchema } from 'lib/validations'
import { GALLERY_LIMIT, GALLERY_ORDER_BY_DIRECTION } from 'constants/gallery'

export async function fetchItem(id: string) {
  return await prisma.item.findUnique({
    where: { id },
    select: {
      id: true,
      image: {
        select: {
          url: true,
          width: true,
          height: true,
        },
      },
    },
  })
}

export async function fetchItems({
  nextCursor,
  search,
  category,
  orderBy: orderByFilter,
}: GalleryCursorQuery) {
  // https://github.com/prisma/prisma/discussions/4888#discussioncomment-403826
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

  const items = await prisma.item.findMany({
    where,
    take: GALLERY_LIMIT,
    skip: nextCursor === '0' ? 0 : 1,
    cursor: nextCursor === '0' ? undefined : { id: nextCursor },
    select: {
      id: true,
      image: {
        select: {
          url: true,
          width: true,
          height: true,
        },
      },
    },
    orderBy,
  })

  return {
    items,
    nextCursor:
      items.length === GALLERY_LIMIT ? items[GALLERY_LIMIT - 1].id : undefined,
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryResponse | GalleryErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
      },
    })
  }

  try {
    const parsedGalleryCursorQuery = GalleryCursorQuerySchema.parse(req.query)

    const data = await fetchItems(parsedGalleryCursorQuery)

    return res.status(200).json(data)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(422).json({ error: { message: 'Invalid Input.' } })
    }
    return res
      .status(500)
      .json({ error: { message: 'Failed to fetch data from the database.' } })
  }
}
