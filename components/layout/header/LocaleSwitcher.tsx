import { Fragment } from 'react'
import { useRouter } from 'next/router'
import { Listbox, Transition } from '@headlessui/react'
import { HiChevronDown } from 'react-icons/hi'
import { cn } from 'lib/utils'

const LocaleSwitcher = (): JSX.Element => {
  const router = useRouter()

  const changeLocale = (locale: string) =>
    router.push(router.pathname, router.asPath, { locale })

  return (
    <Listbox onChange={(locale) => changeLocale(locale)} value={router.locale}>
      <div className="relative">
        <Listbox.Button className="relative cursor-pointer bg-white py-2 pl-3 pr-10 text-left">
          <span className="block truncate">{router.locale}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <HiChevronDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {router.locales?.map(
              (locale): JSX.Element => (
                <Listbox.Option
                  className={({ active }) =>
                    cn(
                      'cursor-pointer py-2 pl-4 pr-4 text-gray-900',
                      active && 'bg-gray-100'
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
                </Listbox.Option>
              )
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

export default LocaleSwitcher
