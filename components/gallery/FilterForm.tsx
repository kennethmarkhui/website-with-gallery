import { ComponentPropsWithoutRef, ReactNode, useEffect, useState } from 'react'
import {
  SubmitHandler,
  useController,
  UseControllerProps,
  useForm,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  HiChevronDown,
  HiArrowNarrowDown,
  HiOutlineSearch,
} from 'react-icons/hi'

import type {
  GalleryFormFilters,
  GalleryOrderByDirection,
  GalleryItemKeys,
} from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import FloatingLabelInput from '../FloatingLabelInput'
import Button from '../Button'
import { cn } from 'lib/utils'
import { GalleryFormFiltersSchema } from 'lib/validations'

interface FilterFormProps extends ComponentPropsWithoutRef<'form'> {
  disabled?: boolean
  defaultValues: GalleryFormFilters
  onSubmitCallback: (data: GalleryFormFilters) => void
}

interface CheckboxesProps extends UseControllerProps {
  options: Array<{ id: string; name: string }>
}

interface SortByProps extends UseControllerProps {
  options: GalleryItemKeys[]
}

interface AccordionProps {
  panels: { title: string; content: ReactNode }[]
}

const Checkboxes = ({
  options,
  control,
  name,
}: CheckboxesProps): JSX.Element => {
  const { field } = useController({ control, name })
  const checkedboxes = new Set<string>(field.value)

  const handleOnChange = (name: string) => {
    if (checkedboxes.has(name)) {
      checkedboxes.delete(name)
    } else {
      checkedboxes.add(name)
    }
    field.onChange(Array.from(checkedboxes))
  }

  return (
    <ul className="h-full space-y-2 overflow-y-auto">
      {options.map(({ id, name }) => (
        <li key={id} className="flex space-x-2 px-2">
          <input
            id={id}
            type="checkbox"
            checked={checkedboxes.has(name)}
            className="cursor-pointer rounded border-gray-300 text-black transition focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-75"
            onChange={() => handleOnChange(name)}
            value={name}
          />
          <label
            htmlFor={id}
            className="cursor-pointer truncate text-xs font-medium text-gray-500"
          >
            {name}
          </label>
        </li>
      ))}
    </ul>
  )
}

const SortBy = ({ options, control, name }: SortByProps): JSX.Element => {
  const { field } = useController({ control, name })
  const selected = field.value[0]
  const isDesc = field.value[1] === 'desc'

  const sortDirection = (bool: boolean): GalleryOrderByDirection =>
    bool ? 'desc' : 'asc'

  const handleOnClick = (name: GalleryItemKeys) => {
    selected === name
      ? field.onChange([name, sortDirection(!isDesc)])
      : field.onChange([name, 'desc'])
  }

  return (
    <ul className="h-full space-y-2">
      {options.map((name, idx) => (
        <li className="pl-2 pr-6" key={idx}>
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between text-xs font-medium',
              selected === name ? 'text-black' : 'text-gray-500'
            )}
            onClick={() => handleOnClick(name)}
          >
            <span>{name}</span>
            {selected === name && (
              <HiArrowNarrowDown
                className={cn('transition-transform', !isDesc && 'rotate-180')}
              />
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}

const Accordion = ({ panels }: AccordionProps): JSX.Element => {
  const [active, setActive] = useState<number | undefined>(0)

  const handleActive = (idx: number) => {
    setActive((prev) => (prev === idx ? undefined : idx))
  }

  return (
    <>
      {panels.map(({ title, content }, idx) => {
        const isActive = active === idx
        return (
          <fieldset
            key={idx}
            className={cn('flex flex-col gap-4', isActive && 'min-h-0')}
          >
            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-between text-sm',
                isActive ? 'text-black' : 'text-gray-500'
              )}
              onClick={() => handleActive(idx)}
              aria-expanded={isActive}
              {...(isActive && {
                'aria-controls': title,
              })}
            >
              <span>{title}</span>
              <HiChevronDown
                className={cn('transition-transform', isActive && 'rotate-180')}
              />
            </button>
            {isActive && (
              <div id={title} className="h-full min-h-0 py-2">
                {content}
              </div>
            )}
          </fieldset>
        )
      })}
    </>
  )
}

const FilterForm = ({
  disabled = false,
  defaultValues,
  onSubmitCallback,
  className,
}: FilterFormProps): JSX.Element => {
  const {
    register,
    formState: { isDirty },
    handleSubmit,
    reset,
    control,
  } = useForm<GalleryFormFilters>({
    resolver: zodResolver(GalleryFormFiltersSchema),
    defaultValues,
  })

  const { data, status, error } = useCategory()

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit: SubmitHandler<GalleryFormFilters> = (data) => {
    onSubmitCallback(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('flex h-full min-h-0 w-full flex-col gap-4', className)}
    >
      <fieldset disabled={disabled}>
        <FloatingLabelInput id="search" {...register('search')} />
      </fieldset>
      <Accordion
        panels={[
          {
            title: 'Category',
            content: (
              <Checkboxes options={data!} control={control} name="category" />
            ),
          },
          {
            title: 'Sort By',
            content: (
              <SortBy
                options={['updatedAt', 'dateAdded', 'id']}
                control={control}
                name="orderBy"
              />
            ),
          },
        ]}
      />

      <Button disabled={!isDirty || disabled} type="submit">
        <HiOutlineSearch />
      </Button>
    </form>
  )
}

export default FilterForm
