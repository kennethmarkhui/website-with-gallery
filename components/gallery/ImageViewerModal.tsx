import { useEffect, useRef, useState } from 'react'
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

interface IHandler {
  onDown?: (e: PointerEvent) => void
  onMove?: (e: PointerEvent) => void
  onUp?: (e: PointerEvent) => void
  onCancel?: (e: PointerEvent) => void
}

const usePointerEventHandler = <Element extends HTMLElement>(
  ref: Element | null,
  ...handlers: IHandler[]
) => {
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const onPointerDownHandler = (event: PointerEvent) => {
      console.log(event)

      setIsDragging(true)
      handlers.forEach((handler) => {
        handler.onDown && handler.onDown(event)
      })
      const currentTarget = event.currentTarget as Element
      currentTarget.setPointerCapture(event.pointerId)
    }

    const onPointerMoveHandler = (event: PointerEvent) => {
      if (isDragging && event.buttons % 2 !== 1) {
        onPointerUpHandler(event)
      }
      if (isDragging) {
        handlers.forEach((handler) => {
          handler.onMove && handler.onMove(event)
        })
      }
      const currentTarget = event.currentTarget as Element
      currentTarget.releasePointerCapture(event.pointerId)
    }

    const onPointerUpHandler = (event: PointerEvent) => {
      setIsDragging(false)
      handlers.forEach((handler) => {
        handler.onUp && handler.onUp(event)
      })
    }

    const onPointerCancelHandler = (event: PointerEvent) => {
      setIsDragging(false)
      handlers.forEach((handler) => {
        handler.onCancel && handler.onCancel(event)
      })
      const currentTarget = event.currentTarget as Element
      currentTarget.releasePointerCapture(event.pointerId)
    }

    const onBlurHandler = (event: FocusEvent) => {
      setIsDragging(false)
    }
    const onDragStartHandler = (event: DragEvent) => {
      event.preventDefault()
    }
    const onClickHandler = (event: MouseEvent) => {
      event.preventDefault()
    }

    if (ref) {
      ref.addEventListener('pointerdown', onPointerDownHandler)
      ref.addEventListener('pointermove', onPointerMoveHandler)
      ref.addEventListener('pointerup', onPointerUpHandler)
      ref.addEventListener('pointercancel', onPointerCancelHandler)
      ref.addEventListener('blur', onBlurHandler)
      ref.addEventListener('dragstart', onDragStartHandler)
      ref.addEventListener('click', onClickHandler)
    }
    return () => {
      if (ref) {
        ref.removeEventListener('pointerdown', onPointerDownHandler)
        ref.removeEventListener('pointermove', onPointerMoveHandler)
        ref.removeEventListener('pointerup', onPointerUpHandler)
        ref.removeEventListener('pointercancel', onPointerCancelHandler)
        ref.removeEventListener('blur', onBlurHandler)
        ref.removeEventListener('dragstart', onDragStartHandler)
        ref.removeEventListener('click', onClickHandler)
      }
    }
  }, [ref, isDragging, handlers])
}

const ImageViewerModal = ({ data, close }: IImageViewerModal) => {
  const [loaded, setLoaded] = useState(false)
  const [isZoomedIn, setIsZoomedIn] = useState(false)
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0, 0,
  ])
  const [cumulativeTranslate, setCumulativeTranslate] = useState<
    [number, number]
  >([0, 0])
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  // TODO drag image while zoomed in

  const zoomInHandler = () => {
    if (!imageContainerRef.current) return

    const imageContainerElement = imageContainerRef.current
    const imgElement = imageContainerElement.querySelector('img')

    const imageContainerElementRect =
      imageContainerElement.getBoundingClientRect()

    const scale =
      data.width > imageContainerElementRect.width
        ? data.width / imageContainerElementRect.width
        : '1.5'

    //TODO find a better way to zoom the image
    if (!isZoomedIn && imgElement) {
      imgElement.animate([{ transform: `scale(${scale}` }], {
        duration: 400,
        fill: 'forwards',
        easing: 'ease-out',
      })
      setIsZoomedIn(true)
    }

    if (isZoomedIn) {
      imageContainerElement.animate([{ transform: 'translate(0,0)' }], {
        duration: 400,
        fill: 'forwards',
        easing: 'ease-out',
      })
      if (imgElement) {
        imgElement.animate(
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
  }

  const initalImagePosition: IHandler = {
    onDown(event) {
      setInitialPosition([event.clientX, event.clientY])
    },
  }

  const dragImageHandler: IHandler = {
    onMove(event) {
      const imageContainerElement = imageContainerRef.current

      if (imageContainerElement && isZoomedIn) {
        const translate = `translate(${
          cumulativeTranslate[0] + event.clientX - (initialPosition?.at(0) ?? 0)
        }px,${
          cumulativeTranslate[1] + event.clientY - (initialPosition?.at(1) ?? 0)
        }px)`
        const ani = imageContainerElement.animate(
          [{ transform: translate, offset: 1 }],
          {
            duration: 50,
            fill: 'forwards',
          }
        )
        ani.play()
      }
    },
    onUp(event) {
      if (initialPosition) {
        if (isZoomedIn) {
          setCumulativeTranslate([
            event.clientX - initialPosition[0] + cumulativeTranslate[0],
            event.clientY - initialPosition[1] + cumulativeTranslate[1],
          ])
        }
      }
    },
  }

  usePointerEventHandler(
    imageContainerRef.current,
    dragImageHandler,
    initalImagePosition
  )

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
            className="absolute inset-0 flex touch-none items-center justify-center"
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
