import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

import GalleryAdminCreateForm from './create-form'
import { getCategories } from '@/actions/category'

export default async function GalleryAdminCreatePage() {
  const queryClient = new QueryClient()

  await queryClient.fetchQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GalleryAdminCreateForm />
    </HydrationBoundary>
  )
}
