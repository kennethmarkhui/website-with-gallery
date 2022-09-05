import { useForm, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next/router'

import type { FormMode, FormValues } from 'types/gallery'
import useCreate from 'hooks/gallery/use-create'
import useUpdate from 'hooks/gallery/useUpdate'

interface IGalleryForm {
  mode?: FormMode
  defaults?: FormValues
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
  } = useForm<FormValues>({
    defaultValues: {
      itemId: defaults ? defaults.itemId : '',
      name: defaults ? defaults.name : '',
      storage: defaults ? defaults.storage : '',
    },
  })

  const { mutate: createMutate, status: createStatus } = useCreate()

  const { mutate: updateMutate, status: updateStatus } = useUpdate()

  const onSubmit: SubmitHandler<FormValues> = (data) =>
    mode === 'update'
      ? updateMutate(data, {
          onSuccess: () => {
            reset()
            router.push('/gallery')
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
