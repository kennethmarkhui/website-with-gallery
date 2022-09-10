import { useMutation } from '@tanstack/react-query'

import type { GalleryErrorResponse } from 'types/gallery'

const useDeleteCategory = () => {
  return useMutation(
    async (category: string) => {
      const res = await fetch(`/api/gallery/category/delete?name=${category}`, {
        method: 'DELETE',
      })
      await res.json()
    },
    {
      onMutate: (variables) => {},
      onError: (error: GalleryErrorResponse, variables, context) => {},
      onSuccess: (data, variables, context) => {},
      onSettled: (data, error, variables, context) => {},
    }
  )
}

export default useDeleteCategory
