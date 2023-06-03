import GalleryHeader from './header/GalleryHeader'
import Sidebar from '../gallery/Sidebar'
import FilterForm from '../gallery/FilterForm'
import useDrawer from 'hooks/useDrawer'
import useUrlGalleryFilters from 'hooks/gallery/useUrlGalleryFilters'
import { GalleryOrderBy } from 'types/gallery'
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
              search: typeof search === 'string' ? search : undefined ?? '',
              category:
                typeof category === 'string'
                  ? category.split(',')
                  : undefined ?? [],
              orderBy:
                typeof orderBy === 'string'
                  ? (orderBy.split(',') as GalleryOrderBy)
                  : undefined ?? [],
            }}
            onSubmitCallback={(data) => {
              setUrlGalleryFilters({ query: data })
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
