import { useRouter } from 'next/router'

import { GalleryOffsetQuery } from 'types/gallery'
import { GalleryOffsetQuerySchema } from 'lib/validations'

const useUrlGalleryFilters = () => {
  const router = useRouter()

  const parsedFilters = GalleryOffsetQuerySchema.safeParse(router.query)
  const filters = parsedFilters.success ? parsedFilters.data : {}

  const setUrlGalleryFilters = (
    props:
      | ((filters: GalleryOffsetQuery) => {
          query: GalleryOffsetQuery
        })
      | {
          query: GalleryOffsetQuery
        }
  ) =>
    router.push(
      {
        pathname: router.pathname,
        query: typeof props === 'function' ? props(filters).query : props.query,
      },
      undefined,
      { shallow: true }
    )

  return {
    filters,
    setUrlGalleryFilters,
  }
}

export default useUrlGalleryFilters
