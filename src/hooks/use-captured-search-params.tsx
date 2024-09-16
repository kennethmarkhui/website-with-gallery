'use client'

import { useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

import { usePathname } from '@/i18n/routing'

// https://github.com/vercel/next.js/issues/69222#issuecomment-2324999964

const CapturedSearchParamsContext =
  createContext<ReadonlyURLSearchParams | null>(null)

type Props = {
  children: React.ReactNode
}

const CapturedSearchParamsProvider = ({ children }: Props) => {
  const searchParams = useSearchParams()
  const [capturedSearchParams, setCapturedSearchParams] = useState(searchParams)
  const pathname = usePathname()

  useEffect(() => {
    // check whether this is an intercepted route
    const isIntercepted = pathname.startsWith('/gallery/image')

    if (!isIntercepted) {
      setCapturedSearchParams(searchParams)
    }
  }, [searchParams, pathname])

  return (
    <CapturedSearchParamsContext.Provider value={capturedSearchParams}>
      {children}
    </CapturedSearchParamsContext.Provider>
  )
}

const useCapturedSearchParams = () => {
  const searchParams = useContext(CapturedSearchParamsContext)

  if (searchParams === null) {
    throw new Error(
      '`useCapturedSearchParams` must be used within a `CapturedSearchParamsProvider`'
    )
  }

  return searchParams
}

export { CapturedSearchParamsProvider, useCapturedSearchParams }
