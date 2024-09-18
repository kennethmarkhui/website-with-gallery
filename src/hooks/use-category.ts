import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'

import { getCategories } from '@/actions/category'

const useCategory = () => {
  const locale = useLocale()
  const { data, status, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

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
