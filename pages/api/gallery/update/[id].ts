import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

import type { GalleryMutateResponse, GalleryErrorResponse } from 'types/gallery'
import { prisma, transformTranslationFields } from 'lib/prisma'
import cloudinary from 'lib/cloudinary'
import { formidableOptions, parseForm } from 'lib/formidable'
import { formatBytes } from 'lib/utils'
import { authOptions } from 'lib/auth'
import { GalleryFormFieldsSchema } from 'lib/validations'
import { fetchImage } from '../[id]'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryMutateResponse | GalleryErrorResponse>
) {
  if (req.method !== 'PUT') {
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

    const parsedQuery = GalleryFormFieldsSchema.pick({ id: true }).parse(
      req.query
    )

    const { id } = parsedQuery

    const formData = await parseForm(req)

    const jsonData = formData.fields?.data

    const parsedFormData = GalleryFormFieldsSchema.omit({
      id: true,
      image: true,
    }).parse(jsonData && jsonData.length && JSON.parse(jsonData[0]))

    const { name, storage, category } = parsedFormData

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

    const previousImage = await fetchImage(id)

    await prisma.item.update({
      where: { id },
      data: {
        translations: {
          deleteMany: {
            itemId: id,
            NOT: translations.map(({ languageId }) => ({ languageId })),
          },
          upsert: translations.map((translation) => ({
            where: {
              languageId_itemId: {
                itemId: id,
                languageId: translation.languageId,
              },
            },
            create: translation,
            update: translation,
          })),
        },
        ...(category
          ? {
              category: {
                connect: {
                  id: category,
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

    if (previousImage) {
      // TODO: rollback the updated item if this failed
      await cloudinary.uploader.destroy(previousImage.publicId)
    }

    return res.status(200).json({ message: `id ${id} has been updated!` })
  } catch (error) {
    if (
      // TODO: use instanceof FormidableError when the type is fixed @typed/formidable
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'httpCode' in error
    ) {
      if (error.code === 413) {
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
      return res.status(400).json({
        error: {
          message: 'Something went wrong saving to database.',
        },
      })
    }
    return res.status(400).json({
      error: {
        message: `Something went wrong. id ${req.query.id} was not updated.`,
      },
    })
  }
}
