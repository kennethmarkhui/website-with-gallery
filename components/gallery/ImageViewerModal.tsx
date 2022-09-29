import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/future/image'
import { useSession } from 'next-auth/react'
import { Dialog } from '@headlessui/react'
import { HiPencil, HiX, HiZoomIn, HiZoomOut } from 'react-icons/hi'
import { FaSpinner } from 'react-icons/fa'

import { ExtendedPhoto } from './ImageCard'

interface IImageViewerModal {
  data: ExtendedPhoto
  close: () => void
}

const ImageViewerModal = ({ data, close }: IImageViewerModal) => {
  const [loaded, setLoaded] = useState(false)
  const [isZoomedIn, setIsZoomedIn] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  // TODO drag image while zoomed in

  const zoomInHandler = () => {
    if (!imageContainerRef.current) return

    const divElement = imageContainerRef.current
    const divElementRect = divElement.getBoundingClientRect()

    const scale =
      data.width > divElementRect.width
        ? data.width / divElementRect.width
        : '1.5'

    //TODO find a better way to zoom the image
    if (!isZoomedIn) {
      divElement.animate([{ transform: `scale(${scale}` }], {
        duration: 400,
        fill: 'forwards',
        easing: 'ease-out',
      })
      setIsZoomedIn(true)
    }

    if (isZoomedIn) {
      divElement.animate(
        [
          {
            transform: `scale(1)`,
          },
        ],
        { duration: 200, easing: 'ease-out', fill: 'forwards' }
      )
      setIsZoomedIn(false)
    }
  }

  return (
    <Dialog
      as={'div'}
      className="fixed inset-0 overflow-hidden"
      open={!!data}
      onClose={close}
    >
      {/* header */}
      <header className="absolute z-10 flex w-full items-center justify-between px-6 py-3">
        <p className="rounded-xl bg-black/40 p-2 text-gray-300 backdrop-blur-md">
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
              <a className="group flex items-center justify-center rounded-xl bg-black/40 p-2 backdrop-blur-md">
                <HiPencil className="h-8 w-8 text-gray-500 group-hover:text-gray-300" />
              </a>
            </Link>
          )}
          <button
            className="group flex items-center justify-center rounded-xl bg-black/40 p-2 backdrop-blur-md"
            onClick={zoomInHandler}
          >
            {!isZoomedIn ? (
              <HiZoomIn className="h-8 w-8 text-gray-500 group-hover:text-gray-300" />
            ) : (
              <HiZoomOut className="h-8 w-8 text-gray-500 group-hover:text-gray-300" />
            )}
          </button>
          <button
            className="group flex items-center justify-center rounded-xl bg-black/40 p-2 backdrop-blur-md"
            onClick={close}
          >
            <HiX className="h-8 w-8 text-gray-500 group-hover:text-gray-300" />
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
          <div
            ref={imageContainerRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* loading state */}
            <div
              className={`${
                loaded ? 'opacity-0' : 'opacity-100'
              } absolute inset-0 flex items-center justify-center`}
            >
              <FaSpinner className="h-8 w-8 animate-spin text-gray-300" />
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
