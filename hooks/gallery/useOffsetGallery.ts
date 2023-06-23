import { useQuery } from '@tanstack/react-query'

import type { GalleryOffsetQuery, GalleryResponse } from 'types/gallery'
import fetcher from 'lib/fetcher'
import { generateQueryStringFromObject } from 'lib/utils'
import { useRouter } from 'next/router'

interface UseOffsetGalleryProps {
  filters: GalleryOffsetQuery
}

const useOffsetGallery = ({ filters }: UseOffsetGalleryProps) => {
  const { locale } = useRouter()
  const { data, status, error, isPreviousData } = useQuery({
    queryKey: ['gallery', 'offset', filters] as const,
    queryFn: ({ queryKey }) =>
      fetcher<GalleryResponse>(
        '/api/gallery' +
          generateQueryStringFromObject({
            ...queryKey[2],
            page: queryKey[2].page ?? '1',
          })
      ),
    keepPreviousData: true,
  })

  const localizedData = {
    ...data,
    items: data?.items.map(({ id, category, image, translations }) => {
      const localizedItem = translations.find(
        ({ language }) => language.code === locale
      )
      return {
        id,
        category,
        image,
        name: localizedItem?.name ?? null,
        storage: localizedItem?.storage ?? null,
      }
    }),
  }

  return {
    data,
    localizedData,
    status,
    error,
    isPreviousData,
  }
}

export default useOffsetGallery
