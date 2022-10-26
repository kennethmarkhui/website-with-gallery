import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import type { GalleryFilters, GalleryResponse } from 'types/gallery'
import useCreate from './mutations/useCreate'
import useDelete from './mutations/useDelete'
import useUpdate from './mutations/useUpdate'
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

  const {
    mutate: createMutate,
    status: createStatus,
    error: createError,
  } = useCreate()

  const {
    mutate: updateMutate,
    status: updateStatus,
    error: updateError,
  } = useUpdate()

  const {
    mutate: deleteMutate,
    status: deleteStatus,
    error: deleteError,
  } = useDelete()

  return {
    query: {
      data,
      status,
      error,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    },
    mutation: {
      create: {
        mutate: createMutate,
        status: createStatus,
        error: createError,
      },
      update: {
        mutate: updateMutate,
        status: updateStatus,
        error: updateError,
      },
      delete: {
        mutate: deleteMutate,
        status: deleteStatus,
        error: deleteError,
      },
    },
  }
}

export default useGallery
