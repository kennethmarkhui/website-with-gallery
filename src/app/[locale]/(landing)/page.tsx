import { useTranslations } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'
import { HiPhotograph } from 'react-icons/hi'

import Animated from '@/components/animated/animated'
import LinkList, { LinkListProps } from '@/components/link-list'

export default function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale)
  const t = useTranslations('index')

  const list: LinkListProps[] = [
    { name: t('gallery'), Icon: HiPhotograph, to: '/gallery' },
    {
      name: t('github'),
      Icon: HiPhotograph,
      to: 'https://github.com/kennethmarkhui/website-with-gallery',
      newTab: true,
    },
  ]
  return (
    <>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl">
        <Animated>{t('name')}</Animated>
      </h1>
      <LinkList list={list} />
    </>
  )
}
