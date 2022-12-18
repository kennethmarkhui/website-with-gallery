import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import type { GalleryFilters, GalleryResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import { generateQueryStringFromObject } from 'lib/utils'

const useGallery = () => {
  const router = useRouter()
  const filters = router.query

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['gallery', filters],
    ({ pageParam = 0, queryKey }) =>
      fetcher<GalleryResponse>(
        '/api/gallery' +
          generateQueryStringFromObject({
            nextCursor: pageParam,
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
