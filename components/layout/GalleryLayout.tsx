import clsx from 'clsx'

import GalleryHeader from './header/GalleryHeader'
import Sidebar from '../gallery/Sidebar'
import useDrawer from 'hooks/useDrawer'

interface GalleryLayoutProps {
  children: React.ReactNode
}

const GalleryLayout = ({ children }: GalleryLayoutProps): JSX.Element => {
  const { isOpen, toggleDrawer, closeDrawer } = useDrawer()

  return (
    <div className="flex min-h-screen flex-row">
      <Sidebar isOpen={isOpen} close={closeDrawer} />
      <div
        className={clsx(
          'transition-all duration-150 ease-in',
          '-ml-64 lg:ml-0'
        )}
      >
        <GalleryHeader onSidebarButtonClicked={toggleDrawer} />
        <main
          className={clsx(
            'w-full p-8',
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
