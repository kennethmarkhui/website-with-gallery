import type { NextApiRequest, NextApiResponse } from 'next'

import type { ErrorResponse, OmittedItem } from 'types/gallery'
import { prisma } from 'lib/prisma'

export async function fetchItems(): Promise<OmittedItem[]> {
  const res = await prisma.item.findMany({
    select: { itemId: true, name: true, storage: true },
  })
  return res
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OmittedItem[] | ErrorResponse>
) {
  try {
    const items = await fetchItems()
    return res.status(200).json(items)
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: 'Failed to fetch data from the database.' } })
  }
}
