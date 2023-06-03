import { useRouter } from 'next/router'

import { GalleryFilters } from 'types/gallery'
import { GalleryFiltersSchema } from 'lib/validations'

const useUrlGalleryFilters = () => {
  const router = useRouter()

  const parsedFilters = GalleryFiltersSchema.safeParse(router.query)
  const filters = parsedFilters.success ? parsedFilters.data : {}

  const setUrlGalleryFilters = (
    props:
      | ((filters: GalleryFilters) => {
          query: GalleryFilters
        })
      | {
          query: GalleryFilters
        }
  ) =>
    router.push({
      pathname: router.pathname,
      query: typeof props === 'function' ? props(filters).query : props.query,
    })

  return {
    filters,
    setUrlGalleryFilters,
  }
}

export default useUrlGalleryFilters
