import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

import { i18n } from '@/i18n/config'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!i18n.locales.includes(locale)) notFound()

  return {
    messages: (await import(`../i18n/messages/${locale}.json`)).default,
  }
})
