'use server'

import { Prisma } from '@prisma/client'

import { getServerAuth } from '@/lib/auth'
import { db, transformTranslationFields } from '@/lib/db'
import { GalleryCategoryFormFieldsSchema } from '@/lib/validations'
import {
  GalleryCategoryFormFields,
  GalleryMutateResponse,
} from '@/types/gallery'

export async function createCategory(
  data: GalleryCategoryFormFields
): Promise<GalleryMutateResponse<GalleryCategoryFormFields>> {
  const session = await getServerAuth()

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('You must be an admin to view the protected content.')
  }

  const parsedBody = GalleryCategoryFormFieldsSchema.safeParse(data)

  if (!parsedBody.success) {
    const errors = parsedBody.error.flatten()
    return { errors }
  }

  const translations = await transformTranslationFields(parsedBody.data, {
    name: true,
  })

  try {
    await db.category.create({
      data: {
        translations: {
          createMany: {
            data: translations,
          },
        },
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[]
        if (target.includes('name')) {
          return {
            errors: { formErrors: ['Values already exist.'] },
          }
        }
      }
      throw new Error('Something went wrong.')
    }
  }
}

export async function deleteCategory(
  id: string
): Promise<GalleryMutateResponse<GalleryCategoryFormFields>> {
  const session = await getServerAuth()

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('You must be an admin to view the protected content.')
  }

  if (typeof id !== 'string') {
    throw new Error('Invalid Input.')
  }

  try {
    await db.category.delete({
      where: {
        id,
      },
    })
  } catch (error) {
    throw new Error('Something went wrong.')
  }
}

export async function updateCategory({
  id,
  name,
}: {
  id: string
  name: GalleryCategoryFormFields['name']
}): Promise<GalleryMutateResponse<GalleryCategoryFormFields>> {
  const session = await getServerAuth()

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('You must be an admin to view the protected content.')
  }

  if (typeof id !== 'string' || !id.length) {
    throw new Error('id is required.')
  }

  const parsedBody = GalleryCategoryFormFieldsSchema.safeParse({ name })

  if (!parsedBody.success) {
    const errors = parsedBody.error.flatten()
    return { errors }
  }

  const translations = await transformTranslationFields(parsedBody.data, {
    name: true,
  })

  try {
    await db.category.update({
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          errors: { formErrors: ['Values already exist.'] },
        }
      }
      throw new Error('Something went wrong.')
    }
  }
}
