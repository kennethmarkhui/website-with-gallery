import { useMutation } from '@tanstack/react-query'

import { createItem } from '@/actions/gallery-admin'
import { queryClient } from '@/lib/query'
import type { GalleryFormFields } from '@/types/gallery'

const useCreate = () => {
  return useMutation({
    mutationFn: (data: GalleryFormFields) => {
      const formData = new FormData()
      const { image, ...rest } = data
      if (image && image.length) {
        for (let index = 0; index < image.length; index++) {
          formData.append('images', image[index])
        }
      }
      formData.append('data', JSON.stringify(rest))

      return createItem(formData)
    },
    onMutate: async (item) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, item, context) => {},
    onSuccess: (data, item, context) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
    onSettled: (data, error, item, context) => {},
  })
}

export default useCreate
