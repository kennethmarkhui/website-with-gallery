import { useTranslations } from 'next-intl'

import LocaleSwitcher from '../locale-switcher'
import MainNavigation from './main-navigation'
import MobileNavigation from './mobile-navigation'
import Animated from '@/components/animated/animated'
import { Link } from '@/i18n/routing'

export interface MainHeaderProps {
  name: 'index' | 'about'
  path: string
}

const NavItems: MainHeaderProps[] = [
  {
    name: 'index',
    path: '/',
  },
  { name: 'about', path: '/about' },
]

export default function MainHeader() {
  const t = useTranslations('navigation')

  const translatedNavItems = [
    ...NavItems.map(
      ({ name, path }) => ({ name: t(name), path }) as MainHeaderProps
    ),
  ]

  return (
    <header className="mx-auto mt-2 mb-0 flex w-full max-w-5xl items-center justify-between">
      <Animated>
        <Link href="/" className="h-9 w-9">
          Logo
        </Link>
      </Animated>
      <nav className="flex sm:my-4">
        <LocaleSwitcher />
        <MainNavigation items={translatedNavItems} />
        <MobileNavigation items={translatedNavItems} />
      </nav>
    </header>
  )
}
