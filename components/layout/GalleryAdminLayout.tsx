import Head from 'next/head'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { HiMenu, HiOutlineHome, HiPlus } from 'react-icons/hi'

import useDrawer from 'hooks/useDrawer'
import LocaleSwitcher from './header/LocaleSwitcher'
import Profile from '../Profile'
import Sidebar from '../gallery/Sidebar'
import { cn } from 'lib/utils'

interface GalleryAdminLayoutProps {
  title?: string
  children: React.ReactNode
}

interface GalleryAdminLayoutNavProps {
  items: GalleryAdminLayoutNavItemsProps[]
  callback?: () => void
}

interface GalleryAdminLayoutNavItemsProps {
  name: 'home' | 'create'
  path: string
  icon: React.ReactNode
}

const GalleryAdminLayoutNavItems: GalleryAdminLayoutNavItemsProps[] = [
  {
    name: 'home',
    path: '/gallery/admin',
    icon: (
      <HiOutlineHome className="h-4 w-4 text-gray-400 group-hover:text-black" />
    ),
  },
  {
    name: 'create',
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
  title = '',
  children,
}: GalleryAdminLayoutProps): JSX.Element => {
  const t = useTranslations('gallery-admin')
  const { isOpen, openDrawer, closeDrawer } = useDrawer()

  const translatedGalleryAdminLayoutNavItems = GalleryAdminLayoutNavItems.map(
    ({ name, path, icon }) => ({ name: t(name), path, icon })
  ) as GalleryAdminLayoutNavItemsProps[]

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex min-h-screen flex-row overflow-clip">
        <Sidebar isOpen={isOpen} open={openDrawer} close={closeDrawer}>
          <div className="space-y-4">
            <Profile />
            <LocaleSwitcher />
            <GalleryAdminLayoutNav
              items={translatedGalleryAdminLayoutNavItems}
              callback={closeDrawer}
            />
          </div>
        </Sidebar>
        <div
          className={cn(
            'w-full',
            'transition-all duration-150 ease-in',
            '-ml-64 lg:ml-0'
          )}
        >
          <header className="sticky top-0 z-10 flex w-full items-center bg-white p-8 lg:hidden">
            <HiMenu className="cursor-pointer" onClick={openDrawer} />
          </header>
          <main className="w-full px-8 pb-8 lg:pt-8">{children}</main>
        </div>
      </div>
    </>
  )
}

export default GalleryAdminLayout
