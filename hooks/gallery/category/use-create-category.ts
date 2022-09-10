import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse } from 'types/gallery'

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
      onMutate: (variables) => {},
      onError: (error: GalleryErrorResponse, variables, context) => {},
      onSuccess: (data, variables, context) => {},
      onSettled: (data, error, variables, context) => {},
    }
  )
}

export default useCreateCategory
