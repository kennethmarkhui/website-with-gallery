import { useSession, signIn, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { HiArrowLeft } from 'react-icons/hi'
import { FaGoogle, FaSignOutAlt } from 'react-icons/fa'
import LocaleSwitcher from './LocaleSwitcher'

const GalleryHeader = (): JSX.Element => {
  const { data: session } = useSession()
  const t = useTranslations('gallery')

  return (
    <header className="mx-auto mt-2 mb-0 flex w-full max-w-5xl items-center justify-between">
      <Link href="/">
        <div className="flex cursor-pointer items-center justify-center rounded-full border-4 border-black p-2">
          <HiArrowLeft className="h-9 w-9" />
          <span className="hidden sm:inline">{t('return')}</span>
        </div>
      </Link>
      <div className="flex items-center">
        <LocaleSwitcher />
        {session ? (
          <div className="inline-flex items-center gap-2">
            <span className="hidden sm:inline">{session.user?.name}</span>
            <button onClick={() => signOut()}>
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          <button
            className="inline-flex items-center gap-2 rounded-full border-2 border-black p-2"
            onClick={() => signIn()}
          >
            <FaGoogle />
            <span className="hidden sm:inline">Sign in with Google</span>
          </button>
        )}
      </div>
    </header>
  )
}

export default GalleryHeader
