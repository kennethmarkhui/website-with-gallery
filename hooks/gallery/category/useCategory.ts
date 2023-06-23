import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'

import { GalleryCategoryResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'

const useCategory = () => {
  const { locale } = useRouter()
  const { data, status, error } = useQuery(['categories'], () =>
    fetcher<GalleryCategoryResponse>('/api/gallery/category')
  )

  const localizedData = data?.map(({ id, translations }) => {
    const translatedName = translations.find((t) => t.language.code === locale)
    return {
      id,
      name: translatedName?.name ?? 'no name',
    }
  })

  return {
    data,
    localizedData,
    status,
    error,
  }
}

export default useCategory
