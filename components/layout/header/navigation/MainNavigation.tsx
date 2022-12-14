import Link from 'next/link'
import { useRouter } from 'next/router'

import type { IMainHeader } from '../MainHeader'

const MainNavigation = ({ items }: { items: IMainHeader[] }): JSX.Element => {
  const router = useRouter()

  return (
    <ul className="hidden sm:flex">
      {items.map(
        (item): JSX.Element => (
          <li
            className={`${
              router.asPath === item.path ? 'border-b-2 border-black' : ''
            } p-2 capitalize`}
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
