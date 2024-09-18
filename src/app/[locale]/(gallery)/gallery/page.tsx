import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from '@tanstack/react-query'
import { notFound } from 'next/navigation'

import Gallery from './gallery'
import { getItems } from '@/actions/gallery'
import { getCategories } from '@/actions/category'
import { GalleryOffsetQuerySchema } from '@/lib/validations'

interface GalleryPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const parsedQuery = GalleryOffsetQuerySchema.omit({ page: true }).safeParse(
    searchParams
  )

  if (!parsedQuery.success) notFound()

  const queryClient = new QueryClient()

  await queryClient.fetchInfiniteQuery({
    queryKey: ['gallery', 'cursor', parsedQuery.data] as const,
    queryFn: ({ queryKey }) => getItems(queryKey[2]),
    initialPageParam: '0',
  })
  await queryClient.fetchQuery({
    queryKey: ['categories'] as const,
    queryFn: () => getCategories(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Gallery />
    </HydrationBoundary>
  )
}
