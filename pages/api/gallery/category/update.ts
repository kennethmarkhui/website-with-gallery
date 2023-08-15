import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { ZodError, z } from 'zod'

import type { GalleryErrorResponse, GalleryMutateResponse } from 'types/gallery'
import { prisma, transformTranslationFields } from 'lib/prisma'
import { authOptions } from 'lib/auth'
import { GalleryCategoryFormFieldsSchema } from 'lib/validations'

const RequestQuerySchema = z.object({ id: z.string() })

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

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({
        error: {
          message: 'You must be an admin to view the protected content.',
        },
      })
    }

    const parseQuery = RequestQuerySchema.parse(req.query)
    const parsedBody = GalleryCategoryFormFieldsSchema.parse(req.body)

    const { id } = parseQuery

    const translations = await transformTranslationFields(parsedBody, {
      name: true,
    })

    await prisma.category.update({
      where: { id },
      data: {
        translations: {
          deleteMany: {
            // https://github.com/prisma/prisma/issues/2255#issuecomment-683811551
            categoryId: id,
            NOT: translations.map(({ languageId }) => ({ languageId })),
          },
          upsert: translations.map(({ languageId, name }) => ({
            where: { languageId_categoryId: { categoryId: id, languageId } },
            create: { name, languageId },
            update: { name, languageId },
          })),
        },
      },
    })

    return res.status(200).json({ message: 'Category was updated.' })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(422).json({
        error: {
          message: 'Invalid Input.',
        },
      })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
      if (error.code === 'P2002') {
        return res.status(422).json({
          error: {
            message: 'Values already exist.',
            target: 'category',
          },
        })
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
