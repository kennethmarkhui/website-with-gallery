import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { SubmitHandler, useForm } from 'react-hook-form'

import FloatingLabelInput from '@/components/FloatingLabelInput'
import Button from '@/components/Button'

// https://next-auth.js.org/configuration/pages#sign-in-page
type SignInErrorCode =
  | 'EmailCreateAccount'
  | 'EmailSignin'
  | 'SessionRequired'
  | 'Default'

interface FormProps {
  email: string
}

interface AuthSignInFormProps {
  callbackUrl?: string | string[]
  onSuccessSubmit: (email: string) => void
  error: SignInErrorCode
}

interface AuthSignInVerificationProps {
  email: string
}

const errors = {
  EmailCreateAccount: 'Could not create user in the database.',
  EmailSignin: 'Sending the e-mail verification failed.',
  SessionRequired: 'You need to be signed in.',
  Default: 'Something went wrong.',
} satisfies Record<SignInErrorCode, string>

const AuthSignInForm = ({
  callbackUrl,
  onSuccessSubmit,
  error,
}: AuthSignInFormProps): JSX.Element => {
  const {
    register,
    formState: { errors: formErrors, isSubmitting },
    handleSubmit,
    getValues,
  } = useForm<FormProps>({
    defaultValues: { email: '' },
  })

  const onSubmit: SubmitHandler<FormProps> = async ({ email }) => {
    const res = await signIn('email', {
      email,
      redirect: false,
      callbackUrl: typeof callbackUrl === 'string' ? callbackUrl : undefined,
    })
    if (res?.ok) {
      onSuccessSubmit(getValues('email'))
    }
  }
  return (
    <div className="w-full max-w-xs space-y-4">
      {typeof error === 'string' && (
        <p className="text-center text-sm text-red-500">{errors[error]}</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting} className="flex flex-col gap-6">
          <FloatingLabelInput
            id="email"
            {...register('email', {
              required: true,
              pattern: {
                value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: 'Must be an email.',
              },
            })}
            errorMessage={formErrors.email?.message}
          />
          <Button>Sign In</Button>
        </fieldset>
      </form>
    </div>
  )
}

const AuthSignInVerification = ({
  email,
}: AuthSignInVerificationProps): JSX.Element => {
  return (
    <div className="max-w-xl space-y-4 text-center">
      <h2 className="text-2xl font-bold">Check your inbox</h2>
      <p>
        We&#39;ve sent you a verification link to the email address&nbsp;
        <span className="underline">{email}</span>
      </p>
    </div>
  )
}

const AuthSignIn = (): JSX.Element => {
  const [emailValue, setEmailValue] = useState<string>()
  const { callbackUrl, error } = useRouter().query

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      {!emailValue ? (
        <AuthSignInForm
          callbackUrl={callbackUrl}
          onSuccessSubmit={(email) => {
            setEmailValue(email)
          }}
          error={error as SignInErrorCode}
        />
      ) : (
        <AuthSignInVerification email={emailValue} />
      )}
    </div>
  )
}

export default AuthSignIn
