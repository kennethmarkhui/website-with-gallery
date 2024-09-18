import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query'

import { getItems } from '@/actions/gallery'
import type { GalleryOffsetQuery } from '@/types/gallery'

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
      getItems({
        ...(pageParam !== '0' && { nextCursor: pageParam }),
        ...queryKey[2],
      }),
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
