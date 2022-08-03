// Use type safe message keys with `next-intl`
type Messages = typeof import('./intl/en.json')
declare interface IntlMessages extends Messages {}
