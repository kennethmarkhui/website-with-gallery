import { ChangeEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useForm, SubmitHandler } from 'react-hook-form'
import { HiPhotograph } from 'react-icons/hi'
import { FaSpinner } from 'react-icons/fa'

import FloatingLabelInput from '../FloatingLabelInput'
import type { GalleryFormMode, GalleryFormFields } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import useGallery from 'hooks/gallery/useGallery'
import { formatBytes } from 'lib/utils'

interface IGalleryForm {
  mode?: GalleryFormMode
  defaults?: GalleryFormFields
}

const maxFileSize = 2 * 1024 * 1024 // 2MB

const GalleryForm = ({
  mode = 'create',
  defaults,
}: IGalleryForm): JSX.Element => {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    reset,
  } = useForm<GalleryFormFields<FileList>>({
    defaultValues: {
      id: defaults ? defaults.id : '',
      name: defaults ? (defaults.name ? defaults.name : '') : '',
      storage: defaults ? (defaults.storage ? defaults.storage : '') : '',
      category: defaults ? (defaults.category ? defaults.category : '') : '',
    },
  })

  const {
    query: { data: categories, status: categoryStatus },
  } = useCategory()

  const {
    mutation: {
      create: { mutate: createMutate, status: createStatus },
      update: { mutate: updateMutate, status: updateStatus },
      delete: { mutate: deleteMutate, status: deleteStatus },
    },
  } = useGallery()

  const onSubmit: SubmitHandler<GalleryFormFields<FileList>> = (data) => {
    const formData = new FormData()
    formData.append('id', data.id)
    formData.append('name', data.name ? data.name : '')
    formData.append('storage', data.storage ? data.storage : '')
    formData.append('category', data.category ? data.category : '')
    if (data.image.length !== 0) {
      formData.append('image', data.image[0])
    }

    // Object.keys(data).forEach((key) => {
    //   if (key === 'image' && data.image.length !== 0) {
    //     return formData.append(key, data[key][0])
    //   }
    //   formData.append(key, data[key])
    // })

    return mode === 'update'
      ? updateMutate(formData, {
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
      : createMutate(formData, {
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

  const imageChangeHandler: ChangeEventHandler<HTMLInputElement> = (
    e
  ): void => {
    setImageFile(null)
    const file = e.currentTarget.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      return
    }
    setImageFile(file)
  }

  useEffect(() => {
    if (!imageFile) {
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(imageFile)

    return () => {
      setImageFile(null)
      setImagePreview(null)
    }
  }, [imageFile])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
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
      <div className="group relative z-0 mb-6 w-full">
        <select
          id="category"
          className="peer block w-full border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-black focus:border-black focus:outline-none focus:ring-0"
          {...register('category')}
        >
          {categoryStatus === 'loading' && <option>loading</option>}
          {categoryStatus === 'success' && (
            <>
              <option value=""></option>
              {categories?.map(({ id, name }) => {
                return (
                  <option key={id} value={name}>
                    {name}
                  </option>
                )
              })}
            </>
          )}
        </select>
        <label
          htmlFor="category"
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-black"
        >
          Category
        </label>
      </div>
      <div className="relative mb-4 w-full">
        <input
          type="file"
          hidden
          id="image"
          {...register('image', {
            onChange: (event) => imageChangeHandler(event),
            validate: {
              fileSize: (files) => {
                if (!files[0]) return true
                return (
                  files[0]?.size < maxFileSize ||
                  `Max filesize ${formatBytes(maxFileSize)}.`
                )
              },
            },
          })}
          accept="image/*"
        />
        <label
          htmlFor="image"
          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              height={250}
              width={250}
              objectFit="cover"
              alt="preview"
            />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <HiPhotograph className="mb-3 h-10 w-10 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span>
              </p>
              <p className="text-xs text-gray-500">
                {`Image only. (MAX. ${formatBytes(maxFileSize)})`}
              </p>
            </div>
          )}
        </label>
        {errors.image && (
          <p className="absolute text-sm text-red-500">
            {errors.image.message}
          </p>
        )}
      </div>
      <div className="mt-4 flex gap-4 ">
        <button
          type="submit"
          className="w-full rounded-md border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-500 focus:outline-none enabled:hover:border-black enabled:hover:text-black sm:w-auto"
          disabled={
            createStatus === 'loading' ||
            updateStatus === 'loading' ||
            deleteStatus === 'loading' ||
            !isDirty
          }
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
            disabled={
              createStatus === 'loading' ||
              updateStatus === 'loading' ||
              deleteStatus === 'loading'
            }
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
    </form>
  )
}

export default GalleryForm
