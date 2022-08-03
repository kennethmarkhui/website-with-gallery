import Head from 'next/head'
import { useRouter } from 'next/router'
import type { GetStaticProps, GetStaticPropsContext, NextPage } from 'next'
import { useTranslations } from 'next-intl'

import { pick } from 'lib/utils'

const Home: NextPage = () => {
  const t = useTranslations('index')
  const router = useRouter()

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
      <h1 className="text-3xl font-bold underline">{t('name')}</h1>
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
