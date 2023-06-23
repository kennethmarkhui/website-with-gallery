import { Prisma, Item, Image, Category } from 'prisma/prisma-client'
import { z } from 'zod'

import { fetchItems } from 'pages/api/gallery'
import { fetchCategories } from 'pages/api/gallery/category'
import {
  GalleryCategoryFormFieldsSchema,
  GalleryCursorQuerySchema,
  GalleryFormFiltersSchema,
  GalleryFormFieldsSchema,
  GalleryOffsetQuerySchema,
  GalleryQuerySchema,
} from 'lib/validations'

export type GalleryItemKeys = keyof Item

export type GalleryImage = Pick<Image, 'url' | 'width' | 'height' | 'publicId'>

export type GalleryItem = Pick<
  Awaited<ReturnType<typeof fetchItems>>,
  'items'
>['items'][number]

export type GalleryItems = {
  items: GalleryItem[]
  totalCount: number
}

export type GalleryCategoryFormFields = z.infer<
  typeof GalleryCategoryFormFieldsSchema
>

export type GalleryFormFields = z.infer<typeof GalleryFormFieldsSchema>

export type DefaultGalleryFormFields = Omit<GalleryFormFields, 'image'> & {
  image?: GalleryImage
}

export type GalleryFormKeys = keyof GalleryFormFields

export type GalleryFormMode = 'create' | 'update'

export type NextCursor = string

export type GalleryFormFilters = z.infer<typeof GalleryFormFiltersSchema>

export type PaginationType = 'cursor' | 'offset'

export type GalleryOffsetQuery = z.infer<typeof GalleryOffsetQuerySchema>

export type GalleryCursorQuery = z.infer<typeof GalleryCursorQuerySchema>

export type GalleryQuery = z.infer<typeof GalleryQuerySchema>

export type GalleryOrderBy = [GalleryItemKeys, GalleryOrderByDirection]

export type GalleryOrderByDirection = Prisma.SortOrder

export type GalleryResponse = GalleryItems & {
  page?: string
  nextCursor?: NextCursor
}

export type GalleryCategoryResponse = Awaited<
  ReturnType<typeof fetchCategories>
>

export type GalleryMutateResponse = {
  message: string
}

export type GalleryErrorResponse = {
  error: { message: string; target?: GalleryFormKeys }
}

// https://stackoverflow.com/a/73395247
export type NonNullableRecursive<Type> = {
  [Key in keyof Type]-?: Type[Key] extends object | undefined | null
    ? NonNullableRecursive<NonNullable<Type[Key]>>
    : NonNullable<Type[Key]>
}
