import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'

import type { MutateDataResponse, ErrorResponse } from 'types/gallery'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from 'lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MutateDataResponse | ErrorResponse>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (session && session.user.role === 'ADMIN') {
    if (req.method === 'DELETE' && req.query.itemId) {
      try {
        const item = await prisma.item.delete({
          where: { itemId: req.query.itemId as string },
          select: {
            itemId: true,
          },
        })
        return res
          .status(200)
          .json({ message: `itemId ${item.itemId} has been deleted!` })
      } catch (error) {
        return res.status(422).json({
          error: {
            message: `Something went wrong. itemId ${req.query.itemId} was not deleted.`,
          },
        })
      }
    }
  }

  res.status(401).json({
    error: {
      message: 'You must be an admin to view the protected content.',
    },
  })
}
