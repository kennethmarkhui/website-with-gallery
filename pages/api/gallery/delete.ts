import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'

import type { GalleryMutateResponse, GalleryErrorResponse } from 'types/gallery'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from 'lib/prisma'
import cloudinary from 'lib/cloudinary'

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

  if (req.method === 'DELETE' && req.query.itemId) {
    try {
      if (req.query.publicId) {
        await cloudinary.uploader.destroy(req.query.publicId as string)
      }

      const item = await prisma.item.delete({
        where: { itemId: req.query.itemId as string },
        select: {
          itemId: true,
        },
      })
      return res
        .status(200)
        .json({ message: `itemId ${item.itemId} has been deleted!` })
    } catch (error) {
      return res.status(422).json({
        error: {
          message: `Something went wrong. itemId ${req.query.itemId} was not deleted.`,
        },
      })
    }
  }
  res.status(400).json({
    error: {
      message: 'Something went wrong.',
    },
  })
}
