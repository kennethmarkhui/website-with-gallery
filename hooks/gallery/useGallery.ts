import { useQuery } from '@tanstack/react-query'

import type { OmittedItem } from 'types/gallery'
import useCreate from './mutations/useCreate'
import useDelete from './mutations/useDelete'
import useUpdate from './mutations/useUpdate'
import fetcher from 'lib/fetcher'

const useGallery = () => {
  const { data, status, error } = useQuery(['gallery'], () =>
    fetcher<OmittedItem[]>('/api/gallery')
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
