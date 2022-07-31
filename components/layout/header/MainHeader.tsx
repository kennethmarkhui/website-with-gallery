import Link from 'next/link'
import MainNavigation from './navigation/MainNavigation'
import MobileNavigation from './navigation/MobileNavigation'

export interface IMainHeader {
  name: string
  path: string
}

const NavItems: IMainHeader[] = [
  {
    name: 'home',
    path: '/',
  },
  { name: 'about', path: '/about' },
]

const MainHeader = (): JSX.Element => {
  return (
    <header className="mx-auto mt-2 mb-0 flex w-full max-w-5xl items-center justify-between">
      <Link href="/">
        <a>Logo</a>
      </Link>
      <MainNavigation items={NavItems} />
      <MobileNavigation items={NavItems} />
    </header>
  )
}

export default MainHeader
