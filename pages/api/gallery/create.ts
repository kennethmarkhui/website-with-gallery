import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { Item } from 'prisma/prisma-client'

import { prisma } from 'lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

type Data =
  | Item
  | {
      error: string
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
        })
        return res.status(201).json(item)
      } catch (error) {
        return res.status(422).json(error as any)
      }
    }
  }

  res.send({
    error: 'You must be an admin to view the protected content.',
  })
}
