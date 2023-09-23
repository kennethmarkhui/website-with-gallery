import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

import type { GalleryErrorResponse, GalleryMutateResponse } from 'types/gallery'
import { prisma, transformTranslationFields } from 'lib/prisma'
import { authOptions } from 'lib/auth'
import { GalleryCategoryFormFieldsSchema } from 'lib/validations'

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

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({
        error: {
          message: 'You must be an admin to view the protected content.',
        },
      })
    }

    const parsedBody = GalleryCategoryFormFieldsSchema.parse(req.body)

    const translations = await transformTranslationFields(parsedBody, {
      name: true,
    })

    await prisma.category.create({
      data: {
        translations: {
          createMany: {
            data: translations,
          },
        },
      },
    })
    return res.status(201).json({ message: 'Category has been created.' })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(422).json({
        error: {
          message: 'Invalid Input.',
        },
      })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[]
        if (target.includes('name')) {
          return res.status(422).json({
            error: {
              message: 'Values already exist.',
              target: 'category',
            },
          })
        }
      }
      return res.status(422).json({
        error: {
          message: 'Something went wrong saving to database.',
        },
      })
    }
  }
  return res.status(400).json({ error: { message: 'Something went wrong.' } })
}
