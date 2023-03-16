import { useRouter } from 'next/router'
import clsx from 'clsx'

import GalleryHeader from './header/GalleryHeader'
import Sidebar from '../gallery/Sidebar'
import FilterForm from '../gallery/FilterForm'
import useDrawer from 'hooks/useDrawer'

interface GalleryLayoutProps {
  children: React.ReactNode
}

const GalleryLayout = ({ children }: GalleryLayoutProps): JSX.Element => {
  const router = useRouter()
  const { isOpen, openDrawer, closeDrawer } = useDrawer()

  return (
    <div className="flex min-h-screen flex-row">
      <Sidebar isOpen={isOpen} close={closeDrawer}>
        <div className="flex h-full flex-col">
          {!isOpen && <GalleryHeader smallVersion />}
          <FilterForm
            onSubmitCallback={(data) => {
              router.push(
                !data ? router.pathname : { query: data },
                undefined,
                {
                  shallow: true,
                }
              )
              closeDrawer()
            }}
          />
        </div>
      </Sidebar>
      <div
        className={clsx(
          'transition-all duration-150 ease-in',
          '-ml-64 w-full lg:ml-0'
        )}
      >
        <GalleryHeader onSidebarButtonClicked={openDrawer} />
        <main
          className={clsx(
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
