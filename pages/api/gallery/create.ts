import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { prisma } from 'lib/prisma'
import { authOptions } from '../auth/[...nextauth]'
import {
  MutateDataResponse,
  ErrorResponse,
  FormValues,
  OmittedItemKeys,
} from 'types/gallery'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MutateDataResponse | ErrorResponse>
) {
  const session = await unstable_getServerSession(req, res, authOptions)
  let { itemId: reqItemId } = req.body as FormValues

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
        if (error instanceof PrismaClientKnownRequestError) {
          // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
          if (error.code === 'P2002') {
            const target = error.meta?.target as OmittedItemKeys[]
            if (target.includes('itemId')) {
              return res.status(422).json({
                error: {
                  target: 'itemId',
                  message: `"${reqItemId}" already exist.`,
                },
              })
            }
          }
          return res.status(422).json({
            error: {
              message: `Something went wrong. ErrorCode: ${error.code}`,
            },
          })
        }
        // console.log(error)
        return res
          .status(400)
          .json({ error: { message: 'Something went wrong.' } })
      }
    }
  }

  res.status(401).json({
    error: {
      message: 'You must be an admin to view the protected content.',
    },
  })
}
