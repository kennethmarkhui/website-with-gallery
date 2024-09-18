import { useMutation } from '@tanstack/react-query'

import { updateCategory } from '@/actions/gallery-category-admin'
import { queryClient } from '@/lib/query'
import type {
  GalleryCategoryFormFields,
  GalleryCategoryResponse,
} from '@/types/gallery'

const useUpdateCategory = () => {
  return useMutation({
    mutationFn: ({
      id,
      name,
    }: {
      id: string
      name: GalleryCategoryFormFields['name']
    }) => updateCategory({ id, name }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] })
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
    onError: (error, variables, context) => {
      queryClient.setQueryData(['categories'], context?.snapshot)
    },
    onSuccess: (data, variables, context) => {},
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export default useUpdateCategory
