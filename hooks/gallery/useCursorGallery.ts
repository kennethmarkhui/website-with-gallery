import { useRouter } from 'next/router'
import { useInfiniteQuery } from '@tanstack/react-query'

import type { GalleryOffsetQuery, GalleryResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import { generateQueryStringFromObject } from 'lib/utils'

interface UseCursorGalleryProps {
  filters: Omit<GalleryOffsetQuery, 'page'>
}

const useCursorGallery = ({ filters }: UseCursorGalleryProps) => {
  const { locale } = useRouter()
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
      fetcher<GalleryResponse>(
        '/api/gallery' +
          generateQueryStringFromObject({
            nextCursor: pageParam ?? 0,
            ...queryKey[2],
          })
      ),
    getNextPageParam: ({ nextCursor }) => nextCursor,
    keepPreviousData: true,
  })

  const localizedData = {
    ...data,
    pages: data?.pages.map((pageData) => ({
      ...pageData,
      items: pageData.items.map(({ id, category, image, translations }) => {
        const localizedItem = translations.find(
          ({ language }) => language.code === locale
        )
        return {
          id,
          category,
          image,
          name: localizedItem?.name ?? null,
          storage: localizedItem?.storage ?? null,
        }
      }),
    })),
  }

  return {
    data,
    localizedData,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPreviousData,
  }
}

export default useCursorGallery
