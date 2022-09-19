import { useInfiniteQuery } from '@tanstack/react-query'

import type { OmittedItem } from 'types/gallery'
import useCreate from './mutations/useCreate'
import useDelete from './mutations/useDelete'
import useUpdate from './mutations/useUpdate'
import fetcher from 'lib/fetcher'
import { NextCursor } from 'pages/api/gallery'

const useGallery = () => {
  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['gallery'],
    ({ pageParam = 0 }) =>
      fetcher<{ items: OmittedItem[]; nextCursor: NextCursor }>(
        '/api/gallery?nextCursor=' + pageParam
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
