import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

import CommonLayout from '@/components/layout/CommonLayout'
import Button from '@/components/Button'
import { pick } from 'lib/utils'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../intl/${locale}.json`), ['500']),
    },
  }
}

const Custom500 = () => {
  const t = useTranslations('500')
  const router = useRouter()

  return (
    <CommonLayout title={t('title')}>
      <div className="flex items-center divide-x text-center">
        <h1 className="pr-4 text-2xl">500</h1>
        <div className="space-y-2 pl-4">
          <p>{t('message')}</p>
          <Button onClick={() => router.push('/')}>
            {t('to-homepage-button')}
          </Button>
        </div>
      </div>
    </CommonLayout>
  )
}

export default Custom500
