import { Prisma, Item, Image } from 'prisma/prisma-client'
import { typeToFlattenedError, z } from 'zod'

import { getCategories } from '@/actions/category'
import {
  GalleryCategoryFormFieldsSchema,
  GalleryCursorQuerySchema,
  GalleryOffsetQuerySchema,
  GalleryFormFiltersSchema,
  GalleryFormFieldsSchema,
} from '@/lib/validations'

export type GalleryItemKeys = keyof Item

export type GalleryImage = Pick<Image, 'url' | 'width' | 'height' | 'publicId'>

// export type GalleryItem = Pick<
//   Awaited<ReturnType<typeof getItems>>,
//   'items'
// >['items'][number]

// export type GalleryAdminItem = Pick<
//   Awaited<ReturnType<typeof getAdminItems>>,
//   'items'
// >['items'][number]

export type GalleryCategoryFormFields = z.infer<
  typeof GalleryCategoryFormFieldsSchema
>

export type GalleryFormFields = z.infer<typeof GalleryFormFieldsSchema>

export type DefaultGalleryFormFields = Omit<GalleryFormFields, 'image'> & {
  image?: GalleryImage
}

// export type GalleryFormKeys = keyof GalleryFormFields

export type GalleryFormFilters = z.infer<typeof GalleryFormFiltersSchema>

export type PaginationType = 'cursor' | 'offset'

export type GalleryOffsetQuery = z.infer<typeof GalleryOffsetQuerySchema>

export type GalleryCursorQuery = z.infer<typeof GalleryCursorQuerySchema>

export type GalleryOrderBy = [GalleryItemKeys, GalleryOrderByDirection]

export type GalleryOrderByDirection = Prisma.SortOrder

// export type GalleryResponse = {
//   items: GalleryItem[]
//   nextCursor?: string
// }

// export type GalleryAdminResponse = {
//   items: GalleryAdminItem[]
//   totalCount: number
//   page: string
// }

export type GalleryCategoryResponse = Awaited<ReturnType<typeof getCategories>>

export type GalleryMutateResponse<F> = {
  errors: Partial<typeToFlattenedError<F>>
} | void
