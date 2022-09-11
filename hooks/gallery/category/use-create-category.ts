import { useMutation } from '@tanstack/react-query'
import { Category } from 'prisma/prisma-client'

import type { GalleryErrorResponse } from 'types/gallery'
import { queryClient } from 'lib/query'

const useCreateCategory = () => {
  return useMutation(
    async (data: { category: string }) => {
      const res = await fetch('/api/gallery/category/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const resData = await res.json()
      if (!res.ok && resData.hasOwnProperty('error')) {
        throw resData
      }
      return resData
    },
    {
      onMutate: async (variables) => {
        await queryClient.cancelQueries(['categories'])
        const snapshot = queryClient.getQueryData<
          Pick<Category, 'id' | 'name'>[]
        >(['categories'])
        queryClient.setQueryData<Pick<Category, 'id' | 'name'>[]>(
          ['categories'],
          (prev) => [
            ...(prev as []),
            { id: Math.random().toString(), name: variables.category },
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
    }
  )
}

export default useCreateCategory
