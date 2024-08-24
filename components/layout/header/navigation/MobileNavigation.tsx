import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Dialog, DialogPanel } from '@headlessui/react'
import { HiMenu, HiX } from 'react-icons/hi'

import type { IMainHeader } from '../MainHeader'
import { cn } from 'lib/utils'

const MobileNavigation = ({ items }: { items: IMainHeader[] }): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
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

      <Dialog
        open={isOpen}
        transition
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto sm:hidden"
        onClose={closeModal}
      >
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center">
            <DialogPanel className="ease-out duration-300 data-[closed]:opacity-0 data-[closed]:scale-95 relative flex h-screen w-full transform overflow-hidden bg-white shadow-xl transition-all">
              <ul className="m-auto flex flex-col space-y-3">
                {items.map(
                  (item): JSX.Element => (
                    <li
                      className={cn(
                        'capitalize',
                        router.asPath === item.path && 'font-black'
                      )}
                      key={item.name}
                      onClick={closeModal}
                    >
                      <Link href={item.path} className="text-3xl">
                        {item.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>

              <div className="absolute right-12 top-8 flex">
                <button type="button" onClick={closeModal}>
                  <HiX />
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default MobileNavigation
