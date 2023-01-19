import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { HiArrowLeft, HiOutlineSearch, HiPlus } from 'react-icons/hi'

import LocaleSwitcher from './LocaleSwitcher'
import Auth from '@/components/Auth'
import Drawer from '@/components/Drawer'
import { useState } from 'react'
import FilterForm from '@/components/gallery/FilterForm'

const GalleryHeader = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const t = useTranslations('gallery')

  const openDrawer = (): void => {
    setIsOpen(true)
  }

  const closeDrawer = (): void => {
    setIsOpen(false)
  }

  return (
    <>
      <header className="mx-auto mt-2 mb-0 flex w-full max-w-5xl items-center justify-between">
        <Link href={router.asPath === '/gallery' ? '/' : '/gallery'}>
          <div className="flex cursor-pointer items-center justify-center rounded-full border-2 border-black p-2">
            <HiArrowLeft />
            <span className="hidden sm:inline">
              {router.asPath === '/gallery' ? t('return') : t('return-gallery')}
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {router.pathname === '/gallery' && (
            <div className="flex space-x-4">
              {session?.user.role === 'ADMIN' && (
                <Link href={'/gallery/create'}>
                  <HiPlus />
                </Link>
              )}
              <button className="lg:hidden" onClick={openDrawer}>
                <HiOutlineSearch />
              </button>
            </div>
          )}
          <div className="flex items-center">
            <LocaleSwitcher />
            <Auth />
          </div>
        </div>
      </header>
      <Drawer isOpen={isOpen} onClose={closeDrawer} openFrom="bottom">
        <FilterForm callback={closeDrawer} className="p-8" />
      </Drawer>
    </>
  )
}

export default GalleryHeader
