import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse, GalleryFormFields } from 'types/gallery'
import { queryClient } from 'lib/query'

const useUpdate = () => {
  return useMutation(
    async (data: any) => {
      // for (var pair of data.entries()) {
      //   console.log(pair[0] + ', ' + pair[1])
      // }

      const res = await fetch(`/api/gallery/update/${data.get('itemId')}`, {
        method: 'PUT',
        body: data,
      })
      const resData = await res.json()
      if (!res.ok && resData.error) {
        throw resData
      }
      return resData
    },
    {
      onMutate: async (item) => {
        await queryClient.cancelQueries(['gallery'])
        const snapshot = queryClient.getQueryData<GalleryFormFields[]>([
          'gallery',
        ])
        queryClient.setQueryData<GalleryFormFields[]>(
          ['gallery'],
          (prevItems) =>
            prevItems?.map((current) =>
              current.itemId === item.itemId ? item : current
            )
        )
        return { snapshot }
      },
      onError: (error: GalleryErrorResponse, item, context) => {
        queryClient.setQueryData(['gallery'], context?.snapshot)
      },
      onSuccess: (data, item, context) => {},
      onSettled: (data, error, item, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}

export default useUpdate
