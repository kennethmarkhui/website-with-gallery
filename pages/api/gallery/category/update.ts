import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { Category } from 'prisma/prisma-client'

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

  const { id } = req.query
  const { name: newName, oldName } = req.body

  if (oldName === newName) {
    return res.status(422).json({
      error: {
        message: 'Provide a different value.',
        target: 'category',
      },
    })
  }

  if (req.method === 'PUT') {
    try {
      await prisma.category.update({
        where: { id: id as string },
        data: {
          name: newName,
        },
      })
      return res
        .status(200)
        .json({ message: `${oldName} was updated to ${newName}.` })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
        if (error.code === 'P2002') {
          const target = error.meta?.target as keyof Pick<Category, 'name'>
          if (target.includes('name')) {
            return res.status(422).json({
              error: {
                message: `"${newName}" already exist.`,
                target: 'category',
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
