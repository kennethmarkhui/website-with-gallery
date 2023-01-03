import { ComponentPropsWithoutRef, useState } from 'react'
import { useRouter } from 'next/router'
import { type Category } from 'prisma/prisma-client'
import {
  SubmitHandler,
  useController,
  UseControllerProps,
  useForm,
} from 'react-hook-form'
import { HiOutlineSearch } from 'react-icons/hi'

import { type GalleryFilters } from 'types/gallery'
import useCategory from 'hooks/gallery/category/useCategory'
import FloatingLabelInput from '../FloatingLabelInput'

interface FilterFormProps extends ComponentPropsWithoutRef<'form'> {
  disabled?: boolean
  callback?: () => void
}

interface CategoryCheckboxesProps extends UseControllerProps {
  options: Pick<Category, 'name' | 'id'>[]
}

// https://github.com/react-hook-form/react-hook-form/issues/9248#issuecomment-1284588424
const CategoryCheckboxes = ({
  options,
  control,
  name,
}: CategoryCheckboxesProps): JSX.Element => {
  const { field } = useController({ control, name })
  const [checkedCategories, setCheckedCategories] = useState(
    field.value || new Set()
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
    <ul>
      {options.map(({ id, name }) => (
        <li key={id} className="space-x-2">
          <input
            id={id}
            type="checkbox"
            className="cursor-pointer rounded border-gray-300 text-black transition focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-75"
            onChange={() => handleOnChange(name)}
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

const FilterForm = ({
  disabled = false,
  callback,
  className,
}: FilterFormProps): JSX.Element => {
  const router = useRouter()
  const { register, handleSubmit, control } = useForm<GalleryFilters>({
    defaultValues: { search: '', categories: [] },
  })

  //   TODO: data somehow returns empty array instead of undefined as defined in the type
  const { data, status, error } = useCategory()

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
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <fieldset disabled={disabled}>
        <FloatingLabelInput
          id="search"
          {...register('search')}
          icon={<HiOutlineSearch />}
        />
        {status === 'loading' && <p>loading</p>}
        {status === 'error' && <p>error</p>}
        {status === 'success' && !!data && <p>empty</p>}
        {status === 'success' && data && (
          <CategoryCheckboxes
            options={data}
            control={control}
            name="categories"
          />
        )}
      </fieldset>
    </form>
  )
}

export default FilterForm
