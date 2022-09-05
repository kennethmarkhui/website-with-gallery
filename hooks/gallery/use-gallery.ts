import { useQuery, UseQueryResult } from '@tanstack/react-query'

import type { OmittedItem } from 'types/gallery'

export const getItems = async (): Promise<OmittedItem[]> => {
  try {
    const res = await fetch('/api/gallery')
    const data = await res.json()
    if (!res.ok && data.hasOwnProperty('error')) {
      throw new Error(data.message)
    }
    return data
  } catch (error) {
    throw new Error('Something went wrong.')
  }
}

const useGallery = (): UseQueryResult<OmittedItem[]> => {
  return useQuery(['gallery'], getItems)
}

export default useGallery
