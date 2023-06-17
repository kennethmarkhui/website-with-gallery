import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FaSpinner } from 'react-icons/fa'

import FloatingLabelInput from '../FloatingLabelInput'
import FloatingLabelSelect from '../FloatingLabelSelect'
import Button from '../Button'
import ImagePreviewInput from '../ImagePreviewInput'
import type {
  GalleryFormMode,
  GalleryFormFields,
  DefaultGalleryFormFields,
} from 'types/gallery'
import { GalleryFormFieldsSchema } from 'lib/validations'
import useCategory from 'hooks/gallery/category/useCategory'
import useCreate from 'hooks/gallery/mutations/useCreate'
import useUpdate from 'hooks/gallery/mutations/useUpdate'
import useDelete from 'hooks/gallery/mutations/useDelete'

interface GalleryFormProps {
  mode?: GalleryFormMode
  defaultFormValues?: DefaultGalleryFormFields
}

interface GalleryFormCreateProps {
  mode?: 'create'
}

interface GalleryFormUpdateProps {
  mode: 'update'
  defaultFormValues: DefaultGalleryFormFields
}

function GalleryForm({ mode }: GalleryFormCreateProps): JSX.Element
function GalleryForm({
  mode,
  defaultFormValues,
}: GalleryFormUpdateProps): JSX.Element
function GalleryForm({
  mode = 'create',
  defaultFormValues,
}: GalleryFormProps): JSX.Element {
  const router = useRouter()

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
    resolver: zodResolver(GalleryFormFieldsSchema),
    defaultValues: {
      id: '',
      name: [{ code: router.locale, value: '' }],
      storage: [{ code: router.locale, value: '' }],
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

  const nameFieldsWithNoTranslation = router.locales?.filter((loc) => {
    return !nameFields.map(({ code }) => code).includes(loc)
  })

  const storageFieldWithNoTranslation = router.locales?.filter((loc) => {
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
    createStatus === 'loading' ||
    updateStatus === 'loading' ||
    deleteStatus === 'loading' ||
    categoryStatus === 'loading'

  const imageFileList = watch('image')

  const onSubmit: SubmitHandler<GalleryFormFields> = (data) => {
    return mode === 'update'
      ? updateMutate(data, {
          onSuccess: () => {
            reset()
            router.push('/gallery/admin')
          },
          onError: ({ error }) => {
            if (error?.target) {
              setError(
                error.target,
                { message: error.message },
                { shouldFocus: true }
              )
            }
          },
        })
      : createMutate(data, {
          onSuccess: () => {
            reset()
            router.push('/gallery/admin')
          },
          onError: ({ error }) => {
            if (error?.target) {
              setError(
                error.target,
                { message: error.message },
                { shouldFocus: true }
              )
            }
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
          errorMessage={errors.id?.message}
        />
        {nameFields.map((field, index, arr) => (
          <div key={field.id} className="flex">
            <FloatingLabelInput
              id={`${field.code} name`}
              {...register(`name.${index}.value`)}
            />
            {arr.length > 1 && (
              <button type="button" onClick={() => nameFieldRemove(index)}>
                x
              </button>
            )}
          </div>
        ))}
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
                    add {locale} translation
                  </button>
                )
              })}
            </div>
          )}
        {storageFields.map((field, index, arr) => (
          <div key={field.id} className="flex">
            <FloatingLabelInput
              id={`${field.code} storage`}
              {...register(`storage.${index}.value`)}
            />
            {arr.length > 1 && (
              <button type="button" onClick={() => storageFieldRemove(index)}>
                x
              </button>
            )}
          </div>
        ))}
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
                    add {locale} translation
                  </button>
                )
              })}
            </div>
          )}
        <FloatingLabelSelect
          id="category"
          {...register('category')}
          defaultSelected={defaultFormValues?.category}
          options={localizedData}
          loading={categoryStatus === 'loading'}
        />
        <ImagePreviewInput
          id="image"
          {...register('image')}
          defaultPreview={defaultFormValues?.image?.url}
          fileList={imageFileList}
          errorMessage={errors.image?.message}
          setFormValue={setValue}
          removeFormValue={() => resetField('image')}
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={!isDirty}>
            {createStatus === 'loading' || updateStatus === 'loading' ? (
              <span className="flex items-center justify-center gap-1">
                Submitting
                <FaSpinner className="animate-spin" />
              </span>
            ) : (
              'Submit'
            )}
          </Button>
          {mode === 'update' && defaultFormValues && (
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
                      router.push('/gallery/admin')
                    },
                  }
                )
              }
            >
              {deleteStatus === 'loading' ? (
                <span className="flex items-center justify-center gap-1">
                  Deleting
                  <FaSpinner className="animate-spin" />
                </span>
              ) : (
                'Delete'
              )}
            </Button>
          )}
        </div>
      </fieldset>
    </form>
  )
}

export default GalleryForm
