import { useInfiniteQuery } from '@tanstack/react-query'

import type { GalleryOffsetQuery, GalleryCursorResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import { generateQueryStringFromObject } from 'lib/utils'

interface UseCursorGalleryProps {
  filters: Omit<GalleryOffsetQuery, 'page'>
}

const useCursorGallery = ({ filters }: UseCursorGalleryProps) => {
  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPreviousData,
  } = useInfiniteQuery({
    queryKey: ['gallery', 'cursor', filters] as const,
    queryFn: ({ pageParam, queryKey }) =>
      fetcher<GalleryCursorResponse>(
        '/api/gallery' +
          generateQueryStringFromObject({
            nextCursor: pageParam ?? 0,
            ...queryKey[2],
          })
      ),
    getNextPageParam: ({ nextCursor }) => nextCursor,
    keepPreviousData: true,
  })

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
