import Head from 'next/head'
import { ReactElement } from 'react'
import { GetStaticProps, GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

import { pick } from 'lib/utils'
import { NextPageWithLayout } from './_app'
import Layout from '@/components/layout/Layout'

const About: NextPageWithLayout = () => {
  const t = useTranslations('about')
  const router = useRouter()

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <link
          rel="alternate"
          href="https://huichingye.vercel.app/about"
          hrefLang="x-default"
        />
        {router.locales?.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            href={`https://huichingye.vercel.app${
              locale === 'en' ? '/' : `/${locale}/`
            }about`}
            hrefLang={locale}
          />
        ))}
      </Head>
      <div className="flex flex-wrap justify-between py-8 px-0">
        <div className="m-0 p-2 lg:max-w-[66.666667%] lg:grow-0 lg:basis-4/6">
          <p className="whitespace-pre-line leading-6">{t('description')}</p>
        </div>
        <div className="m-0 max-h-full w-full max-w-full p-2 lg:max-w-[33.333333%] lg:grow-0 lg:basis-2/6">
          {/* <Image className="rounded-md shadow" src={} alt="about" /> */}
          <div className="flex h-60 w-full items-center justify-center bg-slate-500 text-white">
            IMAGE PLACEHOLDER
          </div>
        </div>
      </div>
    </>
  )
}

About.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export const getStaticProps: GetStaticProps = async ({
  locale,
}: GetStaticPropsContext) => {
  return {
    props: {
      messages: pick(await import(`../intl/${locale}.json`), [
        'about',
        'navigation',
      ]),
    },
  }
}

export default About
