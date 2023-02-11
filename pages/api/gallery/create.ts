import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import type {
  GalleryMutateResponse,
  GalleryErrorResponse,
  GalleryFormKeys,
  GalleryFormFields,
} from 'types/gallery'
import { authOptions } from '../auth/[...nextauth]'
import cloudinary from 'lib/cloudinary'
import { prisma } from 'lib/prisma'
import { FormidableError, formidableOptions, parseForm } from 'lib/formidable'
import { formatBytes, isValidRequest } from 'lib/utils'

export const config = {
  api: {
    bodyParser: false,
  },
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

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
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
    !isValidRequest<Omit<GalleryFormFields, 'image'>>(formData.fields, [
      'id',
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
    fields: { id, name, storage, category },
    files: { image },
  } = formData

  if (id === '') {
    return res.status(422).json({
      error: {
        target: 'id',
        message: 'id is required.',
      },
    })
  }

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
    }

    const item = await prisma.item.create({
      data: {
        id,
        name: name !== '' ? name : null,
        storage: storage !== '' ? storage : null,
        ...(category && {
          category: {
            connect: {
              name: category,
            },
          },
        }),
        ...(cloudinaryResponse && {
          image: {
            create: {
              url: cloudinary.url(cloudinaryResponse.public_id, {
                // https://cloudinary.com/documentation/image_transformations#delivering_optimized_and_responsive_mediahttps://cloudinary.com/documentation/image_transformations#delivering_optimized_and_responsive_media
                fetch_format: 'auto',
                quality: 'auto',
              }),
              publicId: cloudinaryResponse.public_id,
              width: cloudinaryResponse.width,
              height: cloudinaryResponse.height,
            },
          },
        }),
      },
      select: {
        id: true,
      },
    })
    return res.status(201).json({ message: `id ${item.id} has been created!` })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
      if (error.code === 'P2002') {
        const target = error.meta?.target as GalleryFormKeys[]
        if (target.includes('id')) {
          // DESTROY CLOUDINARY IMAGE UPLOADED IF PRISMA FAILS
          if (cloudinaryResponse) {
            await cloudinary.uploader.destroy(cloudinaryResponse.public_id)
          }
          return res.status(422).json({
            error: {
              target: 'id',
              message: `"${id}" already exist.`,
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
    return res.status(400).json({ error: { message: 'Something went wrong.' } })
  }
}
