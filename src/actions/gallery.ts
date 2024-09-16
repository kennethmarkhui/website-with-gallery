'use server'

import { Prisma } from 'prisma/prisma-client'

import { GALLERY_LIMIT, GALLERY_ORDER_BY_DIRECTION } from '@/constants/gallery'
import { db } from '@/lib/db'
import type { GalleryCursorQuery } from '@/types/gallery'

export async function getItem(id: string) {
  return await db.item.findUnique({
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

export async function getItems({
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

  const items = await db.item.findMany({
    where,
    take: GALLERY_LIMIT,
    skip: nextCursor ? 1 : 0,
    cursor: nextCursor ? { id: nextCursor } : undefined,
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
