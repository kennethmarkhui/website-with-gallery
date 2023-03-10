import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import type { GalleryFilters, GalleryCursorResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import {
  generateQueryStringFromObject,
  removeEmptyObjectFromArray,
} from 'lib/utils'

const useCursorGallery = () => {
  const router = useRouter()
  const filters = router.query
  const queryKey = removeEmptyObjectFromArray(['gallery', 'cursor', filters])

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
      fetcher<GalleryCursorResponse>(
        '/api/gallery' +
          generateQueryStringFromObject({
            nextCursor: pageParam ?? 0,
            ...(queryKey[2] as GalleryFilters),
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

export default useCursorGallery
