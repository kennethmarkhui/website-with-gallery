import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { Category } from 'prisma/prisma-client'
import { HiX, HiTrash, HiPlus, HiPencil } from 'react-icons/hi'
import { ColumnDef } from '@tanstack/react-table'
import { zodResolver } from '@hookform/resolvers/zod'

import DataTable from '../DataTable'
import Button from '../Button'
import type { GalleryCategoryFormFields } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import useCreateCategory from 'hooks/gallery/category/mutations/useCreateCategory'
import useUpdateCategory from 'hooks/gallery/category/mutations/useUpdateCategory'
import useDeleteCategory from 'hooks/gallery/category/mutations/useDeleteCategory'
import FloatingLabelInput from '../FloatingLabelInput'
import { cn } from 'lib/utils'
import { GalleryCategoryFormFieldsSchema } from 'lib/validations'

const CategoryForm = (): JSX.Element => {
  const { data, localizedData, status, error } = useCategory()
  const { locale, locales } = useRouter()

  const { mutate: createMutate, status: createStatus } = useCreateCategory()
  const { mutate: updateMutate, status: updateStatus } = useUpdateCategory()
  const { mutate: deleteMutate, status: deleteStatus } = useDeleteCategory()

  const isLoading =
    status === 'loading' ||
    createStatus === 'loading' ||
    updateStatus === 'loading' ||
    deleteStatus === 'loading'

  const [categoryToUpdate, setCategoryToUpdate] =
    useState<Pick<Category, 'id'>>()

  const {
    register,
    control,
    formState: { errors, dirtyFields },
    handleSubmit,
    setValue,
    setError,
    setFocus,
    reset,
  } = useForm<GalleryCategoryFormFields>({
    resolver: zodResolver(GalleryCategoryFormFieldsSchema),
    defaultValues: { category: [{ code: locale, name: '' }] },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'category',
  })

  const hasDirtyFields = !!dirtyFields.category?.some((obj) =>
    Object.values(obj).some((value) => value)
  )

  const localesWithNoTranslation = locales?.filter((loc) => {
    return !fields.map(({ code }) => code).includes(loc)
  })

  useEffect(() => {
    reset({ category: [{ code: locale, name: '' }] })
    setCategoryToUpdate(undefined)
  }, [locale, reset])

  const onSubmit: SubmitHandler<GalleryCategoryFormFields> = (data) => {
    categoryToUpdate
      ? updateMutate(
          {
            id: categoryToUpdate.id,
            category: data.category,
          },
          {
            onError: ({ error }, variables, context) => {
              if (error?.target === 'category') {
                setError('root.server', { message: error.message })
              }
            },
            onSuccess: (data, variables, context) => {
              reset({ category: [{ code: locale, name: '' }] })
              setCategoryToUpdate(undefined)
            },
          }
        )
      : createMutate(data, {
          onError: ({ error }, variables, context) => {
            if (error?.target === 'category') {
              setError('root.server', { message: error.message })
            }
          },
          onSuccess: (data, variables, context) => {
            reset({ category: [{ code: locale, name: '' }] })
          },
        })
  }

  const columns: ColumnDef<{ id: string; name: string }>[] = [
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
                  reset({ category: [{ code: locale, name: '' }] })
                  setCategoryToUpdate(undefined)
                }}
                title="Cancel update"
              >
                <HiX className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  const category = data
                    ?.find(({ id: dataId }) => dataId === id)
                    ?.translations.map(({ name, language }) => ({
                      name,
                      code: language.code,
                    }))
                  if (!category) {
                    return
                  }
                  setValue('category', category)
                  reset({ category })
                  setCategoryToUpdate({ id })
                  // setFocus('category', { shouldSelect: true })
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
      {errors.root?.server && (
        <p className="text-sm text-red-500">{errors.root.server.message}</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <fieldset className="space-y-6" disabled={isLoading}>
          {fields.map((field, index, arr) => (
            <div key={field.id} className="flex">
              <FloatingLabelInput
                id={`${field.code} category`}
                {...register(`category.${index}.name`)}
                errorMessage={errors.category?.[index]?.name?.message}
                // icon={<HiPlus />}
                disabled={isLoading}
              />
              {arr.length > 1 && (
                <button type="button" onClick={() => remove(index)}>
                  x
                </button>
              )}
            </div>
          ))}
          {Array.isArray(localesWithNoTranslation) &&
            localesWithNoTranslation.length > 0 && (
              <div className="flex gap-2">
                {localesWithNoTranslation.map((locale) => {
                  return (
                    <button
                      type="button"
                      key={locale}
                      onClick={() => append({ code: locale, name: '' })}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      add {locale} translation
                    </button>
                  )
                })}
              </div>
            )}
          <div className="flex gap-4">
            <Button type="submit" disabled={!hasDirtyFields}>
              {categoryToUpdate ? 'Update' : 'Create'}
            </Button>
            {categoryToUpdate && (
              <Button
                type="button"
                onClick={() => {
                  reset({ category: [{ code: locale, name: '' }] })
                  setCategoryToUpdate(undefined)
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </fieldset>
      </form>

      <div
        className={cn(
          'mt-8 md:mt-16',
          isLoading && 'pointer-events-none opacity-70'
        )}
      >
        <DataTable
          columns={columns}
          data={localizedData ?? []}
          isLoading={status === 'loading'}
        />
      </div>
    </>
  )
}

export default CategoryForm
