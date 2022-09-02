import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'

import { prisma } from 'lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

type Data = {
  message: string
  error?: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (session && session.user.role === 'ADMIN') {
    if (req.method === 'POST') {
      try {
        const item = await prisma.item.create({
          data: {
            ...req.body,
          },
          select: {
            itemId: true,
            name: true,
            storage: true,
          },
        })
        return res
          .status(201)
          .json({ message: `itemId ${item.itemId} has been created!` })
      } catch (error) {
        return res.status(422).json({
          message: `Something went wrong. itemId ${req.query.itemId} was not created.`,
          error: true,
        })
      }
    }
  }

  res.status(401).json({
    message: 'You must be an admin to view the protected content.',
    error: true,
  })
}
