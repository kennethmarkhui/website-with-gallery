import Link from 'next/link'
import { HiArrowLeft, HiOutlineSearch } from 'react-icons/hi'

import LocaleSwitcher from '../locale-switcher'
import { usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'

interface GalleryHeaderProps {
  onSidebarButtonClicked?: () => void
  smallVersion?: boolean
}

export default function GalleryHeader({
  onSidebarButtonClicked,
  smallVersion,
}: GalleryHeaderProps) {
  const pathname = usePathname()
  return (
    <header
      className={cn(
        'flex h-16 w-full shrink-0 items-center justify-between z-20',
        'transform transition-transform duration-150 ease-in',
        !smallVersion && 'translate-y-0 lg:-translate-y-full',
        !smallVersion && 'sticky top-0 bg-white px-8'
      )}
    >
      <Link href={pathname === '/gallery' ? '/' : '/gallery'}>
        <button
          type="button"
          className="flex cursor-pointer items-center justify-center gap-4 hover:underline"
        >
          <HiArrowLeft />
        </button>
      </Link>

      <div className="flex items-center space-x-4">
        {pathname === '/gallery' && (
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
