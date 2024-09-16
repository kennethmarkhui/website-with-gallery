import { useMutation } from '@tanstack/react-query'

import { deleteCategory } from '@/actions/gallery-category-admin'
import { queryClient } from '@/lib/query'
import type { GalleryCategoryResponse } from '@/types/gallery'

const useDeleteCategory = () => {
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] })
      const snapshot = queryClient.getQueryData<GalleryCategoryResponse>([
        'categories',
      ])
      queryClient.setQueryData<GalleryCategoryResponse>(
        ['categories'],
        (prev) => prev?.filter((current) => current.id !== variables)
      )
      return { snapshot }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['categories'], context?.snapshot)
    },
    onSuccess: (data, variables, context) => {},
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
  })
}

export default useDeleteCategory
