import { useRef } from 'react'
import Image from 'next/image'
import { animated } from '@react-spring/web'
import { HiX } from 'react-icons/hi'
import { FaSpinner } from 'react-icons/fa'
import { Dialog } from '@headlessui/react'
import { Photo } from 'react-photo-album'

import useImageViewer from 'hooks/gallery/useImageViewer'

const AnimatedImage = animated(Image)
const AnimatedFaSpinner = animated(FaSpinner)

// taken from https://github.com/rkusa/react-image-viewer-hook with some changes

interface ImageViewerModalProps {
  data: Photo
  close: () => void
}

const ImageViewerModal = ({
  data,
  close,
}: ImageViewerModalProps): JSX.Element => {
  const dialogInitialFocusRef = useRef(null)

  const {
    isClosing,
    backdropStyles,
    headerStyles,
    loadingStyles,
    imageStyles,
    gestures,
    handleLoadingComplete,
    handleDoubleClick,
    handleClose,
  } = useImageViewer({ src: data.src, close: close })

  return (
    <Dialog
      open={!!data}
      aria-label="image viewer"
      className="fixed inset-0 z-50 flex overflow-hidden"
      initialFocus={dialogInitialFocusRef}
      onClose={handleClose}
    >
      {/* BACKDROP */}
      <animated.div
        className="fixed inset-0"
        style={{
          ...backdropStyles,
          pointerEvents: isClosing ? 'none' : 'auto',
        }}
      ></animated.div>

      {/* HEADER */}
      <animated.header
        className="fixed left-0 top-0 z-50"
        style={headerStyles}
        aria-hidden="true"
      >
        <p className="fixed left-4 top-4 flex items-center justify-center rounded border-none bg-black/30 p-2 text-white">
          {data.title}
        </p>

        <button
          ref={dialogInitialFocusRef}
          aria-label="close image viewer"
          className="fixed right-4 top-4 flex h-10 w-10 items-center justify-center rounded border-none bg-black/30 p-0 text-white"
          onClick={handleClose}
        >
          <HiX />
        </button>
      </animated.header>

      {/* IMAGE */}
      <animated.main
        {...gestures()}
        onDoubleClick={handleDoubleClick}
        className="absolute inset-0 shrink-0 touch-none items-center justify-center overflow-hidden"
        style={{
          display: imageStyles.display,
          x: imageStyles.h,
        }}
      >
        <AnimatedFaSpinner
          className="absolute animate-spin text-4xl text-white"
          style={loadingStyles}
          aria-hidden={true}
        />
        <AnimatedImage
          className="max-w-screen h-auto max-h-screen w-auto touch-none select-none"
          style={{
            x: imageStyles.x,
            y: imageStyles.y,
            scale: imageStyles.scale,
            opacity: imageStyles.opacity,
          }}
          src={data.src}
          alt={data.title ?? ''}
          sizes="100vw"
          width={data.width}
          height={data.height}
          draggable={false}
          onLoadingComplete={handleLoadingComplete}
          unoptimized
        />
      </animated.main>
    </Dialog>
  )
}
export default ImageViewerModal
