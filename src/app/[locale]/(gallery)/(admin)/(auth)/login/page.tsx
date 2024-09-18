'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import FloatingLabelInput from '@/components/floating-label-input'
import Button from '@/components/button'
import { usePathname, useRouter } from '@/i18n/routing'
import {
  GalleryAuthSigninFormFieldsSchema,
  i18nErrorMap,
  isI18nGalleryFormErrorCode,
} from '@/lib/validations'

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
        callbackUrl: typeof callbackUrl === 'string' ? callbackUrl : '/admin',
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

export default function AuthSignInPage() {
  const t = useTranslations('auth')
  const [emailValue, setEmailValue] = useState<string>()
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const paramsObject = Object.fromEntries(searchParams.entries())
  const { callbackUrl, error } = paramsObject

  return (
    <>
      {!emailValue ? (
        <AuthSignInForm
          callbackUrl={callbackUrl}
          onSuccessSubmit={(email) => setEmailValue(email)}
          onError={(error) => {
            const queryParams = new URLSearchParams(paramsObject)
            queryParams.append('error', 'Default')
            const queryString = queryParams.toString()
            const href = `${pathname}${queryString === '' ? '' : `?${queryString}`}`
            router.push(href, { locale })
          }}
          error={
            typeof error === 'string' && isSignInErrorCode(error)
              ? t(`signin-error.${error}`)
              : ''
          }
        />
      ) : (
        <AuthSignInVerification email={emailValue} />
      )}
    </>
  )
}
