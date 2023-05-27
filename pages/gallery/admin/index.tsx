import { ReactElement, useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'

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
import DataTable, {
  DataTableExtendedPaginationProps,
} from '@/components/DataTable'

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

  const pagination = {
    state: {
      pageIndex: data?.page ? data.page - 1 : 0,
      pageSize: GALLERY_LIMIT,
    },
    dataCount: data?.totalCount ?? 0,
    onPaginationChange: ({ pageIndex }) => {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, page: pageIndex + 1 },
        },
        undefined,
        { shallow: true }
      )
    },
  } satisfies DataTableExtendedPaginationProps

  return (
    <DataTable
      columns={columns}
      data={items}
      manualPagination={pagination}
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
