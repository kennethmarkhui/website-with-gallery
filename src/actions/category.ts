'use server'

import { db } from '@/lib/db'

export async function getCategories() {
  return await db.category.findMany({
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
