import { ReactElement, useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

import type {
  GalleryFilters,
  GalleryItem,
  GalleryOffsetResponse,
  NonNullableRecursive,
  RequireKeys,
} from 'types/gallery'
import type { NextPageWithLayout } from 'pages/_app'
import { fetchItems } from 'pages/api/gallery'
import { fetchCategories } from 'pages/api/gallery/category'
import GalleryAdminLayout from '@/components/layout/GalleryAdminLayout'
import useOffsetGallery from 'hooks/gallery/useOffsetGallery'
import { isValidRequest, pick, removeEmptyObjectFromArray } from 'lib/utils'
import { GALLERY_LIMIT } from 'constants/gallery'

interface PaginationProps {
  currentPage: number
  totalCount: number
  totalPage: number
}

interface TableProps {
  items: NonNullableRecursive<GalleryItem[]>
}

const Table = ({ items }: TableProps): JSX.Element => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-xs uppercase">
          <tr>
            <th scope="col" className="px-4 py-3">
              id
            </th>
            <th scope="col" className="px-4 py-3">
              image
            </th>
            <th scope="col" className="px-4 py-3">
              name
            </th>
            <th scope="col" className="px-4 py-3">
              storage
            </th>
            <th scope="col" className="px-4 py-3">
              category
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(
            ({
              id,
              name,
              storage,
              category,
              image: { url, width, height, publicId },
            }) => (
              <tr key={id} className="border-b hover:bg-gray-50">
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-3 font-medium"
                >
                  {id}
                </th>
                <td className="relative h-32 w-32 bg-white">
                  <Image
                    src={url}
                    alt={id}
                    className="absolute inset-0 h-full w-full object-contain p-1"
                    width={width}
                    height={height}
                  />
                </td>
                <td className="px-4 py-3">{name}</td>
                <td className="px-4 py-3">{storage}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-300 px-2 py-0.5 text-xs font-medium text-gray-800 empty:hidden">
                    {category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={{
                      pathname: `/gallery/admin/update/${id}`,
                      query: {
                        data: JSON.stringify({
                          name: name,
                          storage: storage,
                          category: category,
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
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}

const Pagination = ({
  currentPage,
  totalCount,
  totalPage,
}: PaginationProps): JSX.Element => {
  const { query } = useRouter()
  const hasPrevious = currentPage !== 1
  const hasNext = currentPage < totalPage

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
          <Link
            href={{ query: { ...query, page: currentPage - 1 } }}
            shallow
            className={clsx(
              'flex h-full items-center justify-center rounded-l-lg border border-gray-300 bg-white py-1.5 px-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              !hasPrevious && 'pointer-events-none'
            )}
          >
            <span className="sr-only">Previous</span>
            <HiChevronLeft />
          </Link>
        </li>
        {pages.map((page, idx) => (
          <li key={idx}>
            <Link
              href={{ query: { ...query, page: page } }}
              shallow
              className={clsx(
                'flex items-center justify-center border border-gray-300 px-3 py-2 text-sm leading-tight text-gray-600 hover:bg-gray-100 hover:text-gray-700',
                currentPage === page || isNaN(page)
                  ? 'pointer-events-none bg-gray-50 text-gray-600'
                  : 'text-gray-500'
              )}
            >
              {!isNaN(page) ? page : '...'}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={{ query: { ...query, page: currentPage + 1 } }}
            shallow
            className={clsx(
              'flex h-full items-center justify-center rounded-r-lg border border-gray-300 bg-white py-1.5 px-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              !hasNext && 'pointer-events-none'
            )}
          >
            <span className="sr-only">Next</span>
            <HiChevronRight />
          </Link>
        </li>
      </ul>
    </nav>
  )
}

const Admin: NextPageWithLayout = (): JSX.Element => {
  // TODO: use ImageViewerModal to view the image

  const { data, status, error, isPreviousData } = useOffsetGallery()

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

  // TODO: currentPage is a typeof string instead of a number
  // (currentPage + number) will break, but (currentPage - number) will not.
  const currentPage = data?.page ?? 1
  const totalCount = data?.totalCount ?? 0
  const totalPage = Math.ceil(totalCount / GALLERY_LIMIT)

  return (
    <div
      className={clsx(
        'relative w-full space-y-4 overflow-hidden',
        isPreviousData && 'pointer-events-none opacity-50'
      )}
    >
      <Table items={items} />
      <Pagination
        currentPage={+currentPage}
        totalCount={totalCount}
        totalPage={totalPage}
      />
    </div>
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

  if (
    !isValidRequest<RequireKeys<GalleryFilters, 'page'>>(query, [
      'page',
      'search',
      'categories',
      'orderBy',
    ])
  ) {
    return { redirect: { destination: '/gallery/admin', permanent: false } }
  }
  const queryKey = removeEmptyObjectFromArray(['gallery', 'offset', query])

  try {
    await queryClient.fetchQuery<GalleryOffsetResponse>(queryKey, () =>
      fetchItems({ ...query, page: query.page ?? 1 })
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
