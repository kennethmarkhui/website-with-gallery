'use client'

import type { MainHeaderProps } from './main-header'
import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export default function MainNavigation({
  items,
}: {
  items: MainHeaderProps[]
}) {
  const pathname = usePathname()

  return (
    <ul className="hidden sm:flex">
      {items.map(
        (item): JSX.Element => (
          <li
            className={cn(
              'p-2 capitalize',
              pathname === item.path && 'border-b-2 border-black'
            )}
            key={item.name}
          >
            <Link href={item.path}>{item.name}</Link>
          </li>
        )
      )}
    </ul>
  )
}
