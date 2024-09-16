import { useLocale } from 'next-intl'
import { useQuery, keepPreviousData } from '@tanstack/react-query'

import { getAdminItems } from '@/actions/gallery-admin'
import type { GalleryOffsetQuery } from '@/types/gallery'

interface UseOffsetGalleryProps {
  filters: GalleryOffsetQuery
}

const useOffsetGallery = ({ filters }: UseOffsetGalleryProps) => {
  const locale = useLocale()

  const { data, status, error, isPlaceholderData } = useQuery({
    queryKey: ['gallery', 'offset', filters] as const,
    queryFn: ({ queryKey }) =>
      getAdminItems({
        ...queryKey[2],
        page: queryKey[2].page ?? '1',
      }),
    placeholderData: keepPreviousData,
  })

  const localizedData = {
    ...data,
    items: data?.items.map(
      ({ id, category, image, translations, dateAdded, updatedAt }) => {
        const localizedItem = translations.find(
          ({ language }) => language.code === locale
        )
        return {
          id,
          category,
          image,
          name: localizedItem?.name ?? null,
          storage: localizedItem?.storage ?? null,
          dateAdded,
          updatedAt,
        }
      }
    ),
  }

  return {
    data,
    localizedData,
    status,
    error,
    isPlaceholderData,
  }
}

export default useOffsetGallery
