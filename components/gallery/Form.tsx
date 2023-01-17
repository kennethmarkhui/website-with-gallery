import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm, SubmitHandler } from 'react-hook-form'
import { FaSpinner } from 'react-icons/fa'

import FloatingLabelInput from '../FloatingLabelInput'
import FloatingLabelSelect from '../FloatingLabelSelect'
import ImagePreviewInput, { maxFileSize } from '../ImagePreviewInput'
import type { GalleryFormMode, GalleryFormFields } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import useCreate from 'hooks/gallery/mutations/useCreate'
import useUpdate from 'hooks/gallery/mutations/useUpdate'
import useDelete from 'hooks/gallery/mutations/useDelete'
import { formatBytes } from 'lib/utils'

interface GalleryFormProps {
  mode?: GalleryFormMode
  defaultFormValues?: GalleryFormFields
}

interface GalleryFormCreateProps {
  mode?: 'create'
}

interface GalleryFormUpdateProps {
  mode: 'update'
  defaultFormValues: GalleryFormFields
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
    formState: { errors, isDirty },
    watch,
    handleSubmit,
    reset,
    resetField,
    setError,
    setValue,
  } = useForm<GalleryFormFields<FileList>>({
    defaultValues: {
      id: '',
      name: '',
      storage: '',
      category: '',
      image: undefined,
    },
  })

  const { data: categories, status: categoryStatus } = useCategory()

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

  const onSubmit: SubmitHandler<GalleryFormFields<FileList>> = (data) => {
    return mode === 'update'
      ? updateMutate(data, {
          onSuccess: () => {
            reset()
            router.push('/gallery')
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
            router.push('/gallery')
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
      <fieldset disabled={formIsLoading}>
        <FloatingLabelInput
          id="id"
          readOnly={mode === 'update'}
          {...register('id', {
            required: 'id is required.',
            pattern: {
              value: /^[a-zA-Z\d]+$/,
              message: 'Alphanumerics only.',
            },
          })}
          errorMessage={errors.id?.message}
        />
        <FloatingLabelInput id="name" {...register('name')} />
        <FloatingLabelInput id="storage" {...register('storage')} />
        <FloatingLabelSelect
          id="category"
          {...register('category')}
          defaultSelected={defaultFormValues?.category}
          options={categories}
          loading={categoryStatus === 'loading'}
        />
        <ImagePreviewInput
          id="image"
          {...register('image', {
            validate: {
              fileSize: (files) => {
                if (!files || !files[0]) return true
                return (
                  files[0]?.size < maxFileSize ||
                  `Max filesize ${formatBytes(maxFileSize)}.`
                )
              },
            },
          })}
          defaultPreview={defaultFormValues?.image?.url}
          fileList={imageFileList}
          errorMessage={errors.image?.message}
          setFormValue={setValue}
          removeFormValue={() => resetField('image')}
        />
        <div className="mt-4 flex gap-4 ">
          <button
            type="submit"
            className="w-full rounded-md border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-500 focus:outline-none enabled:hover:border-black enabled:hover:text-black sm:w-auto"
            disabled={!isDirty}
          >
            {createStatus === 'loading' || updateStatus === 'loading' ? (
              <span className="flex items-center justify-center gap-1">
                Submitting
                <FaSpinner className="animate-spin" />
              </span>
            ) : (
              'Submit'
            )}
          </button>
          {mode === 'update' && defaultFormValues && (
            <button
              type="button"
              className="w-full rounded-md border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-500 focus:outline-none enabled:hover:border-red-500 enabled:hover:text-red-500 sm:w-auto"
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
                      router.push('/gallery')
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
            </button>
          )}
        </div>
      </fieldset>
    </form>
  )
}

export default GalleryForm
