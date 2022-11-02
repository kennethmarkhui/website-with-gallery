import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm, SubmitHandler } from 'react-hook-form'
import { FaSpinner } from 'react-icons/fa'

import FloatingLabelInput from '../FloatingLabelInput'
import FloatingLabelSelect from '../FloatingLabelSelect'
import ImagePreviewInput, { maxFileSize } from '../ImagePreviewInput'
import type { GalleryFormMode, GalleryFormFields } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import useGallery from 'hooks/gallery/useGallery'
import useFilePreview from 'hooks/gallery/useFilePreview'
import { formatBytes } from 'lib/utils'

interface IGalleryForm {
  mode?: GalleryFormMode
  defaults?: GalleryFormFields
}

const GalleryForm = ({
  mode = 'create',
  defaults,
}: IGalleryForm): JSX.Element => {
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
  } = useForm<GalleryFormFields<FileList>>()

  const {
    query: { data: categories, status: categoryStatus },
  } = useCategory()

  useEffect(() => {
    if (
      mode !== 'update' ||
      categoryStatus === 'loading' ||
      categoryStatus === 'error' ||
      !defaults
    ) {
      return
    }
    setValue('id', defaults.id)
    setValue('name', defaults.name)
    setValue('storage', defaults.storage)
    setValue('category', defaults.category)
  }, [categoryStatus, defaults, setValue, mode])

  const {
    mutation: {
      create: { mutate: createMutate, status: createStatus },
      update: { mutate: updateMutate, status: updateStatus },
      delete: { mutate: deleteMutate, status: deleteStatus },
    },
  } = useGallery()

  const formIsLoading =
    createStatus === 'loading' ||
    updateStatus === 'loading' ||
    deleteStatus === 'loading'

  const imageFileList = watch('image')

  const {
    preview: imagePreview,
    fileListRef,
    removeFile,
  } = useFilePreview(imageFileList, defaults?.image && defaults.image.url)

  const onSubmit: SubmitHandler<GalleryFormFields<FileList>> = (data) => {
    if (fileListRef.current) {
      // persist file when user select a file then tried to select a new file but chose to cancel
      data.image = fileListRef.current
    }

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
          defaultSelected={defaults?.category}
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
          imagePreview={imagePreview}
          fileListRef={fileListRef}
          removeFile={() => removeFile(() => resetField('image'))}
          errorMessage={errors.image?.message}
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
          {mode === 'update' && (
            <button
              type="button"
              className="w-full rounded-md border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-500 focus:outline-none enabled:hover:border-red-500 enabled:hover:text-red-500 sm:w-auto"
              onClick={() =>
                deleteMutate(
                  {
                    id: defaults?.id as string,
                    publicId: defaults?.image
                      ? defaults?.image.publicId
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
