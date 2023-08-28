import { useEffect, useRef, useState, MouseEvent, useCallback } from 'react'
import Image from 'next/image'
import { useSpring, animated } from '@react-spring/web'
import { useDrag, usePinch } from '@use-gesture/react'
import { HiX } from 'react-icons/hi'
import { FaSpinner } from 'react-icons/fa'
import { Dialog } from '@headlessui/react'

import { ExtendedPhoto } from './ImageCard'

const AnimatedImage = animated(Image)
const AnimatedFaSpinner = animated(FaSpinner)

// taken from https://github.com/rkusa/react-image-viewer-hook with some changes

export interface ImageViewerProps {
  data: ExtendedPhoto
  close: () => void
}

const ImageViewerModal = ({ data, close }: ImageViewerProps): JSX.Element => {
  const [isClosing, setClosing] = useState(false)

  const mode = useRef<null | 'dismiss' | 'pinch'>(null)

  const offset = useRef<[number, number]>([0, 0])

  const dialogInitialFocusRef = useRef(null)

  const [[windowWidth, windowHeight], setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ])

  useEffect(() => {
    function handleResize() {
      setWindowSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [backdropStyles, backdropApi] = useSpring(() => ({
    backgroundColor: 'rgba(0, 0, 0, 0)',
  }))

  const [headerStyles, headerApi] = useSpring(() => ({
    display: 'none',
  }))

  const [loadingStyles, loadingApi] = useSpring(() => ({
    display: 'none',
  }))

  const [imageStyles, imageApi] = useSpring(() => ({
    h: 0,
    x: 0,
    y: 0,
    scale: 0.2,
    opacity: 0,
    display: 'flex',
  }))

  useEffect(() => {
    // show spinner
    loadingApi.start(() => ({
      display: 'block',
      delay: 500,
    }))

    backdropApi.start({
      backgroundColor: `rgba(0, 0, 0, 1)`,
    })

    headerApi.start({
      display: 'block',
    })
  }, [loadingApi, backdropApi, headerApi])

  const handleClose = useCallback(() => {
    if (isClosing) {
      return
    }

    setClosing(true)

    let onCloseCalled = false
    function onRest() {
      if (onCloseCalled) {
        return
      }

      onCloseCalled = true
      close()
    }

    const config = {
      mass: 0.5,
      friction: 10,
    }

    imageApi.start(() => {
      return {
        opacity: 0,
        scale: 0.2,
        x: 0,
        y: 0,
        sx: 0,
        sy: 0,
        onRest,
        config,
      }
    })

    backdropApi.start({
      backgroundColor: `rgba(0, 0, 0, 0)`,
      onRest,
      config,
    })

    headerApi.start({
      display: 'none',
    })

    loadingApi.start({ display: 'none' })
  }, [imageApi, loadingApi, backdropApi, headerApi, isClosing, close])

  useEffect(() => {
    if (!data && !isClosing) {
      handleClose()
    }
  }, [data, handleClose, isClosing])

  function startPinch() {
    mode.current = 'pinch'
    headerApi.start({ display: 'none' })
  }

  function stopPinch() {
    offset.current = [0, 0]
    mode.current = null

    headerApi.start({ display: 'block' })
  }

  function handleDoubleClick(e: MouseEvent) {
    if (isClosing) {
      return
    }

    let img: HTMLImageElement | null = e.target as HTMLImageElement
    if (!img || !(img instanceof HTMLImageElement)) {
      img = e.currentTarget.querySelector(`img[src="${data.src}"]`)
    }
    if (!img || !(img instanceof HTMLImageElement)) {
      console.warn('Failed to determine active image during double tap')
      return
    }

    imageApi.start((i, ctrl) => {
      if (!img) {
        return
      }

      if (mode.current === 'pinch') {
        stopPinch()
        return { scale: 1, x: 0, y: 0 }
      } else {
        const newScale = img.naturalWidth / img.width
        if (newScale < 1.0) {
          return
        }

        const originOffsetX = e.clientX - (windowWidth / 2 + offset.current[0])
        const originOffsetY = e.clientY - (windowHeight / 2 + offset.current[1])

        const scale = ctrl.get().scale
        const refX = originOffsetX / scale
        const refY = originOffsetY / scale

        const transformOriginX = refX * newScale - originOffsetX
        const transformOriginY = refY * newScale - originOffsetY

        offset.current[0] -= transformOriginX
        offset.current[1] -= transformOriginY

        startPinch()

        return {
          scale: newScale,
          x: offset.current[0],
          y: offset.current[1],
        }
      }
    })
  }

  const onDrag = useDrag(
    ({ last, active, movement: [mx, my], cancel, pinching }) => {
      if (pinching) {
        cancel()
        return
      }

      if (mode.current === null) {
        mode.current = my > 0 && my > Math.abs(mx) ? 'dismiss' : null
      }

      switch (mode.current) {
        case 'dismiss':
          if (last && my > 0 && my / windowHeight > 0.1) {
            handleClose()
            return
          } else {
            backdropApi.start({
              backgroundColor: `rgba(0, 0, 0, ${Math.max(
                0,
                1 - (Math.abs(my) / windowHeight) * 2
              )})`,
            })
          }

          break
      }

      imageApi.start((i) => {
        const h = active ? mx : 0

        switch (mode.current) {
          case 'dismiss':
            const y = active ? my : 0
            const scale = active
              ? Math.max(1 - Math.abs(my) / windowHeight / 2, 0.8)
              : 1
            return { h, y, scale, display: 'flex', immediate: active }

          case 'pinch':
            return {
              x: offset.current[0] + mx,
              y: offset.current[1] + my,
              display: 'flex',
              immediate: active,
            }
        }
      })

      if (last) {
        if (mode.current === 'pinch') {
          offset.current = [offset.current[0] + mx, offset.current[1] + my]
        } else {
          mode.current = null
        }

        backdropApi.start({ backgroundColor: 'rgba(0, 0, 0, 1)' })
      }
    },
    { enabled: !isClosing }
  )

  const onPinch = usePinch(
    ({ origin: [ox, oy], first, last, offset: [scale], memo, cancel }) => {
      if (mode.current !== null && mode.current !== 'pinch') {
        cancel()
        return
      }

      if (mode.current !== 'pinch') {
        startPinch()
      }

      if (first || !memo) {
        const originOffsetX = ox - (windowWidth / 2 + offset.current[0])
        const originOffsetY = oy - (windowHeight / 2 + offset.current[1])

        memo = {
          origin: {
            x: ox,
            y: oy,
          },
          offset: {
            refX: originOffsetX / scale,
            refY: originOffsetY / scale,
            x: originOffsetX,
            y: originOffsetY,
          },
        }
      }

      const transformOriginX = memo.offset.refX * scale - memo.offset.x
      const transformOriginY = memo.offset.refY * scale - memo.offset.y
      const mx = ox - memo.origin.x - transformOriginX
      const my = oy - memo.origin.y - transformOriginY

      imageApi.start(() => {
        if (last && scale <= 1.1) {
          return {
            x: 0,
            y: 0,
            scale: 1,
          }
        } else {
          return {
            h: 0,
            scale,
            x: offset.current[0] + mx,
            y: offset.current[1] + my,
            immediate: true,
          }
        }
      })

      if (last) {
        if (scale <= 1.1) {
          stopPinch()
        } else {
          offset.current = [offset.current[0] + mx, offset.current[1] + my]
        }
      }

      return memo
    },
    {
      enabled: !isClosing,
      scaleBounds: { min: 1.0, max: Infinity },
      from: () => [imageApi.current[0].get().scale, 0],
    }
  )

  return (
    <Dialog
      open={!!data}
      aria-label="image viewer"
      className="fixed inset-0 z-50 flex overflow-hidden"
      initialFocus={dialogInitialFocusRef}
      onDoubleClick={handleDoubleClick}
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
        <animated.p className="fixed left-4 top-4 flex items-center justify-center rounded border-none bg-black/30 p-2 text-white">
          {data.title}
        </animated.p>

        <animated.button
          ref={dialogInitialFocusRef}
          aria-label="close image viewer"
          className="fixed right-4 top-4 flex h-10 w-10 items-center justify-center rounded border-none bg-black/30 p-0 text-white"
          onClick={handleClose}
        >
          <HiX />
        </animated.button>
      </animated.header>

      {/* IMAGE */}
      <animated.main
        {...onDrag()}
        {...onPinch()}
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
          onLoadingComplete={() => {
            loadingApi.start(() => ({ display: 'none' }))
            imageApi.start(() => {
              return {
                opacity: 1,
                scale: 1,
              }
            })
          }}
          unoptimized
        />
      </animated.main>
    </Dialog>
  )
}
export default ImageViewerModal
