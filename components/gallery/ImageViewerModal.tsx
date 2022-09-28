import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/future/image'
import { useSession } from 'next-auth/react'
import { Dialog } from '@headlessui/react'
import { HiPencil, HiX, HiZoomIn } from 'react-icons/hi'
import { FaSpinner } from 'react-icons/fa'

import { ExtendedPhoto } from './ImageCard'

interface IImageViewerModal {
  data: ExtendedPhoto
  close: () => void
}

const ImageViewerModal = ({ data, close }: IImageViewerModal) => {
  const [loaded, setLoaded] = useState(false)
  const { data: session } = useSession()

  return (
    <Dialog
      as={'div'}
      className="fixed inset-0 overflow-hidden"
      open={!!data}
      onClose={close}
    >
      {/* header */}
      <header className="absolute z-10 flex w-full items-center justify-between px-6 py-3">
        <p className="bg-black/40 p-1 text-gray-300 backdrop-blur-md">
          {data.title}
        </p>
        {/* buttons */}
        <div className="flex flex-row items-center gap-4">
          {session && session.user.role === 'ADMIN' && (
            <Link
              href={{
                pathname: `/gallery/update/${data.title}`,
                query: {
                  data: JSON.stringify({
                    name: data.name,
                    storage: data.storage,
                    category: data.category,
                    image: {
                      url: data.src, // if no image this should be the placeholder image
                      publicId: data.publicId,
                    },
                  }),
                },
              }}
            >
              <a className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 backdrop-blur-md">
                <HiPencil className="text-gray-500 hover:text-gray-300" />
              </a>
            </Link>
          )}
          {/* TODO ZOOM FUNCTIONALITY */}
          <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 backdrop-blur-md">
            <HiZoomIn className="text-gray-500 hover:text-gray-300" />
          </button>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 backdrop-blur-md"
            onClick={close}
          >
            <HiX className="text-gray-500 hover:text-gray-300" />
          </button>
        </div>
      </header>
      {/* footer */}
      {/* <footer className="absolute z-10 grid place-items-center text-center inset-inline-0 block-end-0">
          <div className="absolute block-end-0">
            <p className="mlb-0 inline-end-0">link</p>
          </div>
          <div className="grid grid-cols-[auto_auto] grid-rows-[auto_fit-content] place-items-center gap-8">
            <h1>h1</h1>
            <p>p</p>
          </div>
          <div></div>
        </footer> */}
      <main className="fixed inset-0 overflow-hidden bg-black">
        <div className="absolute inset-0 h-screen">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* loading state */}
            <div
              className={`${
                loaded ? 'opacity-0' : 'opacity-100'
              } absolute inset-0 flex items-center justify-center`}
            >
              <FaSpinner className="animate-spin text-gray-300" />
            </div>
            <Image
              src={data.src}
              width={data.width}
              height={data.height}
              quality={100}
              alt="test"
              className="max-h-screen max-w-full object-contain"
              onLoadingComplete={(result) => {
                setLoaded(true)
              }}
              priority
              unoptimized
            />
          </div>
        </div>
      </main>
    </Dialog>
  )
}

export default ImageViewerModal
