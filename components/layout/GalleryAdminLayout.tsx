import clsx from 'clsx'
import useDrawer from 'hooks/useDrawer'
import Sidebar from '../gallery/Sidebar'
import GalleryAdminHeader from './header/GalleryAdminHeader'

interface GalleryAdminLayoutProps {
  children: React.ReactNode
  withSidebar?: boolean
}

const GalleryAdminLayout = ({
  children,
  withSidebar,
}: GalleryAdminLayoutProps): JSX.Element => {
  const { isOpen, toggleDrawer, closeDrawer } = useDrawer()

  // TODO: admin layout
  return (
    <div className="mx-auto min-h-screen max-w-screen-2xl">
      <GalleryAdminHeader onSidebarButtonClicked={toggleDrawer} />
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

export default GalleryAdminLayout
