import { ComponentPropsWithoutRef, Fragment, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  SubmitHandler,
  useController,
  UseControllerProps,
  useForm,
} from 'react-hook-form'
import { Disclosure, Transition } from '@headlessui/react'
import {
  HiChevronDown,
  HiOutlineExclamation,
  HiArrowNarrowDown,
} from 'react-icons/hi'
import { FaSpinner } from 'react-icons/fa'
import clsx from 'clsx'

import type {
  GalleryOrderBy,
  GalleryFilters,
  GalleryOrderByDirection,
  GalleryItemKeys,
} from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import FloatingLabelInput from '../FloatingLabelInput'
import Button from '../Button'

interface FilterFormProps extends ComponentPropsWithoutRef<'form'> {
  disabled?: boolean
  callback?: () => void
}

interface CheckboxesProps extends UseControllerProps {
  options: Array<{ id: string; name: string }>
  defaultSelected?: string[]
  mobile?: boolean
}

interface SortByProps extends UseControllerProps {
  options: GalleryItemKeys[]
  defaultSelected?: GalleryOrderBy
}

// https://github.com/react-hook-form/react-hook-form/issues/9248#issuecomment-1284588424
const Checkboxes = ({
  options,
  defaultSelected,
  mobile,
  control,
  name,
}: CheckboxesProps): JSX.Element => {
  const { field } = useController({ control, name })
  const [checkedboxes, setCheckedboxes] = useState(
    new Set(defaultSelected || field.value)
  )

  const handleOnChange = (name: string) => {
    const updatedCheckedboxes = new Set(checkedboxes)
    if (updatedCheckedboxes.has(name)) {
      updatedCheckedboxes.delete(name)
    } else {
      updatedCheckedboxes.add(name)
    }
    field.onChange(Array.from(updatedCheckedboxes))
    setCheckedboxes(updatedCheckedboxes)
  }

  return (
    <ul className="h-full overflow-y-auto">
      {options.map(({ id, name }) => (
        <li key={id} className="space-x-2">
          <input
            id={mobile ? id : id + '-mobile'}
            type="checkbox"
            checked={checkedboxes.has(name)}
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

const SortBy = ({
  options,
  defaultSelected,
  control,
  name,
}: SortByProps): JSX.Element => {
  const { field } = useController({ control, name })
  const [selected, setSelected] = useState(defaultSelected?.[0])
  const [isDesc, setIsDesc] = useState(defaultSelected?.[1] === 'desc')

  const sortDirection = (bool: boolean): GalleryOrderByDirection =>
    bool ? 'desc' : 'asc'

  const handleOnClick = (name: GalleryItemKeys) => {
    if (selected === name) {
      field.onChange([name, sortDirection(!isDesc)])
      setIsDesc((prev) => !prev)
    } else {
      field.onChange([name, 'desc'])
      setSelected(name)
      setIsDesc(true)
    }
  }

  return (
    <ul className="h-full space-y-2">
      {options.map((name, idx) => (
        <li key={idx}>
          <button
            type="button"
            className={clsx(
              'flex w-full justify-between text-xs font-medium',
              selected === name ? 'text-black' : 'text-gray-500'
            )}
            onClick={() => handleOnClick(name)}
          >
            <span>{name}</span>
            {selected === name && (
              <HiArrowNarrowDown
                className={clsx(
                  'transition-transform',
                  !isDesc && 'rotate-180'
                )}
              />
            )}
          </button>
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
  const { search, categories, orderBy } = router.query

  const { register, handleSubmit, reset, control } = useForm<GalleryFilters>({
    defaultValues: { search: '', categories: [], orderBy: [] },
  })

  const { data, status, error } = useCategory()

  useEffect(() => {
    if (!search && !categories && !orderBy) return
    reset({
      search: typeof search === 'string' ? search : undefined ?? '',
      categories:
        typeof categories === 'string'
          ? categories.split(',')
          : undefined ?? [],
      orderBy:
        typeof orderBy === 'string'
          ? (orderBy.split(',') as GalleryOrderBy)
          : undefined ?? [],
    })
  }, [search, categories, orderBy, reset])

  const onSubmit: SubmitHandler<GalleryFilters> = (data) => {
    // filter out falsy and empty arrays
    // https://stackoverflow.com/a/38340730
    const queryObject = (Object.keys(data) as (keyof GalleryFilters)[])
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

    router.push(!queryObject ? router.pathname : { query: queryObject })
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
      {/* TODO: DISCLOSURES TO ONLY OPEN ONE AT A TIME. */}
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
                  <Checkboxes
                    options={data}
                    defaultSelected={
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
      <Disclosure
        as="fieldset"
        className="flex h-full min-h-0 flex-col"
        disabled={disabled}
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
              <span>Sort By</span>
              <HiChevronDown
                className={clsx('transition-transform', open && 'rotate-180')}
              />
            </Disclosure.Button>
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
                <SortBy
                  options={['updatedAt', 'dateAdded', 'id']}
                  defaultSelected={
                    typeof orderBy === 'string'
                      ? (orderBy.split(',') as GalleryOrderBy)
                      : undefined
                  }
                  control={control}
                  name="orderBy"
                />
              </Disclosure.Panel>
            </Transition>
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
