import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query'

import type { GalleryOffsetQuery, GalleryResponse } from 'types/gallery'
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
    isPlaceholderData,
  } = useInfiniteQuery({
    queryKey: ['gallery', 'cursor', filters] as const,
    queryFn: ({ pageParam, queryKey }) =>
      fetcher<GalleryResponse>(
        '/api/gallery' +
          generateQueryStringFromObject({
            ...(pageParam !== '0' && { nextCursor: pageParam }),
            ...queryKey[2],
          })
      ),
    initialPageParam: '0',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  })

  return {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPlaceholderData,
  }
}

export default useCursorGallery
