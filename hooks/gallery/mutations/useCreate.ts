import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse, GalleryFormFields } from 'types/gallery'
import fetcher from 'lib/fetcher'
import { queryClient } from 'lib/query'

const useCreate = () => {
  return useMutation({
    mutationFn: (data: GalleryFormFields) => {
      const formData = new FormData()
      const { image, ...rest } = data
      if (image) {
        formData.append('image', image[0])
      }
      formData.append('data', JSON.stringify(rest))

      return fetcher('/api/gallery/create', {
        method: 'POST',
        body: formData,
      })
    },
    onMutate: async (item) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error: GalleryErrorResponse, item, context) => {},
    onSuccess: (data, item, context) => {
      queryClient.invalidateQueries(['gallery'])
    },
    onSettled: (data, error, item, context) => {},
  })
}

export default useCreate
