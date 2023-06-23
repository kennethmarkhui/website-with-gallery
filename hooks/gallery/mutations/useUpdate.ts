import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse, GalleryFormFields } from 'types/gallery'
import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useUpdate = () => {
  return useMutation({
    mutationFn: (data: GalleryFormFields) => {
      const formData = new FormData()
      const { image, ...rest } = data
      if (image) {
        formData.append('image', image[0])
      }
      formData.append('data', JSON.stringify(rest))

      return fetcher(`/api/gallery/update/${data.id}`, {
        method: 'PUT',
        body: formData,
      })
    },
    onMutate: async (item) => {},
    onError: (error: GalleryErrorResponse, item, context) => {},
    onSuccess: (data, item, context) => {
      queryClient.invalidateQueries(['gallery'])
    },
    onSettled: (data, error, item, context) => {},
  })
}

export default useUpdate
