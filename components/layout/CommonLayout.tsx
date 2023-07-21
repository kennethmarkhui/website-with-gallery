import Head from 'next/head'

interface CommonLayoutProps {
  title: string
  children: React.ReactNode
}

const CommonLayout = ({ title, children }: CommonLayoutProps) => {
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

export default CommonLayout
