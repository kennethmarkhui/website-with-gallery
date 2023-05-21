import { GalleryOrderByDirection } from 'types/gallery'

export const GALLERY_LIMIT = 10
export const GALLERY_ORDER_BY_DIRECTION: GalleryOrderByDirection = 'desc'

export const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]
