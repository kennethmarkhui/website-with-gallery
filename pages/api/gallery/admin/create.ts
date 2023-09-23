import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

import type { GalleryMutateResponse, GalleryErrorResponse } from 'types/gallery'
import cloudinary from 'lib/cloudinary'
import { prisma, transformTranslationFields } from 'lib/prisma'
import { formidableOptions, parseForm } from 'lib/formidable'
import { formatBytes } from 'lib/utils'
import { authOptions } from 'lib/auth'
import { GalleryFormFieldsSchema } from 'lib/validations'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryMutateResponse | GalleryErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        message: 'Invalid Method.',
      },
    })
  }

  let cloudinaryResponse
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({
        error: {
          message: 'You must be an admin to view the protected content.',
        },
      })
    }

    const formData = await parseForm(req)

    const jsonData = formData.fields?.data

    const parsedFormData = GalleryFormFieldsSchema.omit({
      image: true,
    }).parse(jsonData && jsonData.length && JSON.parse(jsonData[0]))

    const { id, name, storage, category } = parsedFormData

    const {
      files: { image },
    } = formData

    if (image && image[0]) {
      const filepath = image[0].filepath

      cloudinaryResponse = await cloudinary.uploader.upload(filepath, {
        folder:
          process.env.NODE_ENV === 'development'
            ? process.env.CLOUDINARY_DEV_FOLDER
            : process.env.CLOUDINARY_FOLDER,
      })
    }

    const translationFields = { name, storage }
    const translations = await transformTranslationFields(translationFields)

    // TODO: https://github.com/prisma/prisma/issues/4246 remove unnecessary select
    await prisma.item.create({
      data: {
        id,
        translations: { createMany: { data: translations } },
        ...(category && {
          category: {
            connect: {
              id: category,
            },
          },
        }),
        ...(cloudinaryResponse && {
          image: {
            create: {
              url: cloudinary.url(cloudinaryResponse.public_id, {
                // https://cloudinary.com/documentation/image_transformations#delivering_optimized_and_responsive_media
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

    return res.status(201).json({ message: `id ${id} has been created!` })
  } catch (error) {
    if (
      // TODO: use instanceof FormidableError when the type is fixed @typed/formidable
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'httpCode' in error
    ) {
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
          message: 'Something went wrong while parsing the data.',
        },
      })
    }
    if (error instanceof ZodError) {
      return res.status(422).json({
        error: {
          message: 'Invalid Fields.',
        },
      })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (cloudinaryResponse) {
        await cloudinary.uploader.destroy(cloudinaryResponse.public_id)
      }
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
      if (error.code === 'P2002') {
        const target = error.meta?.target
        if (Array.isArray(target) && target.includes('id')) {
          return res.status(422).json({
            error: {
              target: 'id',
              message: 'server_error_exist',
            },
          })
        }
      }
      return res.status(400).json({
        error: {
          message: 'Something went wrong saving to database.',
        },
      })
    }
    return res.status(400).json({ error: { message: 'Something went wrong.' } })
  }
}
