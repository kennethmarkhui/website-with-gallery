import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  openFrom?: 'top' | 'left' | 'right' | 'bottom'
}

const enterFrom = {
  top: '-translate-y-full',
  right: 'translate-x-full',
  left: '-translate-x-full',
  bottom: 'translate-y-full',
} as const

const Drawer = ({
  isOpen,
  onClose,
  children,
  openFrom = 'top',
}: DrawerProps): JSX.Element => {
  const isX = openFrom === 'left' || openFrom === 'right'

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom={`opacity-0 ${
            // https://tailwindcss.com/docs/content-configuration#dynamic-class-names
            openFrom === 'bottom' ? 'bottom-0' : `${openFrom}-0`
          }`}
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={`fixed flex max-w-full ${
                openFrom === 'bottom' ? 'bottom-0' : `${openFrom}-0`
              }`}
            >
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom={enterFrom[openFrom]}
                enterTo={isX ? 'translate-x-0' : 'translate-y-0'}
                leave="transform transition ease-in-out duration-300"
                leaveFrom={isX ? 'translate-x-0' : 'translate-y-0'}
                leaveTo={enterFrom[openFrom]}
              >
                <Dialog.Panel
                  className={`flex w-screen transform bg-white text-left align-middle shadow-xl transition-all${
                    isX ? ' h-screen max-w-sm' : ' h-fit max-h-[85vh]'
                  }`}
                >
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
export default Drawer
