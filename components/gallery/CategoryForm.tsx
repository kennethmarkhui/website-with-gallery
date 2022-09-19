import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Category } from 'prisma/prisma-client'
import { HiX, HiTrash } from 'react-icons/hi'

import type { GalleryFormMode } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import FloatingLabelInput from '../FloatingLabelInput'

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
    setFocus,
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-4 w-full sm:mt-8 sm:w-1/2 md:mt-16 lg:w-1/3"
      >
        <FloatingLabelInput
          id="category"
          {...register('category', {
            required: 'Must not be empty.',
            maxLength: { value: 20, message: 'Max character of 20.' },
            pattern: {
              value: /^[a-zA-Z\d]+$/,
              message: 'Alphanumerics only.',
            },
          })}
          errorMessage={errors.category?.message}
          withSubmitButton
        />
      </form>

      <ul className="mt-8 flex flex-wrap gap-4 md:mt-16">
        {status === 'loading' && <p>loading</p>}
        {status === 'error' && error instanceof Error && <p>{error.message}</p>}
        {status === 'success' && categories?.length === 0 && (
          <p>empty category list</p>
        )}
        {status === 'success' &&
          categories?.map(({ id, name }) => (
            <li key={id}>
              <span
                className={`flex items-center gap-4 rounded-full border px-4 py-2 text-lg shadow ${
                  categoryToUpdate?.id === id ? 'border-black' : ''
                }`}
              >
                <button
                  className="hover:underline"
                  onClick={() => {
                    // reset()
                    setValue('category', name)
                    setFormMode('update')
                    setCategoryToUpdate({ id, name })
                    setFocus('category', { shouldSelect: true })
                  }}
                  title={`Update ${name}`}
                >
                  {name}
                </button>
                {formMode === 'update' && categoryToUpdate?.id === id ? (
                  <button
                    onClick={() => {
                      reset()
                      setFormMode('create')
                      setCategoryToUpdate(null)
                    }}
                    title="Cancel update"
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    disabled={formMode === 'update'}
                    onClick={() => deleteCategoryMutate(id)}
                    title="Delete"
                  >
                    <HiTrash className="h-5 w-5 text-red-500" />
                  </button>
                )}
              </span>
            </li>
          ))}
      </ul>
    </>
  )
}

export default CategoryForm
