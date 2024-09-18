'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { Category } from 'prisma/prisma-client'
import { HiX, HiTrash, HiPencil } from 'react-icons/hi'
import { ColumnDef } from '@tanstack/react-table'
import { zodResolver } from '@hookform/resolvers/zod'

import DataTable from '@/components/data-table'
import Button from '@/components/button'
import type { GalleryCategoryFormFields } from '@/types/gallery'
import useCategory from '@/hooks/use-category'
import useCreateCategory from '@/hooks/use-create-category'
import useUpdateCategory from '@/hooks/use-update-category'
import useDeleteCategory from '@/hooks/use-delete-category'
import FloatingLabelInput from '@/components/floating-label-input'
import { cn } from '@/lib/utils'
import {
  i18nErrorMap,
  isI18nGalleryFormErrorCode,
  GalleryCategoryFormFieldsSchema,
} from '@/lib/validations'
import { i18n } from '@/i18n/config'
import setFormServerErrors from './set-form-server-error'

const CategoryForm = (): JSX.Element => {
  const locale = useLocale()
  const { data, localizedData, status, error } = useCategory()
  const t = useTranslations('form')

  const { mutate: createMutate, status: createStatus } = useCreateCategory()
  const { mutate: updateMutate, status: updateStatus } = useUpdateCategory()
  const { mutate: deleteMutate, status: deleteStatus } = useDeleteCategory()

  const isLoading =
    status === 'pending' ||
    createStatus === 'pending' ||
    updateStatus === 'pending' ||
    deleteStatus === 'pending'

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
    resolver: zodResolver(GalleryCategoryFormFieldsSchema, {
      errorMap: i18nErrorMap,
    }),
    defaultValues: { name: [{ code: locale, value: '' }] },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'name',
  })

  const hasDirtyFields = !!dirtyFields.name?.some((obj) =>
    Object.values(obj).some((value) => value)
  )

  const localesWithNoTranslation = i18n.locales.filter((loc) => {
    return !fields.map(({ code }) => code).includes(loc)
  })

  const onSubmit: SubmitHandler<GalleryCategoryFormFields> = (data) => {
    categoryToUpdate
      ? updateMutate(
          {
            id: categoryToUpdate.id,
            name: data.name,
          },
          {
            onSuccess: (response) => {
              if (response?.errors) {
                return setFormServerErrors({
                  setError,
                  errors: response.errors,
                })
              }
              reset({ name: [{ code: locale, value: '' }] })
              setCategoryToUpdate(undefined)
            },
            onError: ({ message }, variables, context) => {
              // TODO: handle server thrown error
            },
          }
        )
      : createMutate(data, {
          onSuccess: (response) => {
            if (response?.errors) {
              return setFormServerErrors({ setError, errors: response.errors })
            }
            reset({ name: [{ code: locale, value: '' }] })
          },
          onError: ({ message }, variables, context) => {
            // TODO: handle server thrown error
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
                  reset({ name: [{ code: locale, value: '' }] })
                  setCategoryToUpdate(undefined)
                }}
                title={t('cancel')}
              >
                <HiX className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  const name = data
                    ?.find(({ id: dataId }) => dataId === id)
                    ?.translations.map(({ name, language }) => ({
                      code: language.code,
                      value: name,
                    }))
                  if (!name) {
                    return
                  }
                  setValue('name', name)
                  reset({ name })
                  setCategoryToUpdate({ id })
                  // setFocus('category', { shouldSelect: true })
                }}
                title={`${t('update')} '${name}'`}
              >
                <HiPencil className="h-5 w-5" />
              </button>
            )}
            <button
              disabled={!!categoryToUpdate}
              onClick={() => deleteMutate(id)}
              title={t('delete')}
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
          {fields.map((field, index, arr) => {
            let errorMessage = errors.name?.[index]?.value?.message
            if (
              typeof errorMessage === 'string' &&
              isI18nGalleryFormErrorCode(errorMessage)
            ) {
              errorMessage = t(`validations.${errorMessage}`, {
                length:
                  GalleryCategoryFormFieldsSchema.shape.name.element.shape.value
                    .maxLength,
              })
            }
            return (
              <div key={field.id} className="flex">
                <FloatingLabelInput
                  id={t('translated-category', { language: field.code })}
                  {...register(`name.${index}.value`)}
                  errorMessage={errorMessage}
                  // icon={<HiPlus />}
                  disabled={isLoading}
                />
                {arr.length > 1 && (
                  <button type="button" onClick={() => remove(index)}>
                    x
                  </button>
                )}
              </div>
            )
          })}
          {Array.isArray(localesWithNoTranslation) &&
            localesWithNoTranslation.length > 0 && (
              <div className="flex gap-2">
                {localesWithNoTranslation.map((locale) => {
                  return (
                    <button
                      type="button"
                      key={locale}
                      onClick={() => append({ code: locale, value: '' })}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      {t('add-translation', { language: locale })}
                    </button>
                  )
                })}
              </div>
            )}
          <div className="flex gap-4">
            <Button type="submit" disabled={!hasDirtyFields}>
              {categoryToUpdate ? t('update') : t('create')}
            </Button>
            {categoryToUpdate && (
              <Button
                type="button"
                onClick={() => {
                  reset({ name: [{ code: locale, value: '' }] })
                  setCategoryToUpdate(undefined)
                }}
              >
                {t('cancel')}
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
          isLoading={status === 'pending'}
        />
      </div>
    </>
  )
}

export default CategoryForm
