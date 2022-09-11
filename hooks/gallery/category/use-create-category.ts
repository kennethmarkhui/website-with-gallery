import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse } from 'types/gallery'
import { queryClient } from 'lib/query'

const useCreateCategory = () => {
  return useMutation(
    async (data: any) => {
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
        const snapshot = queryClient.getQueryData<string[]>(['categories'])
        queryClient.setQueryData<string[]>(['categories'], (prev) => [
          ...(prev as []),
          variables.category,
        ])
        // Return a context object with the snapshotted value
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
