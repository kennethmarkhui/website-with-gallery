import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Category } from 'prisma/prisma-client'
import { HiX, HiTrash, HiPlus } from 'react-icons/hi'

import type { GalleryCategoryFormFields, GalleryFormMode } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import useCreateCategory from 'hooks/gallery/category/mutations/useCreateCategory'
import useUpdateCategory from 'hooks/gallery/category/mutations/useUpdateCategory'
import useDeleteCategory from 'hooks/gallery/category/mutations/useDeleteCategory'
import FloatingLabelInput from '../FloatingLabelInput'
import { cn } from 'lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { GalleryCategoryFormFieldsSchema } from 'lib/validations'

const CategoryForm = (): JSX.Element => {
  const { data: categories, status: categoryStatus, error } = useCategory()

  const { mutate: createCategoryMutate, status: createCategoryStatus } =
    useCreateCategory()
  const { mutate: updateCategoryMutate, status: updateCategoryStatus } =
    useUpdateCategory()
  const { mutate: deleteCategoryMutate, status: deleteCategoryStatus } =
    useDeleteCategory()

  const categoryFormIsLoading =
    categoryStatus === 'loading' ||
    createCategoryStatus === 'loading' ||
    updateCategoryStatus === 'loading' ||
    deleteCategoryStatus === 'loading'

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
  } = useForm<GalleryCategoryFormFields>({
    resolver: zodResolver(GalleryCategoryFormFieldsSchema),
  })

  const onSubmit: SubmitHandler<GalleryCategoryFormFields> = (data) => {
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
          {...register('category')}
          errorMessage={errors.category?.message}
          icon={<HiPlus />}
          disabled={categoryFormIsLoading}
        />
      </form>

      <ul
        className={cn(
          'mt-8 flex flex-wrap gap-4 md:mt-16',
          categoryFormIsLoading && 'pointer-events-none opacity-70'
        )}
      >
        {categoryStatus === 'loading' && <p>loading</p>}
        {categoryStatus === 'error' && error instanceof Error && (
          <p>{error.message}</p>
        )}
        {categoryStatus === 'success' && categories?.length === 0 && (
          <p>empty category list</p>
        )}
        {categoryStatus === 'success' &&
          categories?.map(({ id, name }) => (
            <li key={id}>
              <span
                className={cn(
                  'flex items-center gap-4 rounded-full border px-4 py-2 text-lg shadow',
                  categoryToUpdate?.id === id && 'border-black'
                )}
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
