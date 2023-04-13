import Link from 'next/link'
import { useRouter } from 'next/router'

import type { IMainHeader } from '../MainHeader'
import { cn } from 'lib/utils'

const MainNavigation = ({ items }: { items: IMainHeader[] }): JSX.Element => {
  const router = useRouter()

  return (
    <ul className="hidden sm:flex">
      {items.map(
        (item): JSX.Element => (
          <li
            className={cn(
              'p-2 capitalize',
              router.asPath === item.path && 'border-b-2 border-black'
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

export default MainNavigation
