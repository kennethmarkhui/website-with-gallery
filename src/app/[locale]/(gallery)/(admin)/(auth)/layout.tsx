import { unstable_setRequestLocale } from 'next-intl/server'

export default function AuthLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale)
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 px-4">
      {children}
    </div>
  )
}
