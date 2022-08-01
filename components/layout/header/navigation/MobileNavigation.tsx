import { Fragment, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Dialog, Transition } from '@headlessui/react'
import { HiMenu, HiX } from 'react-icons/hi'

import type { IMainHeader } from '../MainHeader'

const MobileNavigation = ({ items }: { items: IMainHeader[] }): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }
  return (
    <>
      <button className="sm:hidden" onClick={openModal}>
        <HiMenu />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto sm:hidden"
          onClose={closeModal}
        >
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative flex h-screen w-full transform overflow-hidden bg-white shadow-xl transition-all">
                  <ul className="m-auto flex flex-col space-y-3">
                    {items.map((item) => (
                      <li
                        className={`${
                          router.asPath === item.path ? 'font-black' : ''
                        } capitalize`}
                        key={item.name}
                        onClick={closeModal}
                      >
                        <Link href={item.path}>
                          <a className="text-3xl">{item.name}</a>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="absolute right-12 top-8 flex">
                    <button type="button" onClick={closeModal}>
                      <HiX />
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileNavigation
