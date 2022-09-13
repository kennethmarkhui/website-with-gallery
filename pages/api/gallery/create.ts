import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import type {
  GalleryMutateResponse,
  GalleryErrorResponse,
  GalleryFormKeys,
} from 'types/gallery'
import { authOptions } from '../auth/[...nextauth]'
import cloudinary from 'lib/cloudinary'
import { prisma } from 'lib/prisma'
import { FormidableError, formidableOptions, parseForm } from 'lib/formidable'
import { formatBytes } from 'lib/utils'

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

  if (req.method === 'POST') {
    try {
      const {
        fields,
        files: { image }, // image from type GalleryForm
      } = await parseForm(req)

      if (fields.id === '') {
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
          cloudinaryResponse = await cloudinary.uploader.upload(
            filepath as string,
            {
              folder: process.env.CLOUDINARY_FOLDER,
            }
          )

          const item = await prisma.item.create({
            data: {
              id: fields.id as string,
              name: fields.name ? (fields.name as string) : null,
              storage: fields.storage ? (fields.storage as string) : null,
              ...(fields.category !== '' && {
                categoryRelation: {
                  connect: {
                    name: fields.category
                      ? (fields.category as string)
                      : undefined,
                  },
                },
              }),
              image: {
                create: {
                  url: cloudinaryResponse.secure_url,
                  publicId: cloudinaryResponse.public_id,
                  width: cloudinaryResponse.width,
                  height: cloudinaryResponse.height,
                },
              },
            },
            select: {
              id: true,
            },
          })
          return res
            .status(201)
            .json({ message: `id ${item.id} has been created!` })
        }

        const item = await prisma.item.create({
          data: {
            id: fields.id as string,
            name: fields.name ? (fields.name as string) : null,
            storage: fields.storage ? (fields.storage as string) : null,
            ...(fields.category !== '' && {
              categoryRelation: {
                connect: {
                  name: fields.category
                    ? (fields.category as string)
                    : undefined,
                },
              },
            }),
          },
          select: {
            id: true,
          },
        })
        return res
          .status(201)
          .json({ message: `id ${item.id} has been created!` })
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
          if (error.code === 'P2002') {
            const target = error.meta?.target as GalleryFormKeys[]
            if (target.includes('id')) {
              // DESTROY CLOUDINARY IMAGE UPLOADED IF PRISMA FAILS
              if (image) {
                await cloudinary.uploader.destroy(
                  cloudinaryResponse?.public_id as string
                )
              }
              return res.status(422).json({
                error: {
                  target: 'id',
                  message: `"${fields.id}" already exist.`,
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
        // console.log(error)
        return res
          .status(400)
          .json({ error: { message: 'Something went wrong.' } })
      }
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
    }
  }
}
