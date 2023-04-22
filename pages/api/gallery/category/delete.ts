import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import type { GalleryErrorResponse, GalleryMutateResponse } from 'types/gallery'
import { prisma } from 'lib/prisma'
import { isValidRequest } from 'lib/utils'
import { authOptions } from 'lib/auth'

type RequestQuery = {
  id: string
}

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

  if (req.method !== 'DELETE') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
      },
    })
  }

  if (!isValidRequest<RequestQuery>(req.query, ['id'])) {
    return res.status(400).json({
      error: {
        message: 'Provide an id.',
      },
    })
  }

  const { id } = req.query

  try {
    const deleteResponse = await prisma.category.delete({
      where: {
        id,
      },
      select: {
        name: true,
      },
    })
    return res
      .status(200)
      .json({ message: `${deleteResponse.name} has been deleted.` })
  } catch (error) {
    return res
      .status(400)
      .json({ error: { message: 'Failed to delete. Something went wrong.' } })
  }
}
