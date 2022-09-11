import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Category } from 'prisma/prisma-client'

const getCategories = async (): Promise<Pick<Category, 'id' | 'name'>[]> => {
  try {
    const res = await fetch('/api/gallery/category')
    const data = await res.json()
    if (!res.ok && data.hasOwnProperty('error')) {
      throw new Error(data.message)
    }
    return data
  } catch (error) {
    throw new Error('Something went wrong.')
  }
}

const useCategory = (): UseQueryResult<Pick<Category, 'id' | 'name'>[]> => {
  return useQuery(['categories'], getCategories)
}

export default useCategory
