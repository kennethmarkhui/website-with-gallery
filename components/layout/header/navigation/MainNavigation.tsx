import Link from 'next/link'

import type { IMainHeader } from '../MainHeader'

const MainNavigation = ({ items }: { items: IMainHeader[] }): JSX.Element => {
  return (
    <ul className="hidden sm:flex">
      {items.map((item) => (
        <li className="capitalize" key={item.name}>
          <Link href={item.path}>
            <a>{item.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default MainNavigation
