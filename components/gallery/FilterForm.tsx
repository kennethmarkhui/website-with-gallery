import { ComponentPropsWithoutRef, Fragment, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { type Category } from 'prisma/prisma-client'
import {
  SubmitHandler,
  useController,
  UseControllerProps,
  useForm,
} from 'react-hook-form'
import { Disclosure, Transition } from '@headlessui/react'
import { HiChevronDown, HiOutlineExclamation } from 'react-icons/hi'
import { FaSpinner } from 'react-icons/fa'
import clsx from 'clsx'

import { type GalleryFilters } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import FloatingLabelInput from '../FloatingLabelInput'
import Button from '../Button'

interface FilterFormProps extends ComponentPropsWithoutRef<'form'> {
  disabled?: boolean
  callback?: () => void
}

interface CategoryCheckboxesProps extends UseControllerProps {
  options: Pick<Category, 'name' | 'id'>[]
  selected?: string[]
  mobile?: boolean
}

// https://github.com/react-hook-form/react-hook-form/issues/9248#issuecomment-1284588424
const CategoryCheckboxes = ({
  options,
  selected,
  mobile,
  control,
  name,
}: CategoryCheckboxesProps): JSX.Element => {
  const { field } = useController({ control, name })
  const [checkedCategories, setCheckedCategories] = useState(
    new Set(selected) || new Set(field.value)
  )

  const handleOnChange = (categoryName: string) => {
    const updatedCheckedCategories = new Set(checkedCategories)
    if (updatedCheckedCategories.has(categoryName)) {
      updatedCheckedCategories.delete(categoryName)
    } else {
      updatedCheckedCategories.add(categoryName)
    }
    field.onChange(Array.from(updatedCheckedCategories))
    setCheckedCategories(updatedCheckedCategories)
  }

  return (
    <ul className="h-full overflow-y-auto">
      {options.map(({ id, name }) => (
        <li key={id} className="space-x-2">
          <input
            id={mobile ? id : id + '-mobile'}
            type="checkbox"
            checked={checkedCategories.has(name)}
            className="cursor-pointer rounded border-gray-300 text-black transition focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-75"
            onChange={() => handleOnChange(name)}
          />
          <label
            htmlFor={mobile ? id : id + '-mobile'}
            className="cursor-pointer truncate text-xs font-medium text-gray-500"
          >
            {name}
          </label>
        </li>
      ))}
    </ul>
  )
}

const FilterForm = ({
  disabled = false,
  callback,
  className,
}: FilterFormProps): JSX.Element => {
  const router = useRouter()
  const { search, categories } = router.query

  const { register, handleSubmit, reset, control } = useForm<GalleryFilters>({
    defaultValues: { search: '', categories: [] },
  })

  const { data, status, error } = useCategory()

  useEffect(() => {
    if (!search && !categories) return
    reset({
      search: typeof search === 'string' ? search : undefined ?? '',
      categories:
        typeof categories === 'string'
          ? categories.split(',')
          : undefined ?? [],
    })
  }, [search, categories, reset])

  const onSubmit: SubmitHandler<GalleryFilters> = (data) => {
    // filter out falsy and empty arrays
    // https://stackoverflow.com/a/38340730
    const filteredData = (Object.keys(data) as (keyof GalleryFilters)[])
      .filter((key) => {
        const value = data[key]
        return Array.isArray(value) ? value.length !== 0 : !!value
      })
      .reduce((newData, currentKey) => {
        const currentValue = data[currentKey]
        return {
          ...newData,
          [currentKey]: Array.isArray(currentValue)
            ? currentValue.join(',')
            : currentValue,
        }
      }, {})

    router.push(!filteredData ? router.pathname : { query: filteredData })
    callback?.()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx('flex min-h-0 w-full flex-col gap-4', className)}
    >
      <fieldset disabled={disabled}>
        <FloatingLabelInput id="search" {...register('search')} />
      </fieldset>
      <Disclosure
        as="fieldset"
        className="flex h-full min-h-0 flex-col"
        disabled={disabled || (status !== 'success' && !data)}
        defaultOpen
      >
        {({ open }) => (
          <>
            <Disclosure.Button
              className={clsx(
                'flex w-full items-center justify-between text-sm',
                open && !disabled ? 'text-black' : 'text-gray-500'
              )}
            >
              <span>Category</span>
              {status === 'loading' && <FaSpinner className="animate-spin" />}
              {status === 'error' && <HiOutlineExclamation />}
              {status === 'success' && (
                <HiChevronDown
                  className={clsx('transition-transform', open && 'rotate-180')}
                />
              )}
            </Disclosure.Button>
            {status === 'success' && data && (
              <Transition
                as={Fragment}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="h-full min-h-0 py-2">
                  <CategoryCheckboxes
                    options={data}
                    selected={
                      typeof categories === 'string'
                        ? categories.split(',')
                        : undefined
                    }
                    control={control}
                    name="categories"
                    mobile={!!callback}
                  />
                </Disclosure.Panel>
              </Transition>
            )}
          </>
        )}
      </Disclosure>
      <Button disabled={disabled} type="submit">
        Search
      </Button>
    </form>
  )
}

export default FilterForm
