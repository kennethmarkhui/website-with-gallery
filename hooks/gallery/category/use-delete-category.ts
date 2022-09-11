import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse } from 'types/gallery'
import { queryClient } from 'lib/query'

const useDeleteCategory = () => {
  return useMutation(
    async (category: string) => {
      const res = await fetch(`/api/gallery/category/delete?name=${category}`, {
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
        const snapshot = queryClient.getQueryData<string[]>(['categories'])
        queryClient.setQueryData<string[]>(['categories'], (prev) =>
          prev?.filter((current) => current !== variables)
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

export default useDeleteCategory
