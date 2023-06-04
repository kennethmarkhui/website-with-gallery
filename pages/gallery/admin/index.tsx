import { ReactElement, useEffect, useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import {
  useForm,
  useController,
  SubmitHandler,
  UseControllerProps,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Popover } from '@headlessui/react'
import {
  HiArrowNarrowDown,
  HiChevronDown,
  HiOutlineSearch,
} from 'react-icons/hi'

import type {
  GalleryFormFilters,
  GalleryItem,
  GalleryOffsetResponse,
  NonNullableRecursive,
} from 'types/gallery'
import type { NextPageWithLayout } from 'pages/_app'
import { fetchItems } from 'pages/api/gallery'
import { fetchCategories } from 'pages/api/gallery/category'
import GalleryAdminLayout from '@/components/layout/GalleryAdminLayout'
import DataTable from '@/components/DataTable'
import FloatingLabelInput from '@/components/FloatingLabelInput'
import Button from '@/components/Button'
import useOffsetGallery from 'hooks/gallery/useOffsetGallery'
import useCategory from 'hooks/gallery/category/useCategory'
import useUrlGalleryFilters from 'hooks/gallery/useUrlGalleryFilters'
import { cn, pick, removeEmptyObjectFromArray } from 'lib/utils'
import {
  GalleryFormFiltersSchema,
  GalleryOffsetQuerySchema,
} from 'lib/validations'
import { GALLERY_LIMIT } from 'constants/gallery'

type TableFilterFormValues = Omit<GalleryFormFilters, 'orderBy'>

interface DataTableCheckBoxesProps extends UseControllerProps {
  options: { id: string; name: string }[]
}

interface TableFilterFormProps {
  defaultValues: TableFilterFormValues
  onSubmitCallback: (data: { id: string; value: string | string[] }[]) => void
}

const Checkboxes = ({
  options,
  control,
  name,
}: DataTableCheckBoxesProps): JSX.Element => {
  const { field } = useController({ control, name })
  const checked = new Set(field.value as string)

  const handleOnChange = (name: string) => {
    if (checked.has(name)) {
      checked.delete(name)
    } else {
      checked.add(name)
    }
    field.onChange(Array.from(checked))
  }

  return (
    <Popover className="relative inline-block">
      <Popover.Button className="relative cursor-pointer bg-white py-2 pl-3 pr-10 text-left">
        <span className="block truncate capitalize">{name}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <HiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </Popover.Button>
      <Popover.Panel
        as="ul"
        className="absolute right-0 z-10 mt-2 max-h-44 w-28 origin-top-right overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        {options.map(({ id, name }) => (
          <li key={id} className="flex space-x-2 px-2 py-1">
            <input
              id={id}
              type="checkbox"
              checked={checked.has(name)}
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
      </Popover.Panel>
    </Popover>
  )
}

const TableFilterForm = ({
  defaultValues,
  onSubmitCallback,
}: TableFilterFormProps) => {
  const { data } = useCategory()

  const { register, formState, handleSubmit, reset, control } =
    useForm<TableFilterFormValues>({
      resolver: zodResolver(
        GalleryFormFiltersSchema.pick({ search: true, category: true })
      ),
      defaultValues,
    })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit: SubmitHandler<TableFilterFormValues> = (data) => {
    onSubmitCallback(
      Object.entries(data).map(([id, value]) => {
        if (id === 'search') {
          return { id: 'id', value }
        }
        return { id, value }
      })
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-between gap-4 p-2 sm:flex-row"
    >
      <FloatingLabelInput id="search" {...register('search')} />
      <Checkboxes control={control} name="category" options={data ?? []} />
      <Button disabled={!formState.isDirty} type="submit">
        <HiOutlineSearch />
      </Button>
    </form>
  )
}

const Admin: NextPageWithLayout = (): JSX.Element => {
  // TODO: use ImageViewerModal to view the image
  const { filters, setUrlGalleryFilters } = useUrlGalleryFilters()

  const { data, status, error, isPreviousData } = useOffsetGallery({ filters })
  const { data: categories } = useCategory()

  const items = useMemo<NonNullableRecursive<GalleryItem[]>>(
    () =>
      data?.items.map(({ id, name, storage, category, image }) => ({
        id,
        name: name ?? '',
        storage: storage ?? '',
        category: category ?? '',
        image: {
          url: image?.url ?? '/placeholder.png',
          width: image?.width ?? 1665,
          height: image?.height ?? 2048,
          publicId: image?.publicId ?? '',
        },
      })) || [],
    [data?.items]
  )

  const columns: ColumnDef<NonNullableRecursive<GalleryItem>>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => {
        const isDesc = column.getIsSorted() === 'desc'
        return (
          <button
            className="flex items-center gap-2"
            onClick={() => {
              column.toggleSorting(!isDesc)
            }}
          >
            ID
            <HiArrowNarrowDown
              className={cn('transition-transform', !isDesc && 'rotate-180')}
            />
          </button>
        )
      },
    },
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => {
        // TODO: getValue type is not inferred and is unknown
        // https://github.com/TanStack/table/pull/4109
        const {
          id,
          image: { url, width, height },
        } = row.original
        return (
          <div className="relative h-32 w-32">
            <Image
              src={url}
              alt={id}
              className="absolute inset-0 h-full w-full object-contain"
              width={width}
              height={height}
            />
          </div>
        )
      },
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'storage', header: 'Storage' },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="rounded bg-gray-300 px-2 py-0.5 text-xs font-medium text-gray-800 empty:hidden">
          {row.original.category}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const {
          id,
          name,
          storage,
          category,
          image: { url, publicId, width, height },
        } = row.original
        return (
          <Link
            href={{
              pathname: `/gallery/admin/update/${id}`,
              query: {
                data: JSON.stringify({
                  name,
                  storage,
                  category,
                  image: {
                    url, // if no image this should be the placeholder image
                    publicId,
                    width,
                    height,
                  },
                }),
              },
            }}
            className="font-medium text-gray-500 hover:text-black hover:underline"
            aria-label="edit image"
          >
            Edit
          </Link>
        )
      },
    },
  ]

  const filterState = Object.entries(filters).map(([id, value]) => {
    if (id === 'search' && typeof value === 'string') {
      return { id: 'id', value }
    }
    if (id === 'category' && typeof value === 'string') {
      return {
        id,
        value:
          typeof value === 'string' && value.includes(',')
            ? value.split(',')
            : [value],
      }
    }
    return {} as { id: string; value: string | string[] }
  })

  return (
    <DataTable
      columns={columns}
      data={items}
      manualFiltering={{
        state: filterState,
        render: (table) => (
          <TableFilterForm
            defaultValues={{
              search:
                (typeof filters.search === 'string' && filters.search) || '',
              category:
                typeof filters.category === 'string'
                  ? filters.category.includes(',')
                    ? filters.category.split(',')
                    : [filters.category]
                  : [],
            }}
            onSubmitCallback={(data) => table.setColumnFilters(data)}
          />
        ),
        onColumnFiltersChange: (state) => {
          const query = state.reduce((prev, { id, value }) => {
            return Object.assign(
              prev,
              Array.isArray(value)
                ? value.length !== 0
                  ? { [id]: value.join(',') }
                  : {}
                : id === 'id'
                ? { search: value }
                : {}
            )
          }, {})
          setUrlGalleryFilters({ query })
        },
        filters: [{ id: 'category', data: categories ?? [] }],
      }}
      manualSorting={{
        state: [
          {
            id:
              typeof filters.orderBy === 'string'
                ? filters.orderBy.split(',')[0]
                : 'id',
            desc:
              typeof filters.orderBy === 'string'
                ? filters.orderBy.split(',')[1] === 'desc'
                : true,
          },
        ],
        onSortingChange: (state) => {
          const orderBy = `${state[0].id},${state[0].desc ? 'desc' : 'asc'}`
          setUrlGalleryFilters({ query: { orderBy } })
        },
      }}
      manualPagination={{
        state: {
          pageIndex: data?.page ? data.page - 1 : 0,
          pageSize: GALLERY_LIMIT,
        },
        dataCount: data?.totalCount ?? 0,
        onPaginationChange: ({ pageIndex }) => {
          setUrlGalleryFilters((prev) => ({
            query: { ...prev, page: pageIndex + 1 + '' },
          }))
        },
      }}
      isLoading={isPreviousData}
    />
  )
}

Admin.getLayout = function getLayout(page: ReactElement) {
  return <GalleryAdminLayout>{page}</GalleryAdminLayout>
}

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
}) => {
  const queryClient = new QueryClient()

  const parsedQuery = GalleryOffsetQuerySchema.safeParse(query)

  if (!parsedQuery.success) {
    return { redirect: { destination: '/500', permanent: false } }
  }

  const queryKey = removeEmptyObjectFromArray([
    'gallery',
    'offset',
    parsedQuery.data,
  ])

  try {
    await queryClient.fetchQuery<GalleryOffsetResponse>(queryKey, () =>
      fetchItems({ ...parsedQuery.data, page: parsedQuery.data.page ?? '1' })
    )
    await queryClient.fetchQuery(['categories'], () => fetchCategories())
  } catch (error) {
    return {
      redirect: { destination: '/500', permanent: false },
    }
  }

  return {
    props: {
      messages: pick(await import(`../../../intl/${locale}.json`), ['gallery']),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  }
}

export default Admin
