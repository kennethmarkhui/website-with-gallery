import { useForm, SubmitHandler } from 'react-hook-form'

export type FormValues = {
  itemId: string
  name?: string
  storage?: string
}

interface IGalleryForm {
  handleFormSubmit: (formData: FormValues) => void
  loading: boolean
}

const GalleryForm = ({
  handleFormSubmit,
  loading,
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
      <input id="itemId" {...register('itemId', { required: true })} />
      {errors.itemId && <p>ItemId is required.</p>}
      <label htmlFor="name">Name</label>
      <input id="name" {...register('name')} />
      <label htmlFor="storage">Storage</label>
      <input id="storage" {...register('storage')} />
      <button type="submit" disabled={loading}>
        submit
      </button>
    </form>
  )
}

export default GalleryForm
