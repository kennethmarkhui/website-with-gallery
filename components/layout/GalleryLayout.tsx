import clsx from 'clsx'

import GalleryHeader from './header/GalleryHeader'
import Sidebar from '../gallery/Sidebar'
import useDrawer from 'hooks/useDrawer'

interface GalleryLayoutProps {
  children: React.ReactNode
  withSidebar?: boolean
}

const GalleryLayout = ({
  children,
  withSidebar,
}: GalleryLayoutProps): JSX.Element => {
  const { isOpen, toggleDrawer, closeDrawer } = useDrawer()

  return (
    <div className="mx-auto min-h-screen max-w-screen-2xl">
      <GalleryHeader onSidebarButtonClicked={toggleDrawer} />
      <div className="flex flex-row">
        {withSidebar && <Sidebar isOpen={isOpen} close={closeDrawer} />}
        <main
          className={clsx(
            'w-full p-8',
            'transition-all duration-150 ease-in',
            withSidebar && '-ml-64 lg:ml-0'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default GalleryLayout
