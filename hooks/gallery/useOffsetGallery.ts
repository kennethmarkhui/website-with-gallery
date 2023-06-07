import { useQuery } from '@tanstack/react-query'

import type { GalleryOffsetQuery, GalleryOffsetResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import { generateQueryStringFromObject } from 'lib/utils'

interface UseOffsetGalleryProps {
  filters: GalleryOffsetQuery
}

const useOffsetGallery = ({ filters }: UseOffsetGalleryProps) => {
  const { data, status, error, isPreviousData } = useQuery({
    queryKey: ['gallery', 'offset', filters] as const,
    queryFn: ({ queryKey }) =>
      fetcher<GalleryOffsetResponse>(
        '/api/gallery' +
          generateQueryStringFromObject({
            ...queryKey[2],
            page: queryKey[2].page ?? '1',
          })
      ),
    keepPreviousData: true,
  })

  return {
    data,
    status,
    error,
    isPreviousData,
  }
}

export default useOffsetGallery
