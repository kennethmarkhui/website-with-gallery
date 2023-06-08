import Head from 'next/head'
import { useRouter } from 'next/router'

import MainHeader from './header/MainHeader'

interface LayoutProps {
  title?: string
  description?: string
  children: React.ReactNode
}

const Layout = ({
  title = '',
  description = '',
  children,
}: LayoutProps): JSX.Element => {
  const { asPath, locales, defaultLocale } = useRouter()

  const path = asPath === '/' ? '' : asPath

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_BASE_URL}${path}`}
          hrefLang="x-default"
        />
        {locales?.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            href={`${process.env.NEXT_PUBLIC_BASE_URL}${
              locale === defaultLocale ? '' : '/' + locale
            }${path}`}
            hrefLang={locale}
          />
        ))}
      </Head>
      <div className="mx-auto my-0 flex h-screen min-h-full w-full flex-col justify-between overflow-hidden px-12 py-4">
        <MainHeader />
        <main className="m-auto w-full max-w-5xl">{children}</main>
      </div>
    </>
  )
}

export default Layout
