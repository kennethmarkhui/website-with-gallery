import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from 'lib/prisma'
import { ErrorResponse, OmittedItem } from 'types/gallery'

export async function fetchItem(itemId: string): Promise<OmittedItem | null> {
  const res = await prisma.item.findUnique({
    where: { itemId },
    select: { itemId: true, name: true, storage: true },
  })
  return res
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OmittedItem | null | ErrorResponse>
) {
  if (req.query.itemId) {
    try {
      const item = await fetchItem(req.query.itemId as string)
      if (item) res.status(200).json(item)
      return res
        .status(404)
        .json({ error: { message: 'Can not find data record in database.' } })
    } catch (error) {
      return res.status(500).json({
        error: { message: 'Failed to fetch data from the database.' },
      })
    }
  }
  res.status(422).json({ error: { message: 'Please provide an id.' } })
}
