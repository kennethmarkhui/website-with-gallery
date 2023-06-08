import Head from 'next/head'

interface AuthLayoutProps {
  title?: string
  children: React.ReactNode
}

const AuthLayout = ({ title, children }: AuthLayoutProps) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 px-4">
        {children}
      </div>
    </>
  )
}

export default AuthLayout
