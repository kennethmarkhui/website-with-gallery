import { useMutation } from '@tanstack/react-query'
import { Category } from 'prisma/prisma-client'

import type { GalleryErrorResponse } from 'types/gallery'
import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useCreateCategory = () => {
  return useMutation({
    mutationFn: (data: { category: string }) =>
      fetcher('/api/gallery/category/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries(['categories'])
      const snapshot = queryClient.getQueryData<
        Pick<Category, 'id' | 'name'>[]
      >(['categories'])
      queryClient.setQueryData<Pick<Category, 'id' | 'name'>[]>(
        ['categories'],
        (prev) => [
          { id: Math.random().toString(), name: variables.category },
          ...(prev as []),
        ]
      )
      return { snapshot }
    },
    onError: (error: GalleryErrorResponse, variables, context) => {
      queryClient.setQueryData(['categories'], context?.snapshot)
    },
    onSuccess: (data, variables, context) => {},
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries(['categories'])
    },
  })
}

export default useCreateCategory
