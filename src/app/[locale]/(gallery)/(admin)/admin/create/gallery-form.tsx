'use client'

import { useEffect } from 'react'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FaSpinner } from 'react-icons/fa'

import ImagePreviewInput from './image-preview-input'
import FloatingLabelInput from '@/components/floating-label-input'
import FloatingLabelSelect from '@/components/floating-label-select'
import Button from '@/components/button'
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/constants/gallery'
import useCategory from '@/hooks/use-category'
import useCreate from '@/hooks/use-create'
import useDelete from '@/hooks/use-delete'
import useUpdate from '@/hooks/use-update'
import { i18n } from '@/i18n/config'
import { useRouter } from '@/i18n/routing'
import { formatBytes } from '@/lib/utils'
import {
  GalleryFormFieldsSchema,
  i18nErrorMap,
  isI18nGalleryFormErrorCode,
} from '@/lib/validations'
import { DefaultGalleryFormFields, GalleryFormFields } from '@/types/gallery'
import setFormServerErrors from './set-form-server-error'

type GalleryFormProps = GalleryFormCreateProps | GalleryFormUpdateProps

interface GalleryFormCreateProps {
  mode: 'create'
  defaultFormValues?: never
}

interface GalleryFormUpdateProps {
  mode: 'update'
  defaultFormValues: DefaultGalleryFormFields
}

export default function GalleryForm({
  mode,
  defaultFormValues,
}: GalleryFormProps) {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('form')
  const format = useFormatter()

  const {
    register,
    control,
    formState: { errors, isDirty },
    watch,
    handleSubmit,
    reset,
    resetField,
    setError,
    setValue,
  } = useForm<GalleryFormFields>({
    resolver: zodResolver(GalleryFormFieldsSchema, {
      errorMap: i18nErrorMap,
    }),
    defaultValues: {
      id: '',
      name: [{ code: locale, value: '' }],
      storage: [{ code: locale, value: '' }],
      category: '',
      image: undefined,
    },
  })

  const {
    fields: nameFields,
    append: nameFieldAppend,
    remove: nameFieldRemove,
  } = useFieldArray({ control, name: 'name' })

  const {
    fields: storageFields,
    append: storageFieldAppend,
    remove: storageFieldRemove,
  } = useFieldArray({ control, name: 'storage' })

  const { localizedData, status: categoryStatus } = useCategory()

  const nameFieldsWithNoTranslation = i18n.locales.filter((loc) => {
    return !nameFields.map(({ code }) => code).includes(loc)
  })

  const storageFieldWithNoTranslation = i18n.locales.filter((loc) => {
    return !storageFields.map(({ code }) => code).includes(loc)
  })

  useEffect(() => {
    if (mode !== 'update' || !defaultFormValues || categoryStatus !== 'success')
      return
    reset({ ...defaultFormValues, image: undefined })
  }, [mode, defaultFormValues, reset, categoryStatus])

  const { mutate: createMutate, status: createStatus } = useCreate()
  const { mutate: updateMutate, status: updateStatus } = useUpdate()
  const { mutate: deleteMutate, status: deleteStatus } = useDelete()

  const formIsLoading =
    createStatus === 'pending' ||
    updateStatus === 'pending' ||
    deleteStatus === 'pending' ||
    categoryStatus === 'pending'

  const imageFileList = watch('image')

  const onSubmit: SubmitHandler<GalleryFormFields> = (data) => {
    return mode === 'update'
      ? updateMutate(data, {
          onSuccess: (response) => {
            if (response?.errors) {
              return setFormServerErrors({ setError, errors: response.errors })
            }
            router.push('/admin')
          },
          onError: (error) => {
            // TODO: handle server thrown error
          },
        })
      : createMutate(data, {
          onSuccess: (response) => {
            if (response?.errors) {
              return setFormServerErrors({ setError, errors: response.errors })
            }
            router.push('/admin')
          },
          onError: (error) => {
            // TODO: handle server thrown error
          },
        })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
      <fieldset className="space-y-6" disabled={formIsLoading}>
        <FloatingLabelInput
          id="id"
          readOnly={mode === 'update'}
          {...register('id')}
          errorMessage={
            typeof errors.id?.message === 'string'
              ? isI18nGalleryFormErrorCode(errors.id.message)
                ? t(`validations.${errors.id.message}`)
                : errors.id.message
              : undefined
          }
        />
        {nameFields.map((field, index, arr) => {
          let errorMessage = errors.name?.[index]?.value?.message
          if (
            typeof errorMessage === 'string' &&
            isI18nGalleryFormErrorCode(errorMessage)
          ) {
            errorMessage = t(`validations.${errorMessage}`, {
              length:
                GalleryFormFieldsSchema.shape.name._def.schema._def.type.shape
                  .value.maxLength,
            })
          }
          return (
            <div key={field.id} className="flex">
              <FloatingLabelInput
                id={t('translated-name', { language: field.code })}
                {...register(`name.${index}.value`)}
                errorMessage={errorMessage}
              />
              {arr.length > 1 && (
                <button type="button" onClick={() => nameFieldRemove(index)}>
                  x
                </button>
              )}
            </div>
          )
        })}
        {Array.isArray(nameFieldsWithNoTranslation) &&
          nameFieldsWithNoTranslation.length > 0 && (
            <div className="flex gap-2">
              {nameFieldsWithNoTranslation.map((locale) => {
                return (
                  <button
                    type="button"
                    key={locale}
                    onClick={() => nameFieldAppend({ code: locale, value: '' })}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    {t('add-translation', { language: locale })}
                  </button>
                )
              })}
            </div>
          )}
        {storageFields.map((field, index, arr) => {
          let errorMessage = errors.storage?.[index]?.value?.message
          if (
            typeof errorMessage === 'string' &&
            isI18nGalleryFormErrorCode(errorMessage)
          ) {
            errorMessage = t(`validations.${errorMessage}`, {
              length:
                GalleryFormFieldsSchema.shape.storage._def.schema._def.type
                  .shape.value.maxLength,
            })
          }
          return (
            <div key={field.id} className="flex">
              <FloatingLabelInput
                id={t('translated-storage', { language: field.code })}
                {...register(`storage.${index}.value`)}
                errorMessage={errorMessage}
              />
              {arr.length > 1 && (
                <button type="button" onClick={() => storageFieldRemove(index)}>
                  x
                </button>
              )}
            </div>
          )
        })}
        {Array.isArray(storageFieldWithNoTranslation) &&
          storageFieldWithNoTranslation.length > 0 && (
            <div className="flex gap-2">
              {storageFieldWithNoTranslation.map((locale) => {
                return (
                  <button
                    type="button"
                    key={locale}
                    onClick={() =>
                      storageFieldAppend({ code: locale, value: '' })
                    }
                    className="text-xs text-gray-500 hover:underline"
                  >
                    {t('add-translation', { language: locale })}
                  </button>
                )
              })}
            </div>
          )}
        <FloatingLabelSelect
          id={t('category')}
          {...register('category')}
          defaultSelected={defaultFormValues?.category}
          options={localizedData}
          loading={categoryStatus === 'pending'}
        />
        <ImagePreviewInput
          id="image"
          {...register('image')}
          title={t('upload-title')}
          description={t('upload-description', {
            maxFilesize: formatBytes(MAX_FILE_SIZE),
          })}
          defaultPreview={defaultFormValues?.image?.url}
          fileList={imageFileList}
          errorMessage={
            typeof errors.image?.message === 'string'
              ? isI18nGalleryFormErrorCode(errors.image.message)
                ? t(`validations.${errors.image.message}`, {
                    maxFilesize: formatBytes(MAX_FILE_SIZE),
                    supportedFileTypes: format.list(ACCEPTED_IMAGE_TYPES, {
                      type: 'disjunction',
                    }),
                  })
                : errors.image.message
              : undefined
          }
          setFormValue={setValue}
          removeFormValue={() => resetField('image')}
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={!isDirty}>
            {createStatus === 'pending' || updateStatus === 'pending' ? (
              <span className="flex items-center justify-center gap-1">
                {createStatus === 'pending' ? t('creating') : t('updating')}
                <FaSpinner className="animate-spin" />
              </span>
            ) : mode === 'create' ? (
              t('create')
            ) : (
              t('update')
            )}
          </Button>
          {mode === 'update' && (
            <Button
              type="button"
              variant="danger"
              onClick={() =>
                deleteMutate(
                  {
                    id: defaultFormValues.id,
                    publicId:
                      defaultFormValues.image?.publicId !== ''
                        ? defaultFormValues.image?.publicId
                        : undefined,
                  },
                  {
                    onSuccess: () => {
                      reset()
                      router.push('/admin')
                    },
                  }
                )
              }
            >
              {deleteStatus === 'pending' ? (
                <span className="flex items-center justify-center gap-1">
                  {t('deleting')}
                  <FaSpinner className="animate-spin" />
                </span>
              ) : (
                t('delete')
              )}
            </Button>
          )}
        </div>
      </fieldset>
    </form>
  )
}
