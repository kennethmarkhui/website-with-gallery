import type { NextApiRequest, NextApiResponse } from 'next'
import { Item } from 'prisma/prisma-client'
import { prisma } from 'lib/prisma'

export type OmittedItem = Omit<Item, 'id' | 'dateAdded'>

export async function fetchItems(): Promise<OmittedItem[]> {
  const res = await prisma.item.findMany({
    select: { itemId: true, name: true, storage: true },
  })
  return res
}

export async function fetchItem(itemId: string): Promise<OmittedItem | null> {
  const res = await prisma.item.findUnique({
    where: { itemId },
    select: { itemId: true, name: true, storage: true },
  })
  return res
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OmittedItem[] | { error: string }>
) {
  try {
    const items = await fetchItems()
    return res.status(200).json(items)
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Failed to fetch data from the database.' })
  }
}
