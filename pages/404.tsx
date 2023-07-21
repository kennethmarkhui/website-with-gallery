import { GetStaticProps } from 'next'
import { useTranslations } from 'next-intl'

import CommonLayout from '@/components/layout/CommonLayout'
import { pick } from 'lib/utils'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../intl/${locale}.json`), ['404']),
    },
  }
}

const Custom404 = () => {
  const t = useTranslations('404')

  return (
    <CommonLayout title={t('title')}>
      <div className="flex items-center divide-x">
        <h1 className="pr-4 text-2xl">404</h1>
        <p className="pl-4">{t('message')}</p>
      </div>
    </CommonLayout>
  )
}

export default Custom404
