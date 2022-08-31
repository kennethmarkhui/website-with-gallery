import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FaSignOutAlt, FaGoogle, FaSpinner } from 'react-icons/fa'

const Auth = (): JSX.Element => {
  const { data: session, status } = useSession()
  const router = useRouter()

  // https://next-auth.js.org/getting-started/client#signout
  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: '/gallery' })
    router.push(data.url)
  }

  return (
    <div className="inline-flex items-center gap-2">
      {status === 'loading' && <FaSpinner className="animate-spin" />}
      {status === 'authenticated' && (
        <>
          <span className="hidden sm:inline">{session.user?.name}</span>
          <button onClick={handleSignOut}>
            <FaSignOutAlt />
          </button>
        </>
      )}
      {status === 'unauthenticated' && (
        <button
          className="inline-flex items-center gap-2 rounded-full border-2 border-black p-2"
          // https://next-auth.js.org/getting-started/client#signin
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
