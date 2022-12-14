import { Item, Image } from 'prisma/prisma-client'

export type OmittedItem = Omit<Item, 'dateAdded' | 'updatedAt'> & {
  image: Omit<Image, 'id' | 'itemId' | 'dateAdded' | 'updatedAt'> | null
}

export type OmittedItemKeys = keyof OmittedItem

export type GalleryFormFields<TImage = void> = Omit<
  RecursivelyReplaceNullWithUndefined<Item>,
  'dateAdded' | 'updatedAt'
> & {
  image: TImage extends void
    ? Pick<Image, 'url' | 'width' | 'height' | 'publicId'>
    : TImage
}

export type GalleryFormKeys = keyof GalleryFormFields

export type GalleryFormMode = 'create' | 'update'

export type NextCursor = string | undefined

export type GalleryFilters = {
  search?: string
  categories?: string[] | string
}

export type GalleryQuery = {
  nextCursor: NextCursor
} & GalleryFilters

export type GalleryResponse = {
  items: OmittedItem[]
  nextCursor: NextCursor
}

export type GalleryMutateResponse = {
  message: string
}

export type GalleryErrorResponse = {
  error: { message: string; target?: GalleryFormKeys }
}

// https://stackoverflow.com/a/72549576
type RecursivelyReplaceNullWithUndefined<T> = T extends null
  ? undefined
  : T extends (infer U)[]
  ? RecursivelyReplaceNullWithUndefined<U>[]
  : T extends Record<string, unknown>
  ? { [K in keyof T]: RecursivelyReplaceNullWithUndefined<T[K]> }
  : T
