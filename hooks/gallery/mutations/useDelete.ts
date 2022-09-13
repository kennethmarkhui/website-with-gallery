import { useMutation } from '@tanstack/react-query'

import type { GalleryFormFields } from 'types/gallery'
import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useDelete = () => {
  return useMutation(
    (variables: { id: string; publicId?: string }) =>
      fetcher(
        `/api/gallery/delete?id=${variables.id}${
          variables.publicId ? `&publicId=${variables.publicId}` : ''
        }`,
        { method: 'DELETE' }
      ),
    {
      onMutate: async ({ id }) => {
        await queryClient.cancelQueries(['gallery'])
        const snapshot = queryClient.getQueryData<GalleryFormFields[]>([
          'gallery',
        ])
        queryClient.setQueryData<GalleryFormFields[]>(
          ['gallery'],
          (prevItems) => prevItems?.filter((current) => current.id !== id)
        )
        return { snapshot }
      },
      onError: (error, id, context) => {
        queryClient.setQueryData(['gallery'], context?.snapshot)
      },
      onSuccess: (data, id, context) => {},
      onSettled: (data, error, item, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}

export default useDelete
