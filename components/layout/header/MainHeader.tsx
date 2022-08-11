import { useTranslations } from 'next-intl'
import Link from 'next/link'

import LocaleSwitcher from './LocaleSwitcher'
import MainNavigation from './navigation/MainNavigation'
import MobileNavigation from './navigation/MobileNavigation'
import Animated from '@/components/animated/Animated'

export interface IMainHeader {
  name: 'index' | 'about'
  path: string
}

const NavItems: IMainHeader[] = [
  {
    name: 'index',
    path: '/',
  },
  { name: 'about', path: '/about' },
]

const MainHeader = (): JSX.Element => {
  const t = useTranslations('navigation')

  const translatedNavItems = [
    ...NavItems.map(
      ({ name, path }) => ({ name: t(name), path } as IMainHeader)
    ),
  ]

  return (
    <header className="mx-auto mt-2 mb-0 flex w-full max-w-5xl items-center justify-between">
      <Animated>
        <Link href="/">
          <a className="h-9 w-9">Logo</a>
        </Link>
      </Animated>
      <div className="flex sm:my-4">
        <LocaleSwitcher />
        <MainNavigation items={translatedNavItems} />
        <MobileNavigation items={translatedNavItems} />
      </div>
    </header>
  )
}

export default MainHeader
