import { useMutation } from '@tanstack/react-query'

import { createCategory } from '@/actions/gallery-category-admin'
import { queryClient } from '@/lib/query'
import type {
  GalleryCategoryFormFields,
  GalleryCategoryResponse,
} from '@/types/gallery'

const useCreateCategory = () => {
  return useMutation({
    mutationFn: (data: GalleryCategoryFormFields) => createCategory(data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] })
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
    onError: (error, variables, context) => {
      queryClient.setQueryData(['categories'], context?.snapshot)
    },
    onSuccess: (data, variables, context) => {},
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export default useCreateCategory
