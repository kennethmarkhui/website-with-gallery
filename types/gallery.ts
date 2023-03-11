import { Item, Image, Category } from 'prisma/prisma-client'

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

export type GalleryFormFields<TImage = void> =
  NonNullableRecursive<GalleryItemInfo> & {
    image?: TImage extends void ? GalleryImage : TImage
  }

export type GalleryFormKeys = keyof GalleryFormFields

export type GalleryFormMode = 'create' | 'update'

export type NextCursor = string

export type GalleryFilters = {
  search?: string
  categories?: string[] | string
  orderBy?: string | GalleryOrderBy
  page?: number
}

export type PaginationType = 'cursor' | 'offset'

export type GalleryCursorQuery = {
  nextCursor: NextCursor
} & GalleryFilters

export type GalleryOffsetQuery = {
  page: number
} & GalleryFilters

export type GalleryQuery = {
  nextCursor?: NextCursor
  page?: number
} & GalleryFilters

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

// https://stackoverflow.com/a/66680470
export type RequireKeys<T extends object, K extends keyof T> = Required<
  Pick<T, K>
> &
  Omit<T, K> extends infer O
  ? { [P in keyof O]: O[P] }
  : never
