import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import type { GalleryFilters, GalleryResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import {
  generateQueryStringFromObject,
  removeEmptyObjectFromArray,
} from 'lib/utils'

const useGallery = () => {
  const router = useRouter()
  const filters = router.query
  const queryKey = removeEmptyObjectFromArray(['gallery', filters])

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    queryKey,
    ({ pageParam, queryKey }) =>
      fetcher<GalleryResponse>(
        '/api/gallery' +
          generateQueryStringFromObject({
            nextCursor: pageParam ?? 0,
            ...(queryKey[1] as GalleryFilters),
          })
      ),
    {
      getNextPageParam: ({ nextCursor }) => nextCursor,
    }
  )

  return {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }
}

export default useGallery
