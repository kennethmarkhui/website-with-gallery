import { ParsedUrlQuery } from 'querystring'

import {
  GalleryCursorQuery,
  GalleryOffsetQuery,
  PaginationType,
} from 'types/gallery'
import {
  GalleryCursorQuerySchema,
  GalleryOffsetQuerySchema,
} from 'lib/validations'

interface UseUrlGalleryFiltersProps<TMode, TFilter> {
  mode: TMode
  query: ParsedUrlQuery
  setUrlGalleryFiltersCallback: (filters: TFilter) => void
}

type FilterMode<TMode extends PaginationType> = TMode extends 'cursor'
  ? GalleryCursorQuery
  : GalleryOffsetQuery

const useUrlGalleryFilters = <
  TMode extends PaginationType,
  TFilter extends FilterMode<TMode>,
>({
  mode,
  query,
  setUrlGalleryFiltersCallback,
}: UseUrlGalleryFiltersProps<TMode, TFilter>) => {
  const parsedFilters =
    mode === 'cursor'
      ? GalleryCursorQuerySchema.safeParse(query)
      : GalleryOffsetQuerySchema.safeParse(query)
  const filters = parsedFilters.success
    ? (parsedFilters.data as TFilter)
    : ({} as TFilter)

  const setUrlGalleryFilters = (
    props:
      | ((filters: TFilter) => {
          query: TFilter
        })
      | {
          query: TFilter
        }
  ) => {
    setUrlGalleryFiltersCallback(
      typeof props === 'function' ? props(filters).query : props.query
    )
  }

  return {
    filters,
    setUrlGalleryFilters,
  }
}

export default useUrlGalleryFilters
