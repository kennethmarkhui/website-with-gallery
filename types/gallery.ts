import { Item, Image } from 'prisma/prisma-client'

export type OmittedItem = Omit<Item, 'id' | 'dateAdded' | 'updatedAt'> & {
  image: Omit<Image, 'id' | 'itemId' | 'dateAdded' | 'updatedAt'> | null
}

export type OmittedItemKeys = keyof OmittedItem

export type GalleryFormFields<TImage = void> = Omit<
  RecursivelyReplaceNullWithUndefined<Item>,
  'id' | 'dateAdded' | 'updatedAt'
> & {
  image: TImage extends void ? Pick<Image, 'url' | 'width' | 'height'> : TImage
}

export type GalleryFormKeys = keyof GalleryFormFields

export type GalleryFormMode = 'create' | 'update'

export interface GalleryMutateResponse {
  message: string
}

export interface GalleryErrorResponse {
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
