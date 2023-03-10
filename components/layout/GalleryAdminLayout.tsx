import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { HiMenu, HiOutlineHome, HiOutlineSearch, HiPlus } from 'react-icons/hi'
import clsx from 'clsx'

import useDrawer from 'hooks/useDrawer'
import LocaleSwitcher from './header/LocaleSwitcher'
import Profile from '../Profile'
import Sidebar from '../gallery/Sidebar'
import FilterForm from '../gallery/FilterForm'

interface GalleryAdminLayoutProps {
  children: React.ReactNode
}

interface GalleryAdminLayoutNavProps {
  items: GalleryAdminLayoutNavItemsProps[]
  callback?: () => void
}

interface GalleryAdminLayoutNavItemsProps {
  name: string
  path: string
  icon: ReactNode
}

const GalleryAdminLayoutNavItems: GalleryAdminLayoutNavItemsProps[] = [
  {
    name: 'Home',
    path: '/gallery/admin',
    icon: (
      <HiOutlineHome className="h-4 w-4 text-gray-400 group-hover:text-black" />
    ),
  },
  {
    name: 'Create',
    path: '/gallery/admin/create',
    icon: <HiPlus className="h-4 w-4 text-gray-400 group-hover:text-black" />,
  },
]

const GalleryAdminLayoutNav = ({
  items,
  callback,
}: GalleryAdminLayoutNavProps): JSX.Element => {
  return (
    <ul className="border-t pt-4">
      {items.map(({ name, path, icon }) => (
        <li key={name}>
          <Link
            href={path}
            className="group flex items-center gap-2 p-2"
            onClick={callback}
          >
            {icon}
            <span>{name}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const GalleryAdminLayout = ({
  children,
}: GalleryAdminLayoutProps): JSX.Element => {
  const { pathname } = useRouter()
  const { isOpen, openDrawer, closeDrawer } = useDrawer()
  const {
    isOpen: filterIsOpen,
    openDrawer: openFilter,
    closeDrawer: closeFilter,
  } = useDrawer()

  const isGalleryAdminHomePage = pathname === '/gallery/admin'

  return (
    <div className="flex min-h-screen flex-row overflow-clip">
      <Sidebar isOpen={isOpen} open={openDrawer} close={closeDrawer}>
        <div className="space-y-4">
          <Profile />
          <LocaleSwitcher />
          <GalleryAdminLayoutNav
            items={GalleryAdminLayoutNavItems}
            callback={closeDrawer}
          />
        </div>
      </Sidebar>
      <main
        className={clsx(
          'w-full p-8',
          'transition-all duration-150 ease-in',
          '-ml-64 lg:ml-0',
          isGalleryAdminHomePage && '-mr-64 lg:mr-0'
        )}
      >
        <div className="sticky top-0 z-10 flex w-full items-center bg-white py-4">
          <HiMenu className="cursor-pointer lg:hidden" onClick={openDrawer} />
          {isGalleryAdminHomePage && (
            <HiOutlineSearch
              className="ml-auto cursor-pointer lg:hidden"
              onClick={openFilter}
            />
          )}
        </div>
        {children}
      </main>
      {isGalleryAdminHomePage && (
        <Sidebar
          placement="right"
          isOpen={filterIsOpen}
          open={openFilter}
          close={closeFilter}
        >
          <div className="flex h-full flex-col">
            <FilterForm callback={closeFilter} />
          </div>
        </Sidebar>
      )}
    </div>
  )
}

export default GalleryAdminLayout
