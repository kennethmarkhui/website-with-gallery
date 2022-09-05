import { useMutation } from '@tanstack/react-query'

import { type FormValues } from 'types/gallery'
import { queryClient } from 'lib/query'

const useDelete = () => {
  return useMutation(
    async (itemId: string) => {
      const res = await fetch(`/api/gallery/delete?itemId=${itemId}`, {
        method: 'DELETE',
      })
      const resData = await res.json()
      if (!res.ok && resData.hasOwnProperty('error')) {
        throw new Error(resData.message)
      }
      return resData
    },
    {
      onMutate: async (itemId) => {
        await queryClient.cancelQueries(['gallery'])
        const snapshot = queryClient.getQueryData<FormValues[]>(['gallery'])
        queryClient.setQueryData<FormValues[]>(['gallery'], (prevItems) =>
          prevItems?.filter((current) => current.itemId !== itemId)
        )
        return { snapshot }
      },
      onError: (error, itemId, context) => {
        queryClient.setQueryData(['gallery'], context?.snapshot)
      },
      onSuccess: (data, itemId, context) => {},
      onSettled: (data, error, item, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}

export default useDelete
