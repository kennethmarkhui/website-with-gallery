'use client'

import { useTranslations } from 'next-intl'
import { HiMenu, HiOutlineHome, HiPlus } from 'react-icons/hi'

import Profile from './profile'
import LocaleSwitcher from '@/components/locale-switcher'
import Sidebar from '@/components/gallery/sidebar'
import useDrawer from '@/hooks/use-drawer'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'

interface GalleryAdminLayoutProps {
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
    path: '/admin',
    icon: (
      <HiOutlineHome className="h-4 w-4 text-gray-400 group-hover:text-black" />
    ),
  },
  {
    name: 'create',
    path: '/admin/create',
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

export default function GalleryAdminLayout({
  children,
}: GalleryAdminLayoutProps) {
  const t = useTranslations('gallery-admin')
  const { isOpen, openDrawer, closeDrawer } = useDrawer()

  const translatedGalleryAdminLayoutNavItems = GalleryAdminLayoutNavItems.map(
    ({ name, path, icon }) => ({ name: t(name), path, icon })
  ) as GalleryAdminLayoutNavItemsProps[]

  return (
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
  )
}
