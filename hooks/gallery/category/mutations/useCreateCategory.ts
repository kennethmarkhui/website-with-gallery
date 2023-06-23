import { useMutation } from '@tanstack/react-query'

import type {
  GalleryCategoryFormFields,
  GalleryCategoryResponse,
  GalleryErrorResponse,
} from 'types/gallery'
import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useCreateCategory = () => {
  return useMutation({
    mutationFn: (data: GalleryCategoryFormFields) => {
      return fetcher('/api/gallery/category/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries(['categories'])
      const snapshot = queryClient.getQueryData<GalleryCategoryResponse>([
        'categories',
      ])
      queryClient.setQueryData<GalleryCategoryResponse>(
        ['categories'],
        (prev) => {
          return [
            {
              id: Math.random().toString(),
              translations: variables.name.map(({ code, value }) => ({
                language: { code },
                name: value,
              })),
            },
            // TODO: not sure if this will spread nested
            ...(prev ? prev : []),
          ]
        }
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
  })
}

export default useCreateCategory
