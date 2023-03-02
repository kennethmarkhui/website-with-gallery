import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { HiArrowLeft, HiOutlineSearch, HiPlus } from 'react-icons/hi'

import LocaleSwitcher from './LocaleSwitcher'
import Auth from '@/components/Auth'

interface GalleryAdminHeaderProps {
  onSidebarButtonClicked: () => void
}

const GalleryAdminHeader = ({
  onSidebarButtonClicked,
}: GalleryAdminHeaderProps): JSX.Element => {
  const router = useRouter()
  const { data: session } = useSession()
  const t = useTranslations('gallery')

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between bg-white p-8">
      <Link
        href={
          router.pathname === '/gallery/admin' ? '/gallery' : '/gallery/admin'
        }
      >
        <button
          type="button"
          className="flex cursor-pointer items-center justify-center gap-4 hover:underline"
        >
          <HiArrowLeft />
          <span className="hidden sm:inline">
            {router.pathname === '/gallery/admin'
              ? t('return')
              : t('return-gallery')}
          </span>
        </button>
      </Link>

      <div className="flex items-center space-x-4">
        {router.pathname === '/gallery/admin' && (
          <div className="flex space-x-4">
            {session?.user.role === 'ADMIN' && (
              <Link href={'/gallery/admin/create'}>
                <HiPlus />
              </Link>
            )}

            <button className="lg:hidden" onClick={onSidebarButtonClicked}>
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
  )
}

export default GalleryAdminHeader