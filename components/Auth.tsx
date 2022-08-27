import { signIn, signOut, useSession } from 'next-auth/react'
import { FaSignOutAlt, FaGoogle, FaSpinner } from 'react-icons/fa'

const Auth = (): JSX.Element => {
  const { data: session, status } = useSession()

  return (
    <div className="inline-flex items-center gap-2">
      {status === 'loading' && <FaSpinner className="animate-spin" />}
      {status === 'authenticated' && (
        <>
          <span className="hidden sm:inline">{session.user?.name}</span>
          <button onClick={() => signOut()}>
            <FaSignOutAlt />
          </button>
        </>
      )}
      {status === 'unauthenticated' && (
        <button
          className="inline-flex items-center gap-2 rounded-full border-2 border-black p-2"
          onClick={() => signIn('google')}
        >
          <FaGoogle />
          <span className="hidden sm:inline">Sign in with Google</span>
        </button>
      )}
    </div>
  )
}

export default Auth
