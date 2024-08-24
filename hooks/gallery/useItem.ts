import { useQuery } from '@tanstack/react-query'

import type { GalleryAdminItem } from 'types/gallery'
import fetcher from 'lib/fetcher'

const useItem = (id: string) => {
  const { data, status, error } = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetcher<GalleryAdminItem>('/api/gallery/admin/' + id),
  })

  return {
    data,
    status,
    error,
  }
}

export default useItem
