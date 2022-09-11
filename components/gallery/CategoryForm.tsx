import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import type { GalleryFormMode } from 'types/gallery'
import useCreateCategory from 'hooks/gallery/category/use-create-category'
import useUpdateCategory from 'hooks/gallery/category/use-update-category'
import useDeleteCategory from 'hooks/gallery/category/use-delete-category'
import useCategory from 'hooks/gallery/category/use-category'

const CategoryForm = (): JSX.Element => {
  const { data: categories, status, error } = useCategory()

  const [formMode, setFormMode] = useState<GalleryFormMode>('create')

  const [initialUpdateInput, setInitialUpdateInput] = useState<string>('')

  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
    setValue,
    setError,
    reset,
  } = useForm<{ category: string }>()

  const { mutate: createCategoryMutate } = useCreateCategory()

  const { mutate: updateCategoryMutate } = useUpdateCategory()

  const { mutate: deleteCategoryMutate } = useDeleteCategory()

  const onSubmit: SubmitHandler<{ category: string }> = (data) => {
    return formMode === 'update'
      ? updateCategoryMutate(
          { old: initialUpdateInput, new: data },
          {
            onError: ({ error }, variables, context) => {
              if (error?.target === 'category') {
                setError(
                  error.target,
                  { message: error.message },
                  { shouldFocus: true }
                )
              }
            },
            onSuccess: (data, variables, context) => {
              reset()
              setFormMode('create')
              setInitialUpdateInput('')
            },
          }
        )
      : createCategoryMutate(data, {
          onError: ({ error }, variables, context) => {
            if (error?.target === 'category') {
              setError(
                error.target,
                { message: error.message },
                { shouldFocus: true }
              )
            }
          },
          onSuccess: (data, variables, context) => {
            reset()
          },
        })
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>category form</h1>
        <label htmlFor="category">Category</label>
        <input
          id="category"
          {...register('category', {
            required: 'Must not be empty.',
          })}
        />
        {errors.category && <p>{errors.category.message}</p>}
        <button type="submit" disabled={!isDirty}>
          submit
        </button>
      </form>
      <ul>
        {status === 'loading' && <p>loading</p>}
        {status === 'error' && error instanceof Error && <p>{error.message}</p>}
        {status === 'success' && categories.length === 0 && (
          <p>empty category list</p>
        )}
        {status === 'success' &&
          categories.map((category, index) => (
            <li key={`${category}-${index}`}>
              <span>
                {category}
                &emsp;
                <button
                  onClick={() => {
                    reset()
                    setValue('category', category)
                    setFormMode('update')
                    setInitialUpdateInput(category)
                  }}
                >
                  update
                </button>
                &emsp;
                <button onClick={() => deleteCategoryMutate(category)}>
                  delete
                </button>
              </span>
            </li>
          ))}
      </ul>
    </>
  )
}

export default CategoryForm
