import { notFound } from 'next/navigation'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

import GalleryAdminUpdateForm from './update-form'
import { getCategories } from '@/actions/category'
import { getAdminItem } from '@/actions/gallery-admin'

interface GalleryAdminUpdatePageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function GalleryAdminUpdatePage({
  params: { id },
  searchParams,
}: GalleryAdminUpdatePageProps) {
  const queryClient = new QueryClient()

  if (!id) notFound()

  // TODO: parse searchParams.data with zod?
  const queryData =
    typeof searchParams.data === 'string' && JSON.parse(searchParams.data)

  if (queryData) {
    queryClient.setQueryData(['item', id], {
      id,
      ...queryData,
    })
  }

  if (!queryData) {
    // fetch item if no query data provided
    await queryClient.fetchQuery({
      queryKey: ['item', id],
      queryFn: () => getAdminItem(id),
    })
    await queryClient.fetchQuery({
      queryKey: ['categories'],
      queryFn: () => getCategories(),
    })
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GalleryAdminUpdateForm id={id} />
    </HydrationBoundary>
  )
}
