import { defineRouting } from 'next-intl/routing'

export const languages = [
  { name: 'English', code: 'en' },
  { name: 'Chinese', code: 'zh' },
]

export const i18n = defineRouting({
  locales: languages.map(({ code }) => code),
  defaultLocale: languages[0].code,
  localePrefix: 'as-needed',
})
