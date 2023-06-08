import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { FaSignOutAlt } from 'react-icons/fa'

import Button from './Button'

const Profile = (): JSX.Element => {
  const { data: session, status } = useSession()
  const t = useTranslations('auth')
  const router = useRouter()

  // https://next-auth.js.org/getting-started/client#signout
  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: '/gallery' })
    router.push(data.url)
  }

  return (
    <div className="text-center">
      {status === 'authenticated' && (
        <>
          <h3 className="text-xl font-bold tracking-tight">
            {session.user.email?.split('@')[0]}
          </h3>
          <p className="text-sm font-light text-gray-500">
            {session.user.role}
          </p>
          <div className="mt-5">
            <Button onClick={handleSignOut} fullWidth>
              <FaSignOutAlt />
              <span className="ml-2">{t('logout')}</span>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default Profile
