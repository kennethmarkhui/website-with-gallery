import { useMutation } from '@tanstack/react-query'
import { Category } from 'prisma/prisma-client'

import type { GalleryErrorResponse } from 'types/gallery'
import { queryClient } from 'lib/query'

const useUpdateCategory = () => {
  return useMutation(
    async (data: { id: string; name: string; oldName?: string }) => {
      const res = await fetch(`/api/gallery/category/update?id=${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, oldName: data.oldName }),
      })
      const resData = await res.json()
      if (!res.ok && resData.error) {
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
          (prev) =>
            prev?.map((current) =>
              current.id === variables.id
                ? { id: variables.id, name: variables.name }
                : current
            )
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

export default useUpdateCategory
