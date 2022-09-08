import { useForm, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next/router'

import type { GalleryFormMode, GalleryFormFields } from 'types/gallery'
import useCreate from 'hooks/gallery/use-create'
import useUpdate from 'hooks/gallery/use-update'

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
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    reset,
  } = useForm<GalleryFormFields<FileList>>({
    defaultValues: {
      itemId: defaults ? defaults.itemId : '',
      name: defaults ? (defaults.name ? defaults.name : '') : '',
      storage: defaults ? (defaults.storage ? defaults.storage : '') : '',
    },
  })

  const { mutate: createMutate, status: createStatus } = useCreate()

  const { mutate: updateMutate, status: updateStatus } = useUpdate()

  const onSubmit: SubmitHandler<GalleryFormFields<FileList>> = (data) => {
    const formData = new FormData()
    formData.append('itemId', data.itemId)
    formData.append('name', data.name ? data.name : '')
    formData.append('storage', data.storage ? data.storage : '')
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Form</h1>
      <label htmlFor="itemId">ItemId</label>
      <input
        id="itemId"
        {...register('itemId', {
          required: 'ItemId is required.',
          pattern: {
            value: /^[a-zA-Z\d]+$/,
            message: 'Alphanumerics only.',
          },
        })}
        readOnly={mode === 'update'}
      />
      {errors.itemId && <p>{errors.itemId.message}</p>}
      <label htmlFor="name">Name</label>
      <input id="name" {...register('name')} />
      <label htmlFor="storage">Storage</label>
      <input id="storage" {...register('storage')} />
      <label htmlFor="image">Image</label>
      {errors.image && <p>{errors.image.message}</p>}
      <input
        type="file"
        hidden
        id="image"
        {...register('image')}
        accept="image/*"
      />
      <button
        type="submit"
        disabled={
          createStatus === 'loading' || updateStatus === 'loading' || !isDirty
        }
      >
        submit
      </button>
    </form>
  )
}

export default GalleryForm
