import Head from 'next/head'
import { useRouter } from 'next/router'
import { GetStaticProps, GetStaticPropsContext, NextPage } from 'next'
import { HiPhotograph } from 'react-icons/hi'
import { useTranslations } from 'next-intl'

import { pick } from 'lib/utils'
import Animated from '@/components/animated/Animated'
import LinkList, { ILinkList } from '@/components/LinkList'

const Home: NextPage = () => {
  const t = useTranslations('index')
  const router = useRouter()

  const list: ILinkList[] = [
    { name: t('link1'), Icon: HiPhotograph, to: '' },
    { name: t('link2'), Icon: HiPhotograph, to: '' },
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
