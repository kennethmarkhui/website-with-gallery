import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import type {
  GalleryMutateResponse,
  GalleryErrorResponse,
  GalleryFormFields,
} from 'types/gallery'
import { prisma } from 'lib/prisma'
import cloudinary from 'lib/cloudinary'
import { FormidableError, formidableOptions, parseForm } from 'lib/formidable'
import { formatBytes, isValidRequest } from 'lib/utils'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { fetchImage } from '../[id]'

export const config = {
  api: {
    bodyParser: false,
  },
}

type RequestQuery = {
  id: string
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

  if (req.method !== 'PUT') {
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

  let formData
  try {
    formData = await parseForm(req)
  } catch (error) {
    if (error instanceof FormidableError) {
      if (error.httpCode === 413) {
        return res.status(413).json({
          error: {
            target: 'image',
            message: `Must not exceed ${formatBytes(
              formidableOptions.maxFileSize!
            )}.`,
          },
        })
      }
      return res.status(400).json({
        error: {
          message: 'Something went wrong with parsing formdata.',
        },
      })
    }
  }

  if (!formData)
    return res.status(400).json({ error: { message: 'Something went wrong.' } })

  if (
    !isValidRequest<Omit<GalleryFormFields, 'id' | 'image'>>(formData.fields, [
      'name',
      'storage',
      'category',
    ])
  ) {
    return res.status(400).json({
      error: {
        message: 'Missing Fields.',
      },
    })
  }

  const {
    fields: { name, storage, category },
    files: { image },
  } = formData

  let cloudinaryResponse
  try {
    if (image) {
      const filepath = Array.isArray(image)
        ? image.map((f) => f.filepath)
        : image.filepath

      if (typeof filepath === 'string') {
        cloudinaryResponse = await cloudinary.uploader.upload(filepath, {
          folder: process.env.CLOUDINARY_FOLDER,
        })
      }

      const existingImage = await fetchImage(req.query.id) // return null if no image
      if (!!existingImage) {
        await cloudinary.uploader.destroy(existingImage.publicId)
      }
    }

    const item = await prisma.item.update({
      where: { id: req.query.id },
      data: {
        name: name !== '' ? name : null,
        storage: storage !== '' ? storage : null,
        ...(category
          ? {
              category: {
                connect: {
                  name: category,
                },
              },
            }
          : {
              category: {
                disconnect: true,
              },
            }),
        ...(cloudinaryResponse && {
          image: {
            upsert: {
              create: {
                url: cloudinary.url(cloudinaryResponse.public_id, {
                  fetch_format: 'auto',
                  quality: 'auto',
                }),
                publicId: cloudinaryResponse.public_id,
                width: cloudinaryResponse.width,
                height: cloudinaryResponse.height,
              },
              update: {
                url: cloudinary.url(cloudinaryResponse.public_id, {
                  fetch_format: 'auto',
                  quality: 'auto',
                }),
                publicId: cloudinaryResponse.public_id,
                width: cloudinaryResponse.width,
                height: cloudinaryResponse.height,
              },
            },
          },
        }),
      },
      select: { id: true },
    })
    return res.status(200).json({ message: `id ${item.id} has been updated!` })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return res.status(400).json({
        error: {
          message: 'Something went wrong with prisma.',
        },
      })
    }
    return res.status(422).json({
      error: {
        message: `Something went wrong. id ${req.query.id} was not updated.`,
      },
    })
  }
}
