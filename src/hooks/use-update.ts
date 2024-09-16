import { useMutation } from '@tanstack/react-query'

import { updateItem } from '@/actions/gallery-admin'
import { queryClient } from '@/lib/query'
import type { GalleryFormFields } from '@/types/gallery'

const useUpdate = () => {
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

      return updateItem(formData)
    },
    onMutate: async (item) => {},
    onError: (error, item, context) => {},
    onSuccess: (data, item, context) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
    onSettled: (data, error, item, context) => {},
  })
}

export default useUpdate
