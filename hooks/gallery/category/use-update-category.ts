import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse } from 'types/gallery'

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
    },
    {
      onMutate: (variables) => {},
      onError: (error: GalleryErrorResponse, variables, context) => {},
      onSuccess: (data, variables, context) => {},
      onSettled: (data, error, variables, context) => {},
    }
  )
}

export default useUpdateCategory
