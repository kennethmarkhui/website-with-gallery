import { useForm, SubmitHandler } from 'react-hook-form'

import { FormValues, OmittedItem } from 'types/gallery'

interface IGalleryForm {
  handleFormSubmit: (formData: FormValues) => void
  loading: boolean
  updating?: boolean
  defaultValues?: OmittedItem
}

const GalleryForm = ({
  handleFormSubmit,
  loading,
  updating,
  defaultValues,
}: IGalleryForm): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit: SubmitHandler<FormValues> = (data) => handleFormSubmit(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Form</h1>
      <label htmlFor="itemId">ItemId</label>
      <input
        id="itemId"
        {...register('itemId', { required: true })}
        readOnly={updating}
        defaultValue={defaultValues && defaultValues.itemId}
      />
      {errors.itemId && <p>ItemId is required.</p>}
      <label htmlFor="name">Name</label>
      <input
        id="name"
        {...register('name')}
        defaultValue={defaultValues && (defaultValues.name ?? '')}
      />
      <label htmlFor="storage">Storage</label>
      <input
        id="storage"
        {...register('storage')}
        defaultValue={defaultValues && (defaultValues.storage ?? '')}
      />
      <button type="submit" disabled={loading}>
        submit
      </button>
    </form>
  )
}

export default GalleryForm
