import { useQuery } from '@tanstack/react-query'
import { Category } from 'prisma/prisma-client'

import useCreateCategory from './mutations/useCreateCategory'
import useDeleteCategory from './mutations/useDeleteCategory'
import useUpdateCategory from './mutations/useUpdateCategory'
import fetcher from 'lib/fetcher'

const useCategory = () => {
  const { data, status, error } = useQuery(['categories'], () =>
    fetcher<Pick<Category, 'id' | 'name'>[]>('/api/gallery/category')
  )

  const {
    mutate: createCategoryMutate,
    status: createCategoryStatus,
    error: createCategoryError,
  } = useCreateCategory()

  const {
    mutate: updateCategoryMutate,
    status: updateCategoryStatus,
    error: updateCategoryError,
  } = useUpdateCategory()

  const {
    mutate: deleteCategoryMutate,
    status: deleteCategoryStatus,
    error: deleteCategoryError,
  } = useDeleteCategory()

  return {
    query: {
      data,
      status,
      error,
    },
    mutation: {
      create: {
        mutate: createCategoryMutate,
        status: createCategoryStatus,
        error: createCategoryError,
      },
      update: {
        mutate: updateCategoryMutate,
        status: updateCategoryStatus,
        error: updateCategoryError,
      },
      delete: {
        mutate: deleteCategoryMutate,
        status: deleteCategoryStatus,
        error: deleteCategoryError,
      },
    },
  }
}

export default useCategory
