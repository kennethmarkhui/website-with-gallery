import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { Category } from 'prisma/prisma-client'

import type { GalleryErrorResponse, GalleryMutateResponse } from 'types/gallery'
import { prisma } from 'lib/prisma'
import { authOptions } from 'lib/auth'
import { z } from 'zod'

const RequestQuerySchema = z.object({ id: z.string() })
const RequestBodySchema = z.object({ name: z.string(), oldName: z.string() })

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryMutateResponse | GalleryErrorResponse>
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({
      error: {
        message: 'You must be an admin to view the protected content.',
      },
    })
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
      },
    })
  }

  const parseQuery = RequestQuerySchema.safeParse(req.query)
  const parsedBody = RequestBodySchema.safeParse(req.body)

  if (!parseQuery.success || !parsedBody.success) {
    return res.status(422).json({
      error: {
        message: 'Invalid Input.',
      },
    })
  }

  const { id } = parseQuery.data
  const { name: newName, oldName } = parsedBody.data

  if (oldName === newName) {
    return res.status(422).json({
      error: {
        message: 'Provide a different value.',
        target: 'category',
      },
    })
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: newName,
      },
    })
    return res
      .status(200)
      .json({ message: `${oldName} was updated to ${newName}.` })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
  return res.status(400).json({ error: { message: 'Something went wrong.' } })
}
