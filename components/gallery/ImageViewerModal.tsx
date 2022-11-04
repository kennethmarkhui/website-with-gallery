import { useEffect, useRef, useState, MouseEvent, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useSpring, animated } from '@react-spring/web'
import { useGesture } from '@use-gesture/react'
import { HiPencil, HiX } from 'react-icons/hi'
import { Dialog } from '@headlessui/react'

import { ExtendedPhoto } from './ImageCard'

const AnimatedImage = animated(Image)

// taken from https://github.com/rkusa/react-image-viewer-hook with some changes

export interface ImageViewerProps {
  data: ExtendedPhoto
  close: () => void
}

const ImageViewerModal = ({ data, close }: ImageViewerProps): JSX.Element => {
  const { data: session } = useSession()

  // Track whether the close animation is running. This is used to disable any interactions.
  const [isClosing, setClosing] = useState(false)

  // The current modality the image viewer is in.
  const mode = useRef<null | 'dismiss' | 'pinch'>(null)

  // Keep track of previous position changes when lifting fingers in between pinching and panning
  // an image.
  const offset = useRef<[number, number]>([0, 0])

  const dialogInitialFocusRef = useRef(null)

  // Keep track of the window size (and changes to it).
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

  // The animation for the black backdrop behind the image viewer. Used to fade the backdrop in and
  // out.
  const [backdropProps, backdropApi] = useSpring(() => ({
    backgroundColor: 'rgba(0, 0, 0, 0)',
  }))

  // The animation for all control buttons (close, next, prev). Used to hide them on enter, exit and
  // while in `pinch` mode.
  const [headerProps, headerApi] = useSpring(() => ({
    display: 'none',
  }))

  const [props, api] = useSpring(() => ({
    h: 0,
    x: 0,
    y: 0,
    scale: 0.2,
    opacity: 0,
    display: 'flex',
  }))

  // Kick off the enter animation once the viewer is first rendered.
  useEffect(() => {
    // Fly in the currently active image.
    // TODO: wait for the image being loaded?
    api.start(() => {
      return {
        opacity: 1,
        scale: 1,
      }
    })

    // Fade the backdrop to black.
    backdropApi.start({
      backgroundColor: `rgba(0, 0, 0, 1)`,
    })

    // Show the control buttons.
    headerApi.start({
      display: 'block',
    })
  }, [api, backdropApi, headerApi])

  // Close the image viewer (awaits the exit animation before actually closing the viewer).
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

    // Speed up close animation
    const config = {
      mass: 0.5,
      friction: 10,
    }

    api.start(() => {
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

    // Fade backdrop out.
    backdropApi.start({
      backgroundColor: `rgba(0, 0, 0, 0)`,
      onRest,
      config,
    })

    // Hide the control buttons.
    headerApi.start({
      display: 'none',
    })
  }, [api, backdropApi, headerApi, isClosing, close])

  //   Close the viewer if image have been removed
  useEffect(() => {
    if (!data && !isClosing) {
      handleClose()
    }
  }, [data, handleClose, isClosing])

  function startPinch() {
    mode.current = 'pinch'
    // Hide the buttons while pinching.
    headerApi.start({ display: 'none' })
  }

  function stopPinch() {
    // When the image is reset back to the center and initial scale, also end the `pinch` mode.
    offset.current = [0, 0]
    mode.current = null

    // Show the buttons again.
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

    api.start((i, ctrl) => {
      // make typescript happy
      if (!img) {
        return
      }

      if (mode.current === 'pinch') {
        stopPinch()
        return { scale: 1, x: 0, y: 0 }
      } else {
        // Scale the image to its actual size.
        const newScale = img.naturalWidth / img.width
        if (newScale < 1.0) {
          // No need to scale if the image is smaller than the screen size.
          return
        }

        // Calculate the image movement to zoom at the location the user tapped clicked at.
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

  // Setup all gestures.
  const bind = useGesture(
    {
      onDrag({ last, active, movement: [mx, my], cancel, pinching }) {
        // When pinching, the `onPinch` handles moving the image around.
        if (pinching) {
          cancel()
          return
        }

        // Determine the current mode based on the drag amount and direction.
        if (mode.current === null) {
          mode.current = my > 0 && my > Math.abs(mx) ? 'dismiss' : null
        }

        switch (mode.current) {
          case 'dismiss':
            // Close the image viewer is the image got released after dragging it at least 10% down.
            if (last && my > 0 && my / windowHeight > 0.1) {
              handleClose()
              return
            }
            // Fade out the backdrop depending on the drag distance otherwise.
            else {
              backdropApi.start({
                backgroundColor: `rgba(0, 0, 0, ${Math.max(
                  0,
                  1 - (Math.abs(my) / windowHeight) * 2
                )})`,
              })
            }

            break
        }

        // Update the animation state of all images.
        api.start((i) => {
          // Calculate the new horizontal position.
          const h = active ? mx : 0

          switch (mode.current) {
            // While dismissing (sliding down), animate both the position and scale (scale down)
            // depending on how far the image is dragged away from the center.
            case 'dismiss':
              const y = active ? my : 0
              const scale = active
                ? Math.max(1 - Math.abs(my) / windowHeight / 2, 0.8)
                : 1
              return { h, y, scale, display: 'flex', immediate: active }

            // When lifting a pinch and continuing to track the image with one touch point, animate
            // the position of the image accordingly.
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
            // Keep track of the current drag position. Don't reset the mode so that the user can
            // continue dragging the image with another drag or pinch gesture.
            offset.current = [offset.current[0] + mx, offset.current[1] + my]
          } else {
            // Reset the mode.
            mode.current = null
          }

          // Reset the backdrop back to being fully black.
          backdropApi.start({ backgroundColor: 'rgba(0, 0, 0, 1)' })
        }
      },

      onPinch({
        origin: [ox, oy],
        first,
        last,
        offset: [scale],
        memo,
        cancel,
      }) {
        // The pinch mode can only be initiated from no active mode, while starting to slide, or by
        // continuing and still active pinch.
        if (mode.current !== null && mode.current !== 'pinch') {
          cancel()
          return
        }

        if (mode.current !== 'pinch') {
          startPinch()
        }

        // Keep track of the offset when first starting to pinch.
        if (first || !memo) {
          // This is the offset between the image's origin (in its center) and the pinch origin.
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

        // Calculate the current drag x and y movements taking the pinch origin into account (when
        // pinching outside of the center of the image, the image needs to be moved accordingly to
        // scale below the pinch origin).
        const transformOriginX = memo.offset.refX * scale - memo.offset.x
        const transformOriginY = memo.offset.refY * scale - memo.offset.y
        const mx = ox - memo.origin.x - transformOriginX
        const my = oy - memo.origin.y - transformOriginY

        // Update the animation state of all images.
        api.start(() => {
          // If the user stopped the pinch gesture and the scale is below 110%, reset the image back
          // to the center and to fit the screen.
          if (last && scale <= 1.1) {
            return {
              x: 0,
              y: 0,
              scale: 1,
            }
          }
          // Otherwise, update the scale and position of the image accordingly.
          else {
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
            // Keep track of the current drag position so that the user can continue manipulating
            // the current position in a follow-up drag or pinch.
            offset.current = [offset.current[0] + mx, offset.current[1] + my]
          }
        }

        return memo
      },
    },
    {
      drag: {
        enabled: !isClosing,
      },
      pinch: {
        enabled: !isClosing,
        scaleBounds: { min: 1.0, max: Infinity },
        from: () => [api.current[0].get().scale, 0],
      },
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
          ...backdropProps,
          pointerEvents: isClosing ? 'none' : 'auto',
        }}
      ></animated.div>

      {/* HEADER */}
      <animated.header
        className="fixed top-0 left-0 z-50"
        style={{ ...headerProps }}
        aria-hidden="true"
      >
        <animated.p className="fixed top-4 left-4 flex items-center justify-center rounded border-none bg-black/30 p-2 text-white">
          {data.title}
        </animated.p>
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
            aria-label="edit image"
            className="fixed top-4 right-16 flex h-10 w-10 cursor-pointer items-center justify-center rounded border-none bg-black/30 p-0 text-white"
          >
            <HiPencil />
          </Link>
        )}
        <animated.button
          ref={dialogInitialFocusRef}
          aria-label="close image viewer"
          className="fixed top-4 right-4 flex h-10 w-10 items-center justify-center rounded border-none bg-black/30 p-0 text-white"
          onClick={handleClose}
        >
          <HiX />
        </animated.button>
      </animated.header>

      {/* IMAGE */}
      <animated.main
        {...bind()}
        className="absolute inset-0 shrink-0 touch-none items-center justify-center overflow-hidden"
        style={{
          display: props.display,
          x: props.h,
        }}
      >
        <AnimatedImage
          className="max-w-screen h-auto max-h-screen w-auto touch-none select-none"
          style={{
            x: props.x,
            y: props.y,
            scale: props.scale,
            opacity: props.opacity,
          }}
          src={data.src}
          alt={data.title ?? ''}
          sizes="100vw"
          width={data.width}
          height={data.height}
          draggable={false}
          unoptimized
        />
      </animated.main>
    </Dialog>
  )
}
export default ImageViewerModal
