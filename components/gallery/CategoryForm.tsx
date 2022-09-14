import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Category } from 'prisma/prisma-client'
import { HiPlus, HiX, HiTrash } from 'react-icons/hi'

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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative mx-auto mt-4 flex flex-col items-center justify-center sm:mt-8 md:mt-16"
      >
        <div>
          <label htmlFor="category" className="sr-only" />
          <input
            id="category"
            {...register('category', {
              required: 'Must not be empty.',
              maxLength: { value: 20, message: 'Max character of 20.' },
            })}
            placeholder="Add a Category"
            title="Add a Category"
            className={`border-grey-300 -mr-8 w-full transform rounded-full border px-6 py-2 shadow transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-black ${
              errors.category && 'border-red-500 focus:ring-red-500'
            }`}
          />
          <button
            type="submit"
            disabled={!isDirty}
            className="transform"
            title="Submit"
          >
            <HiPlus className="text-gray-500 duration-200 hover:text-black focus:text-black" />
          </button>
        </div>
        {errors.category && (
          <span className="absolute top-10 text-red-500">
            {errors.category.message}
          </span>
        )}
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
                    reset()
                    setValue('category', name)
                    setFormMode('update')
                    setCategoryToUpdate({ id, name })
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
