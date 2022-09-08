import { useMutation } from '@tanstack/react-query'

import type { GalleryFormFields } from 'types/gallery'
import { queryClient } from 'lib/query'

const useUpdate = () => {
  return useMutation(
    async (data: any) => {
      // for (var pair of data.entries()) {
      //   console.log(pair[0] + ', ' + pair[1])
      // }

      const res = await fetch(`/api/gallery/update/${data.get('itemId')}`, {
        method: 'PUT',
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        // body: JSON.stringify(data),
        body: data,
      })
      const resData = await res.json()
      if (!res.ok && resData.error) {
        throw new Error(resData.error.message)
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
      onError: (error, item, context) => {},
      onSuccess: (data, item, context) => {},
      onSettled: (data, error, item, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}

export default useUpdate
