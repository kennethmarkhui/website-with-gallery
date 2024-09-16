'use client'

import { useLocale } from 'next-intl'
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react'
import { HiChevronDown } from 'react-icons/hi'

import { cn } from '@/lib/utils'
import { i18n } from '@/i18n/config'
import { usePathname, useRouter } from '@/i18n/routing'

export default function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const changeLocale = (locale: string) => router.push(pathname, { locale })

  return (
    <Listbox onChange={(locale) => changeLocale(locale)} value={locale}>
      <div className="relative">
        <ListboxButton className="relative cursor-pointer bg-white py-2 pl-3 pr-10 text-left">
          <span className="block truncate">{locale}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <HiChevronDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>

        <ListboxOptions
          transition
          className="transition ease-in duration-100 data-[closed]:scale-95 data-[closed]:opacity-0 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          {i18n.locales.map(
            (locale): JSX.Element => (
              <ListboxOption
                className={({ focus }) =>
                  cn(
                    'cursor-pointer py-2 pl-4 pr-4 text-gray-900',
                    focus && 'bg-gray-100'
                  )
                }
                key={locale}
                value={locale}
              >
                {({ selected }): JSX.Element => (
                  <>
                    <span
                      className={cn(
                        'block truncate',
                        selected ? 'font-medium' : 'font-normal'
                      )}
                    >
                      {locale}
                    </span>
                  </>
                )}
              </ListboxOption>
            )
          )}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
