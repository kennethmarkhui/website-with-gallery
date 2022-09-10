import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import type { GalleryFormMode } from 'types/gallery'
import useCreateCategory from 'hooks/gallery/category/use-create-category'
import useUpdateCategory from 'hooks/gallery/category/use-update-category'
import useDeleteCategory from 'hooks/gallery/category/use-delete-category'

interface ICategoryForm {
  categories: string[]
}

const CategoryForm = ({ categories }: ICategoryForm): JSX.Element => {
  // TODO use react-query for caching categories with ISR ?hydration?
  const [categoryList, setCategoryList] = useState<string[]>(categories)

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
              if (error.target === 'category') {
                setError(
                  error.target,
                  { message: error.message },
                  { shouldFocus: true }
                )
              }
            },
            onSuccess: (data, variables, context) => {
              reset()
              setCategoryList((prev) =>
                prev.map((current) =>
                  current === variables.old ? variables.new.category : current
                )
              )
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
            setCategoryList((prev) => [...prev, variables.category])
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
        {categoryList.length === 0 && <p>empty category list</p>}
        {categoryList.map((category, index) => (
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
              <button
                onClick={() =>
                  deleteCategoryMutate(category, {
                    onSuccess: (data, variables, context) => {
                      setCategoryList((prev) =>
                        prev.filter((current) => current !== variables)
                      )
                    },
                  })
                }
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
