import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { HiArrowLeft } from 'react-icons/hi'

import LocaleSwitcher from './LocaleSwitcher'
import Auth from '@/components/Auth'

const GalleryHeader = (): JSX.Element => {
  const t = useTranslations('gallery')

  return (
    <header className="mx-auto mt-2 mb-0 flex w-full max-w-5xl items-center justify-between">
      <Link href="/">
        <div className="flex cursor-pointer items-center justify-center rounded-full border-2 border-black p-2">
          <HiArrowLeft />
          <span className="hidden sm:inline">{t('return')}</span>
        </div>
      </Link>
      <div className="flex items-center">
        <LocaleSwitcher />
        <Auth />
      </div>
    </header>
  )
}

export default GalleryHeader
