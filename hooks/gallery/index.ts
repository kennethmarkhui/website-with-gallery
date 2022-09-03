import { useQuery, UseQueryResult, useMutation } from '@tanstack/react-query'

import type { FormValues, OmittedItem } from 'types/gallery'
import { queryClient } from 'lib/query'

export const getItems = async (): Promise<OmittedItem[]> => {
  const res = await fetch('/api/gallery')
  const data = await res.json()
  if (!res.ok && data.hasOwnProperty('error')) {
    throw new Error(data.message)
  }
  return data
}

export const useGallery = (): UseQueryResult<OmittedItem[]> => {
  return useQuery(['gallery'], getItems)
}

export const useCreate = (cb: () => void) => {
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
        throw new Error(resData.message)
      }
      return resData
    },
    {
      onMutate: async (items) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['gallery'])
        // Snapshot the previous value
        const snapshot = queryClient.getQueryData(['gallery'])
        // Optimistically update to the new value
        queryClient.setQueryData<FormValues[]>(['gallery'], (prevItems) => [
          ...(prevItems as []),
          items,
        ])
        // Return a context object with the snapshotted value
        return { snapshot }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (error, items, context) => {
        queryClient.setQueryData(['gallery'], context?.snapshot)
      },
      onSuccess: (data, items, context) => {
        cb()
      },
      onSettled: (data, error, items, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}

export const useUpdate = (cb: () => void) => {
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
      if (!res.ok && resData.hasOwnProperty('error')) {
        throw new Error(resData.message)
      }
      return resData
    },
    {
      onMutate: async (item) => {
        await queryClient.cancelQueries(['gallery'])
        const snapshot = queryClient.getQueryData(['gallery'])
        queryClient.setQueryData<FormValues[]>(['gallery'], (prevItems) =>
          prevItems?.map((current) =>
            current.itemId === item.itemId ? item : current
          )
        )
        cb()
        return { snapshot }
      },
      onError: (error, items, context) => {},
      onSuccess: (data, items, context) => {},
      onSettled: (data, error, items, context) => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}

export const useDelete = () => {
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
        const snapshot = queryClient.getQueryData(['gallery'])
        queryClient.setQueryData<FormValues[]>(['gallery'], (prevItems) =>
          prevItems?.filter((current) => current.itemId !== itemId)
        )
        return { snapshot }
      },
      onError: (error, itemId, context) => {
        queryClient.setQueryData(['gallery'], context?.snapshot)
      },
      onSuccess: (data, items, context) => {},
      onSettled: () => {
        queryClient.invalidateQueries(['gallery'])
      },
    }
  )
}
