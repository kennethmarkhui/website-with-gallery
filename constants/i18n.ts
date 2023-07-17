export const LANGUAGES = [
  { name: 'English', code: 'en' },
  { name: 'Chinese', code: 'zh' },
]

// make sure next.config.js i18n has the same values
export const LOCALES = LANGUAGES.map(({ code }) => code)
export const DEFAULTLOCALE = LANGUAGES[0].code
