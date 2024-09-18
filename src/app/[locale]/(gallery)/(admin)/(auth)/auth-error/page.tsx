import { unstable_setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'

import Button from '@/components/button'
import { Link } from '@/i18n/routing'

// https://next-auth.js.org/configuration/pages#error-codes
const AuthErrorCode = [
  'Configuration',
  'AccessDenied',
  'Verification',
  'Default',
] as const

type AuthErrorCode = (typeof AuthErrorCode)[number]

const isAuthErrorCode = (errorCode: string): errorCode is AuthErrorCode => {
  return AuthErrorCode.includes(errorCode as AuthErrorCode)
}

export default function AuthErrorPage({
  searchParams,
  params: { locale },
}: {
  searchParams: { error?: string }
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale)
  const t = useTranslations('auth')
  const { error } = searchParams

  return (
    <>
      <p className="text-2xl">
        {typeof error === 'string' && isAuthErrorCode(error)
          ? t(`error.${error}.title`)
          : t('error.Default.title')}
      </p>
      <p>
        {typeof error === 'string' && isAuthErrorCode(error)
          ? t(`error.${error}.reason`)
          : t('error.Default.reason')}
      </p>
      <div className="flex gap-4">
        <Link href={'/gallery'}>
          <Button>{t('gallery-link-button')}</Button>
        </Link>
        {(error === 'AccessDenied' || error === 'Verification') && (
          <Link href={'/login'}>
            <Button>{t('signin-button')}</Button>
          </Link>
        )}
      </div>
    </>
  )
}
