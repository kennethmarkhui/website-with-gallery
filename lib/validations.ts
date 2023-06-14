import { z } from 'zod'

import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from 'constants/gallery'
import { formatBytes } from './utils'
import { GalleryOrderBy } from 'types/gallery'

export const GalleryAuthSigninFormFieldsSchema = z.object({
  email: z.string().email(),
})

export const GalleryCategoryFormFieldsSchema = z.object({
  category: z.array(
    z.object({
      code: z.string(),
      name: z.string().trim().min(1, 'Required').max(20),
    })
  ),
})

export const GalleryFormFieldsSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, 'Required')
    .regex(/^[a-zA-Z\d]+$/, 'Alphanumerics only.'),
  name: z.string(),
  storage: z.string(),
  category: z.string(),
  image: z
    .custom<FileList>((v) => v instanceof FileList)
    .superRefine((fileList, ctx) => {
      const isSingle = fileList.length === 1
      const isMultiple = fileList.length > 1
      if (isSingle && fileList[0].size >= MAX_FILE_SIZE) {
        ctx.addIssue({
          code: 'custom',
          message: `Max image size is ${formatBytes(MAX_FILE_SIZE)}.`,
        })
      }
      if (isSingle && !ACCEPTED_IMAGE_TYPES.includes(fileList[0].type)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Only .jpg, .jpeg, .png and .webp formats are supported.',
        })
      }
      if (isMultiple) {
        ctx.addIssue({ code: 'custom', message: 'Only 1 file is allowed.' })
      }
    })
    .optional(),
})

export const GalleryFormFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.array(z.string()).optional(),
  orderBy: z.custom<GalleryOrderBy>().optional(),
})

export const GalleryOffsetQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  orderBy: z.string().optional(),
  page: z.string().regex(/^\d+$/, { message: 'Numerics only.' }).optional(),
})

export const GalleryCursorQuerySchema = GalleryOffsetQuerySchema.omit({
  page: true,
}).extend({
  nextCursor: z.string().optional(),
})

export const GalleryQuerySchema = GalleryCursorQuerySchema.merge(
  GalleryOffsetQuerySchema
)
