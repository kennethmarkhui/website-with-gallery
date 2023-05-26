import { ReactElement, useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  functionalUpdate,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table'

import type {
  GalleryItem,
  GalleryOffsetResponse,
  NonNullableRecursive,
} from 'types/gallery'
import type { NextPageWithLayout } from 'pages/_app'
import { fetchItems } from 'pages/api/gallery'
import { fetchCategories } from 'pages/api/gallery/category'
import GalleryAdminLayout from '@/components/layout/GalleryAdminLayout'
import useOffsetGallery from 'hooks/gallery/useOffsetGallery'
import { cn, pick, removeEmptyObjectFromArray } from 'lib/utils'
import { GalleryFiltersSchema } from 'lib/validations'
import { GALLERY_LIMIT } from 'constants/gallery'

interface PaginationProps {
  currentPage: number
  totalCount: number
  totalPage: number
  setPageIndex: (index: number) => void
  previousPage: () => void
  nextPage: () => void
  hasPreviousPage: boolean
  hasNextPage: boolean
}

interface DataTableProps {
  items: NonNullableRecursive<GalleryItem[]>
  page?: number
  itemCount?: number
  isPreviousData: boolean
}

const DataTable = ({
  items,
  page,
  itemCount,
  isPreviousData,
}: DataTableProps): JSX.Element => {
  const router = useRouter()

  const currentPage = page ?? 1
  const totalCount = itemCount ?? 0
  const totalPage = Math.ceil(totalCount / GALLERY_LIMIT)

  const pagination = {
    pageIndex: currentPage - 1,
    pageSize: GALLERY_LIMIT,
  } satisfies PaginationState

  const columns: ColumnDef<NonNullableRecursive<GalleryItem>>[] = [
    { accessorKey: 'id', header: 'ID' },
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

  const {
    getHeaderGroups,
    getRowModel,
    setPageIndex,
    previousPage,
    nextPage,
    getCanPreviousPage,
    getCanNextPage,
  } = useReactTable({
    data: items,
    columns,
    pageCount: totalPage,
    state: {
      pagination,
    },
    onPaginationChange: (updater) => {
      const { pageIndex } = functionalUpdate(updater, pagination)
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, page: pageIndex + 1 },
        },
        undefined,
        { shallow: true }
      )
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    debugTable: true,
  })

  return (
    <div
      className={cn(
        'relative w-full space-y-4 overflow-hidden',
        isPreviousData && 'pointer-events-none opacity-50'
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase">
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="px-4 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {getRowModel().rows.length ? (
              getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="h-24 p-4 text-center" colSpan={columns.length}>
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={+currentPage}
        totalCount={totalCount}
        totalPage={totalPage}
        setPageIndex={(idx) => setPageIndex(idx)}
        previousPage={previousPage}
        nextPage={nextPage}
        hasPreviousPage={getCanPreviousPage()}
        hasNextPage={getCanNextPage()}
      />
    </div>
  )
}

const Pagination = ({
  currentPage,
  totalCount,
  totalPage,
  setPageIndex,
  previousPage,
  nextPage,
  hasPreviousPage,
  hasNextPage,
}: PaginationProps): JSX.Element => {
  const pageRangeDisplayed = 2
  const marginPagesDisplayed = 1

  const pages: number[] = []
  if (totalPage <= pageRangeDisplayed) {
    for (let index = 1; index <= totalPage; index++) {
      pages.push(index)
    }
  } else {
    // paginate logic from react-paginate's paginate function
    // https://github.com/AdeleD/react-paginate/blob/master/react_components/PaginationBoxView.js
    let leftSide = pageRangeDisplayed / 2
    let rightSide = pageRangeDisplayed - leftSide

    if (currentPage > totalPage - pageRangeDisplayed / 2) {
      rightSide = totalPage - currentPage
      leftSide = pageRangeDisplayed - rightSide
    } else if (currentPage < pageRangeDisplayed / 2) {
      leftSide = currentPage
      rightSide = pageRangeDisplayed - leftSide
    }

    for (let page = 1; page <= totalPage; page++) {
      if (page <= marginPagesDisplayed) {
        pages.push(page)
        continue
      }

      if (page > totalPage - marginPagesDisplayed) {
        pages.push(page)
        continue
      }

      const adjustedRightSide =
        currentPage === 0 && pageRangeDisplayed > 1 ? rightSide - 1 : rightSide

      if (
        page >= currentPage - leftSide &&
        page <= currentPage + adjustedRightSide
      ) {
        pages.push(page)
        continue
      }

      if (
        pages.length > 0 &&
        !isNaN(pages[pages.length - 1]) &&
        (pageRangeDisplayed > 0 || marginPagesDisplayed > 0)
      ) {
        pages.push(NaN)
      }
    }

    pages.forEach((page, i) => {
      const pageBefore = pages[i - 1]
      const pageAfter = pages[i + 1]

      if (
        isNaN(page) &&
        pageBefore &&
        !isNaN(pageBefore) &&
        pageAfter &&
        !isNaN(pageAfter) &&
        pageAfter - pageBefore <= 2
      ) {
        page = (pageAfter + pageBefore) / 2
      }
      pages[i] = page
    })
  }

  return (
    <nav className="flex flex-col items-center justify-center space-y-3 p-4 md:flex-row md:justify-between md:space-y-0">
      <p className="text-sm">
        Total Items: <span className="font-semibold">{totalCount}</span>
      </p>
      <ul className="inline-flex -space-x-px">
        <li>
          <button
            className={cn(
              'flex h-full items-center justify-center rounded-l-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              !hasPreviousPage && 'pointer-events-none'
            )}
            onClick={previousPage}
            disabled={!hasPreviousPage}
          >
            <span className="sr-only">Previous</span>
            <HiChevronLeft />
          </button>
        </li>
        {pages.map((page, idx) => {
          const disabled = currentPage === page || isNaN(page)
          return (
            <li key={idx}>
              <button
                className={cn(
                  'flex items-center justify-center border border-gray-300 px-3 py-2 text-sm leading-tight text-gray-600 hover:bg-gray-100 hover:text-gray-700',
                  disabled
                    ? 'pointer-events-none bg-gray-50 text-gray-600'
                    : 'text-gray-500'
                )}
                onClick={() => setPageIndex(page - 1)}
                disabled={disabled}
              >
                {!isNaN(page) ? page : '...'}
              </button>
            </li>
          )
        })}
        <li>
          <button
            className={cn(
              'flex h-full items-center justify-center rounded-r-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              !hasNextPage && 'pointer-events-none'
            )}
            onClick={nextPage}
            disabled={!hasNextPage}
          >
            <span className="sr-only">Next</span>
            <HiChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  )
}

const Admin: NextPageWithLayout = (): JSX.Element => {
  // TODO: use ImageViewerModal to view the image
  const router = useRouter()
  const filters = router.query

  const { data, status, error, isPreviousData } = useOffsetGallery({ filters })

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

  return (
    <DataTable
      items={items}
      page={data?.page}
      itemCount={data?.totalCount}
      isPreviousData={isPreviousData}
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

  const parsedQuery = GalleryFiltersSchema.safeParse(query)

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
