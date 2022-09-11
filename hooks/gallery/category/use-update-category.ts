import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse } from 'types/gallery'
import { queryClient } from 'lib/query'

const useUpdateCategory = () => {
  return useMutation(
    async (data: any) => {
      const res = await fetch(`/api/gallery/category/update?name=${data.old}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.new),
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
        const snapshot = queryClient.getQueryData<string[]>(['categories'])
        queryClient.setQueryData<string[]>(['categories'], (prev) =>
          prev?.map((current) =>
            current === variables.old ? variables.new.category : current
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
