import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { ZodError, z } from 'zod'

import type { GalleryMutateResponse, GalleryErrorResponse } from 'types/gallery'
import { prisma } from 'lib/prisma'
import cloudinary from 'lib/cloudinary'
import { authOptions } from 'lib/auth'
import { GalleryFormFieldsSchema } from 'lib/validations'

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

    // TODO: publicId must be provided if the item to be deleted have an image.
    const parsedQuery = GalleryFormFieldsSchema.pick({ id: true })
      .extend({
        publicId: z.string().optional(),
      })
      .parse(req.query)

    const { id, publicId } = parsedQuery

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
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid Input.',
        },
      })
    }
    return res.status(422).json({
      error: {
        message: `Something went wrong.`,
      },
    })
  }
}
