import { useEffect } from 'react'
import Router from 'next/router'
import NProgress from 'nprogress'

export const NProgressBar = (): JSX.Element => {
  useEffect(() => {
    let timer: NodeJS.Timeout

    NProgress.configure({ showSpinner: false })

    const handleStart = () => {
      timer = setTimeout(NProgress.start, 100)
    }

    const handleStop = () => {
      clearTimeout(timer)
      NProgress.done()
    }

    Router.events.on('routeChangeStart', handleStart)
    Router.events.on('routeChangeComplete', handleStop)
    Router.events.on('routeChangeError', handleStop)

    return () => {
      Router.events.off('routeChangeStart', handleStart)
      Router.events.off('routeChangeComplete', handleStop)
      Router.events.off('routeChangeError', handleStop)
    }
  }, [])

  return <></>
}
