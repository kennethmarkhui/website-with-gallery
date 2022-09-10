import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import type { GalleryErrorResponse, GalleryMutateResponse } from 'types/gallery'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { prisma } from 'lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryMutateResponse | GalleryErrorResponse>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({
      error: {
        message: 'You must be an admin to view the protected content.',
      },
    })
  }

  const { category } = req.body

  if (category === '') {
    return res.status(422).json({
      error: {
        message: 'Empty string is not allowed.',
      },
    })
  }

  if (req.method === 'POST') {
    try {
      await prisma.category.create({
        data: {
          name: category,
        },
      })
      return res.status(201).json({ message: 'posted' })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[]
          if (target.includes('name')) {
            return res.status(422).json({
              error: {
                target: 'category',
                message: `"${category}" already exist.`,
              },
            })
          }
        }
        return res.status(422).json({
          error: {
            message: 'Something went wrong with prisma.',
          },
        })
      }
    }
  }
  return res.status(400).json({ error: { message: 'Something went wrong.' } })
}
