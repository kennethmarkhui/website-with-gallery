'use server'

import { Prisma } from 'prisma/prisma-client'
import { z } from 'zod'

import { GALLERY_LIMIT, GALLERY_ORDER_BY_DIRECTION } from '@/constants/gallery'
import { getServerAuth } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'
import { db, transformTranslationFields } from '@/lib/db'
import { fileToBase64 } from '@/lib/utils'
import { GalleryFormFieldsSchema } from '@/lib/validations'
import type {
  GalleryFormFields,
  GalleryMutateResponse,
  GalleryOffsetQuery,
} from '@/types/gallery'

export async function getAdminItems({
  page,
  search,
  category,
  orderBy: orderByFilter,
}: GalleryOffsetQuery) {
  const session = await getServerAuth()

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('You must be an admin to view the protected content.')
  }

  const orderBy = (
    orderByFilter
      ? orderByFilter.startsWith('id')
        ? Object.fromEntries([orderByFilter.split(',')])
        : [
            Object.fromEntries([orderByFilter.split(',')]),
            { id: GALLERY_ORDER_BY_DIRECTION },
          ]
      : [
          { updatedAt: GALLERY_ORDER_BY_DIRECTION },
          { id: GALLERY_ORDER_BY_DIRECTION },
        ]
  ) satisfies Prisma.Enumerable<Prisma.ItemOrderByWithRelationInput>

  const where = {
    AND: [
      { id: { contains: search, mode: 'insensitive' } },
      {
        category: category ? { id: { in: category.split(',') } } : undefined,
      },
    ],
  } satisfies Prisma.ItemWhereInput

  const [items, totalCount] = await db.$transaction([
    db.item.findMany({
      where,
      take: GALLERY_LIMIT,
      ...(page ? { skip: (+page - 1) * GALLERY_LIMIT } : {}),
      select: {
        id: true,
        category: { select: { id: true } },
        image: {
          select: {
            url: true,
            publicId: true,
            width: true,
            height: true,
          },
        },
        translations: {
          select: {
            name: true,
            storage: true,
            language: { select: { code: true } },
          },
        },
        dateAdded: true,
        updatedAt: true,
      },
      orderBy,
    }),
    db.item.count({
      where,
    }),
  ])

  return {
    items: items.map((item) => ({
      ...item,
      category: item.category?.id ?? null,
    })),
    totalCount,
    page: page ?? '1',
  }
}

export async function getAdminItem(id: string) {
  const session = await getServerAuth()

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('You must be an admin to view the protected content.')
  }

  const data = await db.item.findUnique({
    where: { id },
    select: {
      id: true,
      category: { select: { id: true } },
      image: {
        select: {
          url: true,
          publicId: true,
          width: true,
          height: true,
        },
      },
      translations: {
        select: {
          name: true,
          storage: true,
          language: { select: { code: true } },
        },
      },
      dateAdded: true,
      updatedAt: true,
    },
  })

  return data ? { ...data, category: data.category?.id ?? null } : null
}

async function getImage(id: string) {
  return await db.image.findFirst({
    where: { itemId: id },
    select: {
      url: true,
      publicId: true,
    },
  })
}

export async function createItem(
  formData: FormData
): Promise<GalleryMutateResponse<GalleryFormFields>> {
  const session = await getServerAuth()

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('You must be an admin to view the protected content.')
  }

  const jsonData = formData.get('data')

  const parsedFormData = GalleryFormFieldsSchema.safeParse({
    image: formData.getAll('images'),
    ...(jsonData && typeof jsonData === 'string' && JSON.parse(jsonData)),
  })

  if (!parsedFormData.success) {
    const errors = parsedFormData.error.flatten()
    return { errors }
  }

  const { image, id, name, storage, category } = parsedFormData.data

  let cloudinaryResponse
  try {
    if (image && image.length) {
      const fileUri = await fileToBase64(image[0])

      cloudinaryResponse = await cloudinary.uploader.upload(fileUri, {
        folder:
          process.env.NODE_ENV === 'development'
            ? process.env.CLOUDINARY_DEV_FOLDER
            : process.env.CLOUDINARY_FOLDER,
      })
    }

    const translationFields = { name, storage }
    const translations = await transformTranslationFields(translationFields)

    // TODO: https://github.com/prisma/prisma/issues/4246 remove unnecessary select
    await db.item.create({
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (cloudinaryResponse) {
        await cloudinary.uploader.destroy(cloudinaryResponse.public_id)
      }
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
      if (error.code === 'P2002') {
        const target = error.meta?.target
        if (Array.isArray(target) && target.includes('id')) {
          return {
            errors: {
              fieldErrors: { id: ['server_error_exist'] },
            },
          }
        }
      }
    }
    throw new Error('Something went wrong.')
  }
}

export async function deleteItem({
  id,
  publicId,
}: {
  id: string
  publicId?: string
}): Promise<GalleryMutateResponse<GalleryFormFields>> {
  const session = await getServerAuth()

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('You must be an admin to view the protected content.')
  }

  // TODO: publicId must be provided if the item to be deleted have an image.
  const parsedData = GalleryFormFieldsSchema.pick({ id: true })
    .extend({
      publicId: z.string().optional(),
    })
    .safeParse({ id, publicId })

  if (!parsedData.success) {
    throw new Error('Invalid input.')
  }

  try {
    if (parsedData.data.publicId) {
      await cloudinary.uploader.destroy(parsedData.data.publicId)
    }

    await db.item.delete({
      where: { id: parsedData.data.id },
      select: {
        id: true,
      },
    })
  } catch (error) {
    throw new Error('Something went wrong.')
  }
}

export async function updateItem(
  formData: FormData
): Promise<GalleryMutateResponse<GalleryFormFields>> {
  const session = await getServerAuth()

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('You must be an admin to view the protected content.')
  }

  const jsonData = formData.get('data')

  const parsedFormData = GalleryFormFieldsSchema.safeParse({
    image: formData.getAll('images'),
    ...(jsonData && typeof jsonData === 'string' && JSON.parse(jsonData)),
  })

  if (!parsedFormData.success) {
    const errors = parsedFormData.error.flatten()
    return { errors }
  }

  const { image, id, name, storage, category } = parsedFormData.data

  let cloudinaryResponse
  try {
    if (image && image.length) {
      const fileUri = await fileToBase64(image[0])

      cloudinaryResponse = await cloudinary.uploader.upload(fileUri, {
        folder:
          process.env.NODE_ENV === 'development'
            ? process.env.CLOUDINARY_DEV_FOLDER
            : process.env.CLOUDINARY_FOLDER,
      })
    }

    const translationFields = { name, storage }
    const translations = await transformTranslationFields(translationFields)

    const previousImage = await getImage(id)

    await db.item.update({
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
    })

    if (previousImage && cloudinaryResponse) {
      // TODO: rollback the updated item if this failed
      await cloudinary.uploader.destroy(previousImage.publicId)
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (cloudinaryResponse) {
        await cloudinary.uploader.destroy(cloudinaryResponse.public_id)
      }
    }
    throw new Error('Something went wrong.')
  }
}
