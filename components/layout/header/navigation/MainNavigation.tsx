import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'

import type { IMainHeader } from '../MainHeader'

const MainNavigation = ({ items }: { items: IMainHeader[] }): JSX.Element => {
  const router = useRouter()

  return (
    <ul className="hidden sm:flex">
      {items.map(
        (item): JSX.Element => (
          <li
            className={clsx(
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
