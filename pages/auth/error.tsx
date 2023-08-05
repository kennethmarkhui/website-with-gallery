import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

import CommonLayout from '@/components/layout/CommonLayout'
import Button from '@/components/Button'
import { pick } from 'lib/utils'

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

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['auth']),
    },
  }
}

const AuthError = (): JSX.Element => {
  const t = useTranslations('auth')
  const { query } = useRouter()
  const { error } = query

  return (
    <CommonLayout title={t('error-title')}>
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
          <Link href={'/auth/signin'}>
            <Button>{t('signin-button')}</Button>
          </Link>
        )}
      </div>
    </CommonLayout>
  )
}

export default AuthError
