import Head from 'next/head'
import { ReactElement } from 'react'
import { GetStaticProps, GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import { HiPhotograph } from 'react-icons/hi'
import { useTranslations } from 'next-intl'

import { pick } from 'lib/utils'
import Animated from '@/components/animated/Animated'
import LinkList, { ILinkList } from '@/components/LinkList'
import Layout from '@/components/layout/Layout'
import { NextPageWithLayout } from './_app'

const Home: NextPageWithLayout = () => {
  const t = useTranslations('index')
  const router = useRouter()

  const list: ILinkList[] = [
    { name: t('link1'), Icon: HiPhotograph, to: '/gallery' },
    {
      name: t('link2'),
      Icon: HiPhotograph,
      to: 'https://github.com/kennethmarkhui/huichingye-nextjs',
      newTab: true,
    },
  ]

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <link
          rel="alternate"
          href="https://huichingye.vercel.app/"
          hrefLang="x-default"
        />
        {router.locales?.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            href={`https://huichingye.vercel.app/${
              locale === 'en' ? '' : locale
            }`}
            hrefLang={locale}
          />
        ))}
      </Head>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl">
        <Animated>{t('name')}</Animated>
      </h1>
      <LinkList list={list} />
    </>
  )
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export const getStaticProps: GetStaticProps = async ({
  locale,
}: GetStaticPropsContext) => {
  return {
    props: {
      messages: pick(await import(`../intl/${locale}.json`), [
        'index',
        'navigation',
      ]),
    },
  }
}

export default Home
