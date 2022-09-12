import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Category } from 'prisma/prisma-client'

import type { GalleryFormMode } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'

const CategoryForm = (): JSX.Element => {
  const {
    query: { data: categories, status, error },
    mutation: {
      create: { mutate: createCategoryMutate },
      update: { mutate: updateCategoryMutate },
      delete: { mutate: deleteCategoryMutate },
    },
  } = useCategory()

  const [formMode, setFormMode] = useState<GalleryFormMode>('create')

  const [categoryToUpdate, setCategoryToUpdate] = useState<Pick<
    Category,
    'id' | 'name'
  > | null>(null)

  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
    setValue,
    setError,
    reset,
  } = useForm<{ category: string }>()

  const onSubmit: SubmitHandler<{ category: string }> = (data) => {
    return formMode === 'update'
      ? updateCategoryMutate(
          {
            id: categoryToUpdate?.id as string,
            name: data.category,
            oldName: categoryToUpdate?.name as string,
          },
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
              setCategoryToUpdate(null)
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
        {status === 'success' && categories?.length === 0 && (
          <p>empty category list</p>
        )}
        {status === 'success' &&
          categories?.map(({ id, name }) => (
            <li key={id}>
              <span>
                {name}
                &emsp;
                <button
                  onClick={() => {
                    reset()
                    setValue('category', name)
                    setFormMode('update')
                    setCategoryToUpdate({ id, name })
                  }}
                  disabled={categoryToUpdate?.id === id}
                >
                  {categoryToUpdate?.id === id ? 'updating' : 'update'}
                </button>
                &emsp;
                <button
                  disabled={formMode === 'update'}
                  onClick={() => deleteCategoryMutate(id)}
                >
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
