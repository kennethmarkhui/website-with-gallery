import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useSpring } from '@react-spring/web'
import { useGesture } from '@use-gesture/react'

interface UseImageViewerProps {
  src: string
  close?: () => void
}

const useImageViewer = ({ src, close }: UseImageViewerProps) => {
  const [isClosing, setClosing] = useState(false)

  const isLoadingRef = useRef(false)

  const mode = useRef<null | 'dismiss' | 'pinch'>(null)

  const offset = useRef<[number, number]>([0, 0])

  const windowInnerWidthHeight =
    typeof window === 'undefined'
      ? [0, 0]
      : [window.innerWidth, window.innerHeight]

  const [[windowWidth, windowHeight], setWindowSize] = useState(
    windowInnerWidthHeight
  )

  const handleResize = () => {
    setWindowSize([window.innerWidth, window.innerHeight])
  }

  useEffect(() => {
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
    isLoadingRef.current = true
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
    const onRest = () => {
      if (onCloseCalled) {
        return
      }

      onCloseCalled = true
      close?.()
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

    isLoadingRef.current = false
    loadingApi.start({ display: 'none' })
  }, [imageApi, loadingApi, backdropApi, headerApi, isClosing, close])

  useEffect(() => {
    if (!src && !isClosing) {
      handleClose()
    }
  }, [src, handleClose, isClosing])

  const startPinch = () => {
    mode.current = 'pinch'
    headerApi.start({ display: 'none' })
  }

  const stopPinch = () => {
    offset.current = [0, 0]
    mode.current = null

    headerApi.start({ display: 'block' })
  }

  const handleDoubleClick = (e: MouseEvent) => {
    if (isClosing || isLoadingRef.current) {
      return
    }

    let img: HTMLImageElement | null = e.target as HTMLImageElement
    if (!img || !(img instanceof HTMLImageElement)) {
      img = e.currentTarget.querySelector(`img[src="${src}"]`)
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

  const handleLoadingComplete = () => {
    isLoadingRef.current = false
    loadingApi.start(() => ({ display: 'none' }))
    imageApi.start(() => {
      return {
        opacity: 1,
        scale: 1,
      }
    })
  }

  const gestures = useGesture(
    {
      onDrag({ last, active, movement: [mx, my], cancel, pinching }) {
        if (pinching) {
          cancel()
          return
        }

        if (mode.current === null) {
          mode.current = my > 0 && my > Math.abs(mx) ? 'dismiss' : null
        }

        if (close) {
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
        }

        imageApi.start((i) => {
          const h = active ? mx : 0

          switch (mode.current) {
            case 'dismiss':
              if (!close) return

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

      onPinch({
        origin: [ox, oy],
        first,
        last,
        offset: [scale],
        memo,
        cancel,
      }) {
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
    },
    {
      drag: {
        enabled: !isClosing,
      },
      pinch: {
        enabled: !isClosing,
        scaleBounds: { min: 1.0, max: Infinity },
        from: () => [imageApi.current[0].get().scale, 0],
      },
    }
  )

  return {
    isClosing,
    backdropStyles,
    headerStyles,
    loadingStyles,
    imageStyles,
    gestures,
    handleLoadingComplete,
    handleDoubleClick,
    handleClose,
  }
}

export default useImageViewer
