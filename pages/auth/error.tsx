import { useRouter } from 'next/router'

// https://next-auth.js.org/configuration/pages#error-codes
type ErrorCode = 'Configuration' | 'AccessDenied' | 'Verification' | 'Default'

const errors = {
  Configuration: {
    title: 'Configuration Error',
    reason: 'There is a problem with the server configuration.',
  },
  AccessDenied: {
    title: 'Access Denied',
    reason: 'You must be an admin to access the page.',
  },
  Verification: {
    title: 'Verification Error',
    reason: 'The token has expired or has already been used.',
  },
  Default: {
    title: 'Authentication Error',
    reason: 'Something went wrong.',
  },
} satisfies Record<ErrorCode, Record<'title' | 'reason', string>>

const AuthError = (): JSX.Element => {
  const { error = 'Default' } = useRouter().query
  const { title, reason } = errors[error as ErrorCode]
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-2xl">{title}</p>
      <p>{reason}</p>
    </div>
  )
}

export default AuthError
