import type { AppProps } from 'next/app'
import { NextIntlProvider } from 'next-intl'

import '../styles/globals.css'
import Layout from '@/components/layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextIntlProvider messages={pageProps.messages}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </NextIntlProvider>
  )
}

export default MyApp
