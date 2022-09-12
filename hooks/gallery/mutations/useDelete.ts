import { useMutation } from '@tanstack/react-query'

import type { GalleryFormFields } from 'types/gallery'
import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useDelete = () => {
  return useMutation(
    (variables: { itemId: string; publicId?: string }) =>
      fetcher(
        `/api/gallery/delete?itemId=${variables.itemId}${
          variables.publicId ? `&publicId=${variables.publicId}` : ''
        }`,
        { method: 'DELETE' }
      ),
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
