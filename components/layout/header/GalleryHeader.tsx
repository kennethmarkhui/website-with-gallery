import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { HiArrowLeft } from 'react-icons/hi'

import LocaleSwitcher from './LocaleSwitcher'
import Auth from '@/components/Auth'

const GalleryHeader = (): JSX.Element => {
  const router = useRouter()
  const { data: session } = useSession()
  const t = useTranslations('gallery')

  return (
    <header className="mx-auto mt-2 mb-0 flex w-full max-w-5xl items-center justify-between">
      <Link href={router.asPath === '/gallery' ? '/' : '/gallery'}>
        <div className="flex cursor-pointer items-center justify-center rounded-full border-2 border-black p-2">
          <HiArrowLeft />
          <span className="hidden sm:inline">
            {router.asPath === '/gallery' ? t('return') : t('return-gallery')}
          </span>
        </div>
      </Link>

      {router.pathname === '/gallery' && session?.user.role === 'ADMIN' && (
        <Link href={'/gallery/create'}>
          <a>add</a>
        </Link>
      )}

      <div className="flex items-center">
        <LocaleSwitcher />
        <Auth />
      </div>
    </header>
  )
}

export default GalleryHeader
