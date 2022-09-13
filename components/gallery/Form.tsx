import { useForm, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next/router'

import type { GalleryFormMode, GalleryFormFields } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import useGallery from 'hooks/gallery/useGallery'

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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Form</h1>
      <label htmlFor="id">id</label>
      <input
        id="id"
        {...register('id', {
          required: 'id is required.',
          pattern: {
            value: /^[a-zA-Z\d]+$/,
            message: 'Alphanumerics only.',
          },
        })}
        readOnly={mode === 'update'}
      />
      {errors.id && <p>{errors.id.message}</p>}
      <label htmlFor="name">Name</label>
      <input id="name" {...register('name')} />
      <label htmlFor="storage">Storage</label>
      <input id="storage" {...register('storage')} />
      <label htmlFor="category">Category</label>
      <select id="category" {...register('category')}>
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
