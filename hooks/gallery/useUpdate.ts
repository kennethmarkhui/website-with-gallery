import { useMutation } from '@tanstack/react-query'

import type { FormValues } from 'types/gallery'
import { queryClient } from 'lib/query'

const useUpdate = () => {
  return useMutation(
    async (data: FormValues) => {
      const res = await fetch(`/api/gallery/update/${data.itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const resData = await res.json()
      if (!res.ok && resData.error) {
        throw new Error(resData.error.message)
      }
      return resData
    },
    {
      onMutate: async (item) => {
        await queryClient.cancelQueries(['gallery'])
        const snapshot = queryClient.getQueryData<FormValues[]>(['gallery'])
        queryClient.setQueryData<FormValues[]>(['gallery'], (prevItems) =>
          prevItems?.map((current) =>
            current.itemId === item.itemId ? item : current
          )
        )
        return { snapshot }
      },
      onError: (error, item, context) => {},
      onSuccess: (data, item, context) => {},
      onSettled: (data, error, item, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}

export default useUpdate
