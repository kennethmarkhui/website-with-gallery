import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from 'lib/prisma'
import { OmittedItem } from 'types/gallery'

type Data = OmittedItem | null | { message: string; error: true }

export async function fetchItem(itemId: string): Promise<OmittedItem | null> {
  const res = await prisma.item.findUnique({
    where: { itemId },
    select: { itemId: true, name: true, storage: true },
  })
  return res
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.query.itemId) {
    try {
      const item = await fetchItem(req.query.itemId as string)
      if (item) res.status(200).json(item)
      return res
        .status(404)
        .json({ message: 'Can not find data record in database.', error: true })
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to fetch data from the database.',
        error: true,
      })
    }
  }
  res.status(422).json({ message: 'Please provide an id.', error: true })
}
