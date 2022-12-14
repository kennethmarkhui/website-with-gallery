import { ReactElement, ReactNode, useState } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { AbstractIntlMessages, NextIntlProvider } from 'next-intl'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { NProgressBar } from '@/components/NProgressBar'
import { queryClient } from 'lib/query'
import '../styles/globals.css'

// https://dev.to/carloschida/comment/1h99b
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout<
  P = {
    messages: AbstractIntlMessages | undefined
    session: Session | null | undefined
  }
> = AppProps<P> & {
  Component: NextPageWithLayout<P>
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)
  const [queryClientState] = useState(() => queryClient)

  return (
    <QueryClientProvider client={queryClientState}>
      <NextIntlProvider messages={pageProps.messages}>
        <SessionProvider session={pageProps.session}>
          {getLayout(<Component {...pageProps} />)}
          <NProgressBar />
        </SessionProvider>
      </NextIntlProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default MyApp
