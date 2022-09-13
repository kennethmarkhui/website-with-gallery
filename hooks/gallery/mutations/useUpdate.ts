import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse, GalleryFormFields } from 'types/gallery'
import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useUpdate = () => {
  return useMutation(
    (data: any) =>
      fetcher(`/api/gallery/update/${data.get('id')}`, {
        method: 'PUT',
        body: data,
      }),
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
              current.id === item.id ? item : current
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
