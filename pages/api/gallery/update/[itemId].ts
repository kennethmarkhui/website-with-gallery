import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'

import { authOptions } from 'pages/api/auth/[...nextauth]'
import { prisma } from 'lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (session && session.user.role === 'ADMIN') {
    if (req.method === 'PUT') {
      try {
        const item = await prisma.item.update({
          where: { itemId: req.query.itemId as string },
          data: { name: req.body.name, storage: req.body.storage },
          select: { itemId: true },
        })
        return res
          .status(200)
          .json({ message: `itemId ${item.itemId} has been updated!` })
      } catch (error) {
        return res.status(422).json(error)
      }
    }
  }

  res.status(401).send({
    error: 'You must be an admin to view the protected content.',
  })
}
