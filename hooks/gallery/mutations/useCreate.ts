import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import { queryClient } from 'lib/query'

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
        // item is in FormData
        // const dataObject = Object.fromEntries(item)
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        // await queryClient.cancelQueries(['gallery'])
        // Snapshot the previous value
        // const snapshot = queryClient.getQueryData<
        //   InfiniteData<{
        //     items: OmittedItem[]
        //     nextCursor: NextCursor
        //   }>
        // >(['gallery'])
        // Optimistically update to the new value
        // queryClient.setQueryData<
        //   InfiniteData<{
        //     items: OmittedItem[]
        //     nextCursor: NextCursor
        //   }>
        // >(['gallery'], (prevItems) => [item, ...(prevItems as [])]
        // )
        // Return a context object with the snapshotted value
        // return { snapshot }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (error: GalleryErrorResponse, item, context) => {
        // console.log('useCreate onError')
        // console.log('error: ', error)
        // console.log('items: ', items)
        // console.log('context:', context)
        // queryClient.setQueryData(['gallery'], context?.snapshot)
      },
      onSuccess: (data, item, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
      onSettled: (data, error, item, context) => {},
    }
  )
}

export default useCreate
