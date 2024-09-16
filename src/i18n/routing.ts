import { createSharedPathnamesNavigation } from 'next-intl/navigation'

import { i18n } from './config'

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(i18n)
