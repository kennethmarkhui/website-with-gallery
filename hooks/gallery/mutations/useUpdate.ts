import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse, GalleryFormFields } from 'types/gallery'
import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useUpdate = () => {
  return useMutation(
    async (data: GalleryFormFields<FileList>) => {
      const formData = new FormData()
      formData.append('id', data.id)
      formData.append('name', data.name ? data.name : '')
      formData.append('storage', data.storage ? data.storage : '')
      formData.append('category', data.category ? data.category : '')
      if (data.image && data.image.length !== 0) {
        formData.append('image', data.image[0])
      }

      return await fetcher(`/api/gallery/update/${data.id}`, {
        method: 'PUT',
        body: formData,
      })
    },
    {
      onMutate: async (item) => {
        // await queryClient.cancelQueries(['gallery'])
        // const snapshot = queryClient.getQueryData<GalleryFormFields[]>([
        //   'gallery',
        // ])
        // queryClient.setQueryData<GalleryFormFields[]>(
        //   ['gallery'],
        //   (prevItems) =>
        //     prevItems?.map((current) =>
        //       current.id === item.id ? item : current
        //     )
        // )
        // return { snapshot }
      },
      onError: (error: GalleryErrorResponse, item, context) => {
        // queryClient.setQueryData(['gallery'], context?.snapshot)
      },
      onSuccess: (data, item, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
      onSettled: (data, error, item, context) => {},
    }
  )
}

export default useUpdate
