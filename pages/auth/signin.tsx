import { useState } from 'react'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import CommonLayout from '@/components/layout/CommonLayout'
import FloatingLabelInput from '@/components/FloatingLabelInput'
import Button from '@/components/Button'
import {
  GalleryAuthSigninFormFieldsSchema,
  i18nErrorMap,
  isI18nGalleryFormErrorCode,
} from 'lib/validations'
import { pick } from 'lib/utils'

// https://next-auth.js.org/configuration/pages#sign-in-page
const SignInErrorCode = [
  'EmailCreateAccount',
  'EmailSignin',
  'SessionRequired',
  'Default',
] as const

type SignInErrorCode = (typeof SignInErrorCode)[number]
interface FormProps {
  email: string
}

interface AuthSignInFormProps {
  callbackUrl?: string | string[]
  onSuccessSubmit: (email: string) => void
  onError: (error: unknown) => void
  error: string
}

interface AuthSignInVerificationProps {
  email: string
}

const isSignInErrorCode = (errorCode: string): errorCode is SignInErrorCode => {
  return SignInErrorCode.includes(errorCode as SignInErrorCode)
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), [
        'auth',
        'form',
      ]),
    },
  }
}

const AuthSignInForm = ({
  callbackUrl,
  onSuccessSubmit,
  onError,
  error,
}: AuthSignInFormProps): JSX.Element => {
  const t = useTranslations('auth')
  const tForm = useTranslations('form')
  const {
    register,
    formState: { errors: formErrors, isSubmitting },
    handleSubmit,
  } = useForm<FormProps>({
    resolver: zodResolver(GalleryAuthSigninFormFieldsSchema, {
      errorMap: i18nErrorMap,
    }),
    defaultValues: { email: '' },
  })
  const formErrorsEmailMessage = formErrors.email?.message

  const onSubmit: SubmitHandler<FormProps> = async ({ email }) => {
    try {
      const res = await signIn('email', {
        email,
        redirect: false,
        callbackUrl:
          typeof callbackUrl === 'string' ? callbackUrl : '/gallery/admin',
      })
      if (res?.ok) {
        onSuccessSubmit(email)
      }
    } catch (error) {
      onError(error)
    }
  }

  return (
    <div className="w-full max-w-xs space-y-4">
      {typeof error === 'string' && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting} className="flex flex-col gap-6">
          <FloatingLabelInput
            id={t('email-input-label')}
            {...register('email')}
            errorMessage={
              typeof formErrorsEmailMessage === 'string'
                ? isI18nGalleryFormErrorCode(formErrorsEmailMessage)
                  ? tForm(`validations.${formErrorsEmailMessage}`)
                  : formErrorsEmailMessage
                : undefined
            }
          />
          <Button>{t('signin-button')}</Button>
        </fieldset>
      </form>
    </div>
  )
}

const AuthSignInVerification = ({
  email,
}: AuthSignInVerificationProps): JSX.Element => {
  const t = useTranslations('auth')
  return (
    <div className="max-w-xl space-y-4 text-center">
      <h2 className="text-2xl font-bold">{t('check-inbox')}</h2>
      <p>
        {t('check-inbox-description')}
        <span className="underline">{email}</span>
      </p>
    </div>
  )
}

const AuthSignIn = (): JSX.Element => {
  const t = useTranslations('auth')
  const [emailValue, setEmailValue] = useState<string>()
  const { pathname, query, push } = useRouter()
  const { callbackUrl, error } = query

  return (
    <CommonLayout title={t('signin-title')}>
      {!emailValue ? (
        <AuthSignInForm
          callbackUrl={callbackUrl}
          onSuccessSubmit={(email) => setEmailValue(email)}
          onError={(error) =>
            push({ pathname, query: { ...query, error: 'Default' } })
          }
          error={
            typeof error === 'string' && isSignInErrorCode(error)
              ? t(`signin-error.${error}`)
              : ''
          }
        />
      ) : (
        <AuthSignInVerification email={emailValue} />
      )}
    </CommonLayout>
  )
}

export default AuthSignIn
