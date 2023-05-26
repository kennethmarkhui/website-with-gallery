import { useQuery } from '@tanstack/react-query'
import { ParsedUrlQuery } from 'querystring'

import type { GalleryFilters, GalleryOffsetResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import {
  generateQueryStringFromObject,
  removeEmptyObjectFromArray,
} from 'lib/utils'

interface UseOffsetGalleryProps {
  filters: ParsedUrlQuery
}

const useOffsetGallery = ({ filters }: UseOffsetGalleryProps) => {
  const queryKey = removeEmptyObjectFromArray(['gallery', 'offset', filters])
  const galleryFilters = queryKey[2] as GalleryFilters

  const { data, status, error, isPreviousData } = useQuery({
    queryKey,
    queryFn: () =>
      fetcher<GalleryOffsetResponse>(
        '/api/gallery' +
          generateQueryStringFromObject({
            ...galleryFilters,
            page: galleryFilters?.page ?? 1,
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
