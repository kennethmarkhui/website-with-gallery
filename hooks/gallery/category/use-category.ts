import { useQuery, UseQueryResult } from '@tanstack/react-query'

const getCategories = async (): Promise<string[]> => {
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

const useCategory = (): UseQueryResult<string[]> => {
  return useQuery(['categories'], getCategories)
}

export default useCategory
