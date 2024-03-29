import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { ZodError, z } from 'zod'

import type { GalleryErrorResponse, GalleryMutateResponse } from 'types/gallery'
import { prisma } from 'lib/prisma'
import { authOptions } from 'lib/auth'

const RequestQuerySchema = z.object({ id: z.string() })

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryMutateResponse | GalleryErrorResponse>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
      },
    })
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({
        error: {
          message: 'You must be an admin to view the protected content.',
        },
      })
    }

    const parsedQuery = RequestQuerySchema.parse(req.query)

    const { id } = parsedQuery

    await prisma.category.delete({
      where: {
        id,
      },
    })
    return res.status(200).json({ message: 'Category has been deleted.' })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(422).json({
        error: {
          message: 'Invalid Input.',
        },
      })
    }
    return res
      .status(400)
      .json({ error: { message: 'Failed to delete. Something went wrong.' } })
  }
}
