import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Category } from 'prisma/prisma-client'
import { HiX, HiTrash, HiPlus, HiPencil } from 'react-icons/hi'
import { ColumnDef } from '@tanstack/react-table'
import { zodResolver } from '@hookform/resolvers/zod'

import DataTable from '../DataTable'
import type { GalleryCategoryFormFields } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import useCreateCategory from 'hooks/gallery/category/mutations/useCreateCategory'
import useUpdateCategory from 'hooks/gallery/category/mutations/useUpdateCategory'
import useDeleteCategory from 'hooks/gallery/category/mutations/useDeleteCategory'
import FloatingLabelInput from '../FloatingLabelInput'
import { cn } from 'lib/utils'
import { GalleryCategoryFormFieldsSchema } from 'lib/validations'

const CategoryForm = (): JSX.Element => {
  const { data, status, error } = useCategory()

  const { mutate: createMutate, status: createStatus } = useCreateCategory()
  const { mutate: updateMutate, status: updateStatus } = useUpdateCategory()
  const { mutate: deleteMutate, status: deleteStatus } = useDeleteCategory()

  const isLoading =
    status === 'loading' ||
    createStatus === 'loading' ||
    updateStatus === 'loading' ||
    deleteStatus === 'loading'

  const [categoryToUpdate, setCategoryToUpdate] =
    useState<Pick<Category, 'id' | 'name'>>()

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
    return categoryToUpdate
      ? updateMutate(
          {
            id: categoryToUpdate.id,
            name: data.category,
            oldName: categoryToUpdate.name,
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
              setCategoryToUpdate(undefined)
            },
          }
        )
      : createMutate(data, {
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

  const columns: ColumnDef<Pick<Category, 'id' | 'name'>>[] = [
    { accessorKey: 'name', header: 'Name' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { id, name } = row.original
        return (
          <div className="flex gap-4">
            {categoryToUpdate?.id === id ? (
              <button
                onClick={() => {
                  reset()
                  setCategoryToUpdate(undefined)
                }}
                title="Cancel update"
              >
                <HiX className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setValue('category', name)
                  setCategoryToUpdate({ id, name })
                  setFocus('category', { shouldSelect: true })
                }}
                title={`Update '${name}'`}
              >
                <HiPencil className="h-5 w-5" />
              </button>
            )}
            <button
              disabled={!!categoryToUpdate}
              onClick={() => deleteMutate(id)}
              title="Delete"
            >
              <HiTrash className="h-5 w-5 text-red-500" />
            </button>
          </div>
        )
      },
    },
  ]

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
          disabled={isLoading}
        />
      </form>

      <div
        className={cn(
          'mt-8 md:mt-16',
          isLoading && 'pointer-events-none opacity-70'
        )}
      >
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={status === 'loading'}
        />
      </div>
    </>
  )
}

export default CategoryForm
