import { defaultErrorMap, z } from 'zod'

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  ALPHANUMERIC_REGEX,
  NUMERIC_REGEX,
} from 'constants/gallery'
import { GalleryOrderBy } from 'types/gallery'

export const GalleryAuthSigninFormFieldsSchema = z.object({
  email: z.string().email(),
})

export const GalleryCategoryFormFieldsSchema = z.object({
  name: z.array(
    z.object({
      code: z.string(),
      value: z.string().trim().min(1).max(20),
    })
  ),
})

export const GalleryFormFieldsSchema = z.object({
  id: z.string().trim().min(1).regex(ALPHANUMERIC_REGEX),
  name: z
    .array(
      z.object({
        code: z.string(),
        value: z.string().max(20),
      })
    )
    .transform((arr) => arr.filter(({ value }) => value)),
  storage: z
    .array(
      z.object({
        code: z.string(),
        value: z.string().max(20),
      })
    )
    .transform((arr) => arr.filter(({ value }) => value)),
  category: z.string(),
  image: z
    .custom<FileList>((v) => v instanceof FileList)
    .superRefine((fileList, ctx) => {
      const isSingle = fileList.length === 1
      const isMultiple = fileList.length > 1
      if (isSingle && fileList[0].size >= MAX_FILE_SIZE) {
        ctx.addIssue({
          code: 'custom',
          params: { i18n: 'max_filesize_exceeded' },
        })
      }
      if (isSingle && !ACCEPTED_IMAGE_TYPES.includes(fileList[0].type)) {
        ctx.addIssue({
          code: 'custom',
          params: { i18n: 'unsupported_filetype' },
        })
      }
      if (isMultiple) {
        ctx.addIssue({ code: 'custom', params: { i18n: 'single_file' } })
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
  page: z
    .string()
    .regex(NUMERIC_REGEX, { message: 'Numerics only.' })
    .optional(),
})

export const GalleryCursorQuerySchema = GalleryOffsetQuerySchema.omit({
  page: true,
}).extend({
  nextCursor: z.string().optional(),
})

export const GalleryQuerySchema = GalleryCursorQuerySchema.merge(
  GalleryOffsetQuerySchema
)

export const i18nGalleryFormErrorCode = {
  required: 'required',
  alphanumeric: 'alphanumeric',
  email: 'email',
  string_max_length_exceeded: 'string_max_length_exceeded',
  max_filesize_exceeded: 'max_filesize_exceeded',
  single_file: 'single_file',
  unsupported_filetype: 'unsupported_filetype',
  server_error_exist: 'server_error_exist',
} as const

export type I18nGalleryFormErrorCode = keyof typeof i18nGalleryFormErrorCode

export const isI18nGalleryFormErrorCode = (
  errorCode: string
): errorCode is I18nGalleryFormErrorCode => {
  return Object.keys(i18nGalleryFormErrorCode).includes(errorCode)
}

// TODO: better way to do i18n form error messages
// replace zod default error message with a i18n translation key
// to be used for forms that need error translation
// make sure i18nGalleryFormErrorCode keys exist in the transation json file(en.json)
export const i18nErrorMap: z.ZodErrorMap = (issue, ctx) => {
  // message must be type I18nGalleryFormErrorCode for translation to work
  // else it returns the default zod error message
  let message = defaultErrorMap(issue, ctx).message

  switch (issue.code) {
    case z.ZodIssueCode.invalid_string:
      if (
        issue.validation === 'regex' &&
        typeof ctx.data === 'string' &&
        !ctx.data.match(ALPHANUMERIC_REGEX)
      ) {
        message = 'alphanumeric'
      } else if (issue.validation === 'email') {
        message = 'email'
      } else {
        message = ctx.defaultError
      }
      break
    case z.ZodIssueCode.too_small:
      message = 'required'
      break
    case z.ZodIssueCode.too_big:
      message = 'string_max_length_exceeded'
      break
    case z.ZodIssueCode.custom:
      message = issue.params?.i18n ?? ctx.defaultError
      break
  }

  return { message }
}
