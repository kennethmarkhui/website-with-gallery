import { Item, Image, Category } from 'prisma/prisma-client'
import { z } from 'zod'

import {
  GalleryCategoryFormFieldsSchema,
  GalleryCursorQuerySchema,
  GalleryFiltersSchema,
  GalleryFormFieldsSchema,
  GalleryOffsetQuerySchema,
  GalleryQuerySchema,
} from 'lib/validations'

export type GalleryItemKeys = keyof Item

type GalleryItemInfo = Pick<Item, 'id' | 'name' | 'storage'> & {
  category: Category['name'] | null
}

type GalleryImage = Pick<Image, 'url' | 'width' | 'height' | 'publicId'>

export type GalleryItem = GalleryItemInfo & {
  image: GalleryImage | null
}

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

export type GalleryFilters = z.infer<typeof GalleryFiltersSchema>

export type PaginationType = 'cursor' | 'offset'

export type GalleryCursorQuery = z.infer<typeof GalleryCursorQuerySchema>

export type GalleryOffsetQuery = z.infer<typeof GalleryOffsetQuerySchema>

export type GalleryQuery = z.infer<typeof GalleryQuerySchema>

export type GalleryOrderBy = [GalleryItemKeys, GalleryOrderByDirection]

export type GalleryOrderByDirection = 'asc' | 'desc'

export type GalleryCursorResponse = GalleryItems & {
  nextCursor?: NextCursor
}

export type GalleryOffsetResponse = GalleryItems & {
  page: number
}

export type GalleryResponse = GalleryCursorResponse | GalleryOffsetResponse

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
