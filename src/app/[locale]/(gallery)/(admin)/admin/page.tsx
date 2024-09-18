import { notFound } from 'next/navigation'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

import GalleryAdmin from './gallery-admin'
import { getCategories } from '@/actions/category'
import { getAdminItems } from '@/actions/gallery-admin'
import { GalleryOffsetQuerySchema } from '@/lib/validations'

interface GalleryAdminPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function GalleryAdminPage({
  searchParams,
}: GalleryAdminPageProps) {
  const queryClient = new QueryClient()

  const parsedQuery = GalleryOffsetQuerySchema.safeParse(searchParams)

  if (!parsedQuery.success) notFound()

  await queryClient.fetchQuery({
    queryKey: ['gallery', 'offset', parsedQuery.data] as const,
    queryFn: ({ queryKey }) =>
      getAdminItems({ ...queryKey[2], page: queryKey[2].page ?? '1' }),
  })
  await queryClient.fetchQuery({
    queryKey: ['categories'] as const,
    queryFn: () => getCategories(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GalleryAdmin />
    </HydrationBoundary>
  )
}
