import { useMutation } from '@tanstack/react-query'

import type {
  GalleryCategoryFormFields,
  GalleryCategoryResponse,
  GalleryErrorResponse,
} from 'types/gallery'
import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useUpdateCategory = () => {
  return useMutation({
    mutationFn: ({
      id,
      name,
    }: {
      id: string
      name: GalleryCategoryFormFields['name']
    }) =>
      fetcher(`/api/gallery/category/update?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries(['categories'])
      const snapshot = queryClient.getQueryData<GalleryCategoryResponse>([
        'categories',
      ])
      queryClient.setQueryData<GalleryCategoryResponse>(
        ['categories'],
        (prev) => {
          if (!prev) {
            return
          }
          return prev.map(({ id, translations }) => {
            if (id === variables.id) {
              return {
                id,
                translations: variables.name.map(({ value, code }) => ({
                  language: { code },
                  name: value,
                })),
              }
            }
            return {
              id,
              translations,
            }
          })
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

export default useUpdateCategory
