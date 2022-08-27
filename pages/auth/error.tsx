import { useRouter } from 'next/router'
import { HiOutlineBan } from 'react-icons/hi'

const AuthError = (): JSX.Element => {
  const router = useRouter()

  let errorMessage = (
    <h1 className="text-center text-xl sm:text-2xl">
      Something went wrong. Please try again later.
    </h1>
  )

  if (router.query.error === 'AccessDenied') {
    errorMessage = (
      <>
        <h1 className="inline-flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <HiOutlineBan className="h-14 w-14 shrink-0 text-red-500 sm:h-16 sm:w-16" />
          <span className="text-center text-4xl font-extrabold sm:h-16 sm:text-6xl">
            Access Denied
          </span>
        </h1>
        <p className="mt-4 text-center text-xl text-gray-500 sm:text-2xl">
          You do not have permission to login.
        </p>
      </>
    )
  }

  if (router.query.error === 'Configuration') {
    errorMessage = (
      <h1 className="text-center text-xl  sm:text-2xl">
        There is a problem with the server configuration.
      </h1>
    )
  }

  if (router.query.error === 'Verification') {
    errorMessage = (
      <h1 className="text-center text-xl  sm:text-2xl">
        Related to the Email provider. The token has expired or has already been
        used.
      </h1>
    )
  }

  if (router.query.error === 'Default') errorMessage

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-6 py-12">
      {errorMessage}

      <div className="mt-8">
        <button
          className="font-semibold underline opacity-70 hover:opacity-100"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default AuthError
