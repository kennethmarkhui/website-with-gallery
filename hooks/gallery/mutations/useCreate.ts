import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse, GalleryFormFields } from 'types/gallery'
import fetcher from 'lib/fetcher'
import { queryClient } from 'lib/query'

const useCreate = () => {
  return useMutation({
    mutationFn: (data: GalleryFormFields) => {
      const formData = new FormData()
      for (const [key, value] of Object.entries(data)) {
        if (value instanceof FileList) {
          formData.append(key, value[0])
          break
        }
        formData.append(key, value)
      }

      return fetcher('/api/gallery/create', {
        method: 'POST',
        body: formData,
      })
    },
    onMutate: async (item) => {
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
  })
}

export default useCreate
