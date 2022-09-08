import { useMutation } from '@tanstack/react-query'

import type { GalleryFormFields } from 'types/gallery'
import { queryClient } from 'lib/query'

const useDelete = () => {
  return useMutation(
    async (variables: { itemId: string; publicId?: string }) => {
      const res = await fetch(
        `/api/gallery/delete?itemId=${variables.itemId}${
          variables.publicId ? `&publicId=${variables.publicId}` : ''
        }`,
        {
          method: 'DELETE',
        }
      )
      const resData = await res.json()
      if (!res.ok && resData.hasOwnProperty('error')) {
        throw new Error(resData.message)
      }
      return resData
    },
    {
      onMutate: async ({ itemId }) => {
        await queryClient.cancelQueries(['gallery'])
        const snapshot = queryClient.getQueryData<GalleryFormFields[]>([
          'gallery',
        ])
        queryClient.setQueryData<GalleryFormFields[]>(
          ['gallery'],
          (prevItems) =>
            prevItems?.filter((current) => current.itemId !== itemId)
        )
        return { snapshot }
      },
      onError: (error, itemId, context) => {
        queryClient.setQueryData(['gallery'], context?.snapshot)
      },
      onSuccess: (data, itemId, context) => {},
      onSettled: (data, error, item, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}

export default useDelete
