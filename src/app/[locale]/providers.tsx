'use client'

import { useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { CapturedSearchParamsProvider } from '@/hooks/use-captured-search-params'
import { queryClient } from '@/lib/query'

interface ProviderProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProviderProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const [queryClientState] = useState(() => queryClient)

  return (
    <QueryClientProvider client={queryClientState}>
      <SessionProvider>
        <CapturedSearchParamsProvider>{children}</CapturedSearchParamsProvider>
      </SessionProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
