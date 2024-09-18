import { unstable_setRequestLocale } from 'next-intl/server'

import MainHeader from '@/components/header/main-header'

export default function LandingLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale)

  return (
    <div className="mx-auto my-0 flex h-screen min-h-full w-full flex-col justify-between overflow-hidden px-12 py-4">
      <MainHeader />
      <main className="m-auto w-full max-w-5xl">{children}</main>
    </div>
  )
}
