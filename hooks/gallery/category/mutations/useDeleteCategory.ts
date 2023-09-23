import { useMutation } from '@tanstack/react-query'

import type {
  GalleryCategoryResponse,
  GalleryErrorResponse,
} from 'types/gallery'
import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useDeleteCategory = () => {
  return useMutation({
    mutationFn: (id: string) =>
      fetcher(`/api/gallery/admin/category/delete?id=${id}`, {
        method: 'DELETE',
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries(['categories'])
      const snapshot = queryClient.getQueryData<GalleryCategoryResponse>([
        'categories',
      ])
      queryClient.setQueryData<GalleryCategoryResponse>(
        ['categories'],
        (prev) => prev?.filter((current) => current.id !== variables)
      )
      return { snapshot }
    },
    onError: (error: GalleryErrorResponse, variables, context) => {
      queryClient.setQueryData(['categories'], context?.snapshot)
    },
    onSuccess: (data, variables, context) => {},
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries(['categories'])
      queryClient.invalidateQueries(['gallery'])
    },
  })
}

export default useDeleteCategory
