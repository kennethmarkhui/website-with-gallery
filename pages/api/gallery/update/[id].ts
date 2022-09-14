import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import type { GalleryMutateResponse, GalleryErrorResponse } from 'types/gallery'
import { prisma } from 'lib/prisma'
import cloudinary from 'lib/cloudinary'
import { FormidableError, formidableOptions, parseForm } from 'lib/formidable'
import { formatBytes } from 'lib/utils'
import { authOptions } from 'pages/api/auth/[...nextauth]'
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
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({
      error: {
        message: 'You must be an admin to view the protected content.',
      },
    })
  }

  if (req.method === 'PUT' && req.query.id) {
    try {
      const {
        fields,
        files: { image },
      } = await parseForm(req)

      let cloudinaryResponse
      if (image) {
        const filepath = Array.isArray(image)
          ? image.map((f) => f.filepath)
          : image.filepath

        cloudinaryResponse = await cloudinary.uploader.upload(
          filepath as string,
          {
            folder: process.env.CLOUDINARY_FOLDER,
          }
        )

        const existingImage = await fetchImage(fields.id as string) // return null if no image
        if (!!existingImage) {
          await cloudinary.uploader.destroy(existingImage.publicId)
        }

        const item = await prisma.item.update({
          where: { id: fields.id as string },
          data: {
            name: fields.name ? (fields.name as string) : null,
            storage: fields.storage ? (fields.storage as string) : null,
            ...(fields.category !== ''
              ? {
                  categoryRelation: {
                    connect: {
                      name: fields.category
                        ? (fields.category as string)
                        : undefined,
                    },
                  },
                }
              : {
                  categoryRelation: {
                    disconnect: true,
                  },
                }),
            image: {
              upsert: {
                create: {
                  url: cloudinaryResponse.secure_url,
                  publicId: cloudinaryResponse.public_id,
                  width: cloudinaryResponse.width,
                  height: cloudinaryResponse.height,
                },
                update: {
                  url: cloudinaryResponse.secure_url,
                  publicId: cloudinaryResponse.public_id,
                  width: cloudinaryResponse.width,
                  height: cloudinaryResponse.height,
                },
              },
            },
          },
          select: { id: true },
        })
        return res
          .status(200)
          .json({ message: `id ${item.id} has been updated!` })
      }

      // NO IMAGE PROVIDED
      const item = await prisma.item.update({
        where: { id: fields.id as string },
        data: {
          name: fields.name ? (fields.name as string) : null,
          storage: fields.storage ? (fields.storage as string) : null,
          ...(fields.category !== ''
            ? {
                categoryRelation: {
                  connect: {
                    name: fields.category
                      ? (fields.category as string)
                      : undefined,
                  },
                },
              }
            : {
                categoryRelation: {
                  disconnect: true,
                },
              }),
        },
        select: { id: true },
      })
      return res
        .status(200)
        .json({ message: `id ${item.id} has been updated!` })
    } catch (error) {
      if (error instanceof FormidableError) {
        if (error.httpCode === 413) {
          return res.status(413).json({
            error: {
              target: 'image',
              message: `Must not exceed ${formatBytes(
                formidableOptions.maxFileSize
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
  res.status(400).json({
    error: {
      message: 'Something went wrong.',
    },
  })
}