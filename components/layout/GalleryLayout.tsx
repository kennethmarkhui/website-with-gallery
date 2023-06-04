import GalleryHeader from './header/GalleryHeader'
import Sidebar from '../gallery/Sidebar'
import FilterForm from '../gallery/FilterForm'
import useDrawer from 'hooks/useDrawer'
import useUrlGalleryFilters from 'hooks/gallery/useUrlGalleryFilters'
import {
  GalleryFormFilters,
  GalleryOrderBy,
  GalleryOffsetQuery,
} from 'types/gallery'
import { cn } from 'lib/utils'

interface GalleryLayoutProps {
  children: React.ReactNode
}

const GalleryLayout = ({ children }: GalleryLayoutProps): JSX.Element => {
  const {
    filters: { search, category, orderBy },
    setUrlGalleryFilters,
  } = useUrlGalleryFilters()
  const { isOpen, openDrawer, closeDrawer } = useDrawer()

  return (
    <div className="flex min-h-screen flex-row">
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

              console.log(query)

              setUrlGalleryFilters({ query })
              closeDrawer()
            }}
          />
        </div>
      </Sidebar>
      <div
        className={cn(
          'transition-all duration-150 ease-in',
          '-ml-64 w-full lg:ml-0'
        )}
      >
        <GalleryHeader onSidebarButtonClicked={openDrawer} />
        <main
          className={cn(
            'w-full px-8 pb-8 lg:pt-8',
            'transition-all duration-150 ease-in',
            'ml-0 lg:-mt-16'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default GalleryLayout
