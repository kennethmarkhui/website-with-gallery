import { Fragment, useState } from 'react'
import Link from 'next/link'
import { Dialog, Transition } from '@headlessui/react'

import type { IMainHeader } from '../MainHeader'

const MobileNavigation = ({ items }: { items: IMainHeader[] }): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }
  return (
    <>
      <button className="sm:hidden" onClick={openModal}>
        O
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
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
                  <ul className="m-auto">
                    {items.map((item) => (
                      <li
                        className="capitalize"
                        key={item.name}
                        onClick={closeModal}
                      >
                        <Link href={item.path}>
                          <a>{item.name}</a>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="absolute right-0">
                    <button type="button" onClick={closeModal}>
                      X
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
