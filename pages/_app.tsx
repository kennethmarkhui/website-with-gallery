import { useState } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'
import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { NProgressBar } from '@/components/NProgressBar'
import { queryClient } from 'lib/query'
import '../styles/globals.css'

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  messages: AbstractIntlMessages | undefined
  now: number
  session: Session | null | undefined
  dehydratedState: unknown
}>) {
  const [queryClientState] = useState(() => queryClient)

  return (
    <QueryClientProvider client={queryClientState}>
      <NextIntlClientProvider
        locale={useRouter().locale}
        messages={pageProps.messages}
        now={new Date(pageProps.now)}
        timeZone="HongKong"
      >
        <SessionProvider session={pageProps.session}>
          <HydrationBoundary state={pageProps.dehydratedState}>
            <Component {...pageProps} />
          </HydrationBoundary>
          <NProgressBar />
        </SessionProvider>
      </NextIntlClientProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default MyApp
