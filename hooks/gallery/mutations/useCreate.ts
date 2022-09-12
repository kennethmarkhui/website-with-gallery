import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse, GalleryFormFields } from 'types/gallery'
import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useCreate = () => {
  return useMutation(
    (data: any) =>
      fetcher('/api/gallery/create', { method: 'POST', body: data }),
    //  loop over FormData
    // for (var pair of data.entries()) {
    //   console.log(pair[0] + ', ' + pair[1])
    // }
    {
      onMutate: async (item) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['gallery'])
        // Snapshot the previous value
        const snapshot = queryClient.getQueryData<GalleryFormFields[]>([
          'gallery',
        ])
        // Optimistically update to the new value
        queryClient.setQueryData<GalleryFormFields[]>(
          ['gallery'],
          (prevItems) => [...(prevItems as []), item]
        )
        // Return a context object with the snapshotted value
        return { snapshot }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (error: GalleryErrorResponse, item, context) => {
        // console.log('useCreate onError')
        // console.log('error: ', error)
        // console.log('items: ', items)
        // console.log('context:', context)
        queryClient.setQueryData(['gallery'], context?.snapshot)
      },
      onSuccess: (data, item, context) => {},
      onSettled: (data, error, item, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}

export default useCreate
