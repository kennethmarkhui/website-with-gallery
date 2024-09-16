import { useTranslations } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale)
  const t = useTranslations('about')

  return (
    <div className="flex flex-wrap justify-between px-0 py-8">
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
  )
}
