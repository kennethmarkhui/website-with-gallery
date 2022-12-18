import { useQuery } from '@tanstack/react-query'
import { Category } from 'prisma/prisma-client'

import fetcher from 'lib/fetcher'

const useCategory = () => {
  const { data, status, error } = useQuery(['categories'], () =>
    fetcher<Pick<Category, 'id' | 'name'>[]>('/api/gallery/category')
  )

  return {
    data,
    status,
    error,
  }
}

export default useCategory
