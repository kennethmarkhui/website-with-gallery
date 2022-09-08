import { Item, Image } from 'prisma/prisma-client'

export type OmittedItem = Omit<Item, 'id' | 'dateAdded' | 'updatedAt'> & {
  image: Omit<Image, 'id' | 'itemId' | 'dateAdded' | 'updatedAt'> | null
}

export type OmittedItemKeys = keyof OmittedItem

export type GalleryFormFields<ImageT = void> = Omit<
  RecursivelyReplaceNullWithUndefined<Item>,
  'id' | 'dateAdded' | 'updatedAt'
> & {
  image: ImageT extends void
    ? Omit<
        RecursivelyReplaceNullWithUndefined<Image>,
        'id' | 'itemId' | 'publicId' | 'dateAdded' | 'updatedAt'
      >
    : ImageT
}

export type GalleryFormKeys = keyof GalleryFormFields

export type GalleryFormMode = 'create' | 'update'

export type GalleryMutateResponse = { message: string }

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
