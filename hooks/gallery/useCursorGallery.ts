import { useInfiniteQuery } from '@tanstack/react-query'

import type { GalleryFilters, GalleryCursorResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import {
  generateQueryStringFromObject,
  removeEmptyObjectFromArray,
} from 'lib/utils'

interface UseCursorGalleryProps {
  filters: GalleryFilters
}

const useCursorGallery = ({ filters }: UseCursorGalleryProps) => {
  const queryKey = removeEmptyObjectFromArray(['gallery', 'cursor', filters])

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPreviousData,
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
      keepPreviousData: true,
    }
  )

  return {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPreviousData,
  }
}

export default useCursorGallery
