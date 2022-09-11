import { useMutation } from '@tanstack/react-query'
import { Category } from 'prisma/prisma-client'

import type { GalleryErrorResponse } from 'types/gallery'
import { queryClient } from 'lib/query'

const useDeleteCategory = () => {
  return useMutation(
    async (id: string) => {
      const res = await fetch(`/api/gallery/category/delete?id=${id}`, {
        method: 'DELETE',
      })
      const resData = await res.json()
      if (!res.ok && resData.hasOwnProperty('error')) {
        throw new Error(resData.message)
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
    }
  )
}

export default useDeleteCategory
