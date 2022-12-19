import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'

import type { GalleryMutateResponse, GalleryErrorResponse } from 'types/gallery'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from 'lib/prisma'
import cloudinary from 'lib/cloudinary'
import { isValidRequest } from 'lib/utils'

type RequestQuery = {
  id: string
  publicId?: string
}

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

  if (req.method !== 'DELETE') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
      },
    })
  }

  if (!isValidRequest<RequestQuery>(req.query, ['id', 'publicId'])) {
    return res.status(400).json({
      error: {
        message: 'Provide an id and publicId if it has an image.',
      },
    })
  }

  const { id, publicId } = req.query

  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId)
    }

    const item = await prisma.item.delete({
      where: { id },
      select: {
        id: true,
      },
    })
    return res.status(200).json({ message: `id ${item.id} has been deleted!` })
  } catch (error) {
    return res.status(422).json({
      error: {
        message: `Something went wrong. id ${id} was not deleted.`,
      },
    })
  }
}
