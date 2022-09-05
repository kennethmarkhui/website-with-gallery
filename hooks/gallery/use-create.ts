import { useMutation } from '@tanstack/react-query'

import type { ErrorResponse, FormValues } from 'types/gallery'
import { queryClient } from 'lib/query'

const useCreate = () => {
  return useMutation(
    async (data: FormValues) => {
      const res = await fetch('/api/gallery/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const resData = await res.json()
      if (!res.ok && resData.hasOwnProperty('error')) {
        throw resData
      }
      return resData
    },
    {
      onMutate: async (item) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['gallery'])
        // Snapshot the previous value
        const snapshot = queryClient.getQueryData<FormValues[]>(['gallery'])
        // Optimistically update to the new value
        queryClient.setQueryData<FormValues[]>(['gallery'], (prevItems) => [
          ...(prevItems as []),
          item,
        ])
        // Return a context object with the snapshotted value
        return { snapshot }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (error: ErrorResponse, item, context) => {
        // console.log('useCreate onError')
        // console.log('error: ', error)
        // console.log('items: ', items)
        // console.log('context:', context)
        queryClient.setQueryData(['gallery'], context?.snapshot)
      },
      onSuccess: (data, item, context) => {},
      onSettled: (data, error, item, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}

export default useCreate
