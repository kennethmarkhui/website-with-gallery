'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { animated } from '@react-spring/web'
import { HiX } from 'react-icons/hi'
import { FaSpinner } from 'react-icons/fa'
import { Dialog } from '@headlessui/react'

import useImageViewer from '@/hooks/use-image-viewer'
import { useRouter } from '@/i18n/routing'

const AnimatedImage = animated(Image)
const AnimatedFaSpinner = animated(FaSpinner)

// taken from https://github.com/rkusa/react-image-viewer-hook with some changes

export interface ImageModalProps {
  id: string
  src: string
  width: number
  height: number
}

export default function ImageModal({
  id,
  src,
  width,
  height,
}: ImageModalProps) {
  const dialogInitialFocusRef = useRef(null)
  const router = useRouter()

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
  } = useImageViewer({
    src,
    close: () => router.back(),
  })

  return (
    <Dialog
      open={!!src}
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
          {id}
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
          src={src}
          alt={id}
          sizes="100vw"
          width={width}
          height={height}
          draggable={false}
          onLoad={handleLoadingComplete}
          unoptimized
        />
      </animated.main>
    </Dialog>
  )
}
