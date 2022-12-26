import { Item, Image, Category } from 'prisma/prisma-client'

type GalleryItemInfo = Pick<Item, 'id' | 'name' | 'storage'> & {
  category: Category['name'] | null
}

type GalleryImage = Pick<Image, 'url' | 'width' | 'height' | 'publicId'>

export type GalleryItem = GalleryItemInfo & {
  image: GalleryImage | null
}

export type GalleryFormFields<TImage = void> =
  NonNullableRecursive<GalleryItemInfo> & {
    image?: TImage extends void ? GalleryImage : TImage | null
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
  items: GalleryItem[]
  nextCursor: NextCursor
}

export type GalleryMutateResponse = {
  message: string
}

export type GalleryErrorResponse = {
  error: { message: string; target?: GalleryFormKeys }
}

// https://stackoverflow.com/a/73395247
export type NonNullableRecursive<Type> = {
  [Key in keyof Type]-?: Type[Key] extends object | undefined | null
    ? NonNullableRecursive<Type[Key]>
    : NonNullable<Type[Key]>
}
