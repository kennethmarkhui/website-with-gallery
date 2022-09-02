import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from 'lib/prisma'
import { OmittedItem } from 'types/gallery'

type Data = OmittedItem[] | { message: string; error: boolean }

export async function fetchItems(): Promise<OmittedItem[]> {
  const res = await prisma.item.findMany({
    select: { itemId: true, name: true, storage: true },
  })
  return res
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const items = await fetchItems()
    return res.status(200).json(items)
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch data from the database.', error: true })
  }
}
