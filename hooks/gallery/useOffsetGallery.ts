import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import type { GalleryFilters, GalleryOffsetResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import {
  generateQueryStringFromObject,
  removeEmptyObjectFromArray,
} from 'lib/utils'

const useOffsetGallery = () => {
  const router = useRouter()
  const filters = router.query
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
