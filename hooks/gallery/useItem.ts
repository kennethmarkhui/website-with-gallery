import { useQuery } from '@tanstack/react-query'

import type { GalleryItem } from 'types/gallery'
import fetcher from 'lib/fetcher'

const useItem = (id: string) => {
  const { data, status, error } = useQuery(['item', id], () =>
    fetcher<GalleryItem>('/api/gallery/' + id)
  )

  return {
    data,
    status,
    error,
  }
}

export default useItem
