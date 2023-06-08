import { GetStaticProps } from 'next'
import { HiPhotograph } from 'react-icons/hi'
import { useTranslations } from 'next-intl'

import Layout from '@/components/layout/Layout'
import Animated from '@/components/animated/Animated'
import LinkList, { ILinkList } from '@/components/LinkList'
import { pick } from 'lib/utils'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../intl/${locale}.json`), [
        'index',
        'navigation',
      ]),
    },
  }
}

const Home = () => {
  const t = useTranslations('index')

  const list: ILinkList[] = [
    { name: t('gallery'), Icon: HiPhotograph, to: '/gallery' },
    {
      name: t('github'),
      Icon: HiPhotograph,
      to: 'https://github.com/kennethmarkhui/website-with-gallery',
      newTab: true,
    },
  ]

  return (
    <Layout title={t('title')} description={t('description')}>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl">
        <Animated>{t('name')}</Animated>
      </h1>
      <LinkList list={list} />
    </Layout>
  )
}

export default Home
