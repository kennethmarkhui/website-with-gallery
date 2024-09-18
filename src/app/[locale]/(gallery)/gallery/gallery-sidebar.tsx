'use client'

import GalleryHeader from '@/components/header/gallery-header'
import FilterForm from '@/components/gallery/filter-form'
import Sidebar from '@/components/gallery/sidebar'
import { useCapturedSearchParams } from '@/hooks/use-captured-search-params'
import useUrlGalleryFilters from '@/hooks/use-url-gallery-filters'
import { i18n } from '@/i18n/config'
import { usePathname } from '@/i18n/routing'
import {
  GalleryFormFilters,
  GalleryOffsetQuery,
  GalleryOrderBy,
} from '@/types/gallery'

interface GallerySidebarProps {
  locale: string
  isOpen: boolean
  closeDrawer: () => void
}

export default function GallerySidebar({
  locale,
  isOpen,
  closeDrawer,
}: GallerySidebarProps) {
  const pathname = usePathname()
  const searchParams = useCapturedSearchParams()

  const paramsObject = Object.fromEntries(searchParams.entries())

  const {
    filters: { search, category, orderBy },
    setUrlGalleryFilters,
  } = useUrlGalleryFilters({
    mode: 'cursor',
    query: paramsObject,
    setUrlGalleryFiltersCallback: (filters) => {
      const queryParams = new URLSearchParams(filters).toString()
      const url = `${locale === i18n.defaultLocale ? '' : `/${locale}`}${pathname}${queryParams === '' ? '' : `?${queryParams}`}`
      window.history.pushState(null, '', url)
    },
  })

  return (
    <Sidebar isOpen={isOpen} close={closeDrawer}>
      <div className="flex h-full flex-col">
        {!isOpen && <GalleryHeader smallVersion />}
        <FilterForm
          defaultValues={{
            search: search ?? '',
            category: category?.split(',') ?? [],
            orderBy: orderBy?.split(',') as GalleryOrderBy,
          }}
          onSubmitCallback={(data) => {
            // filter out falsy and empty arrays
            // https://stackoverflow.com/a/38340730
            const query = (Object.keys(data) as (keyof GalleryFormFilters)[])
              .filter((key) => {
                const value = data[key]
                return Array.isArray(value) ? value.length !== 0 : !!value
              })
              .reduce((newData, currentKey) => {
                const currentValue = data[currentKey]
                return {
                  ...newData,
                  [currentKey]: Array.isArray(currentValue)
                    ? currentValue.join(',')
                    : currentValue,
                }
              }, {}) as GalleryOffsetQuery

            setUrlGalleryFilters({ query })
            closeDrawer()
          }}
        />
      </div>
    </Sidebar>
  )
}
