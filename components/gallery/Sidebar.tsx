import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import { HiOutlineSearch } from 'react-icons/hi'

import { GalleryFilters } from 'types/gallery'
import FloatingLabelInput from '../FloatingLabelInput'
import useCategory from 'hooks/gallery/category/useCategory'

interface SidebarProps {
  disabled?: boolean
}

const Sidebar = ({ disabled = false }: SidebarProps): JSX.Element => {
  const router = useRouter()
  const { register, handleSubmit } = useForm<GalleryFilters>({
    defaultValues: { search: '', categories: [] },
  })

  const { data, status, error } = useCategory()

  const onSubmit: SubmitHandler<GalleryFilters> = (data) => {
    // filter out falsy and empty arrays
    const filteredData = (Object.keys(data) as (keyof GalleryFilters)[])
      .filter((key) =>
        Array.isArray(data[key]) ? data[key]?.length !== 0 : !!data[key]
      )
      .reduce(
        (newData, currentKey) => ({
          ...newData,
          [currentKey]: data[currentKey],
        }),
        {}
      )

    router.push(!filteredData ? router.pathname : { query: filteredData })
  }

  return (
    <aside className="sticky top-8 hidden h-full shrink-0 basis-1/6 divide-y pt-4 lg:flex lg:flex-col">
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={disabled}>
          <FloatingLabelInput
            id="search"
            {...register('search')}
            icon={<HiOutlineSearch />}
          />
          {status === 'loading' && <p>loading</p>}
          {status === 'error' && <p>error</p>}
          {status === 'success' && (
            <ul>
              {data?.map(({ id, name }) => (
                <li key={id} className="space-x-2">
                  <input
                    id={id}
                    type="checkbox"
                    className="cursor-pointer rounded border-gray-300 text-black transition focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-75"
                    {...register('categories')}
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
          )}
        </fieldset>
      </form>
    </aside>
  )
}

export default Sidebar
