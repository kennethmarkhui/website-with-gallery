import Link from 'next/link'
import { useRouter } from 'next/router'
import { HiArrowLeft, HiOutlineSearch } from 'react-icons/hi'

import LocaleSwitcher from './LocaleSwitcher'
import clsx from 'clsx'

interface GalleryHeaderProps {
  onSidebarButtonClicked?: () => void
  smallVersion?: boolean
}

const GalleryHeader = ({
  onSidebarButtonClicked,
  smallVersion,
}: GalleryHeaderProps): JSX.Element => {
  const router = useRouter()

  return (
    <header
      className={clsx(
        'flex h-16 w-full shrink-0 items-center justify-between',
        'transform transition-transform duration-150 ease-in',
        !smallVersion && 'translate-y-0 lg:-translate-y-full',
        !smallVersion && 'sticky top-0 z-20 bg-white px-8'
      )}
    >
      <Link href={router.pathname === '/gallery' ? '/' : '/gallery'}>
        <button
          type="button"
          className="flex cursor-pointer items-center justify-center gap-4 hover:underline"
        >
          <HiArrowLeft />
        </button>
      </Link>

      <div className="flex items-center space-x-4">
        {router.pathname === '/gallery' && (
          <button className="lg:hidden" onClick={onSidebarButtonClicked}>
            <HiOutlineSearch />
          </button>
        )}
        <div className="flex items-center">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  )
}

export default GalleryHeader
