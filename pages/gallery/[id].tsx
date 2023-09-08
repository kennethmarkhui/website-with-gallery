import { useEffect, useRef, useState, MouseEvent } from 'react'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import Image from 'next/image'
import { useSpring, animated } from '@react-spring/web'
import { useDrag, usePinch } from '@use-gesture/react'
import { HiX } from 'react-icons/hi'

import { fetchItem } from 'pages/api/gallery/[id]'
import { useRouter } from 'next/router'

const AnimatedImage = animated(Image)

export const getServerSideProps: GetServerSideProps<{
  id: string
  src: string
  publicId: string
  width: number
  height: number
}> = async ({ params }: GetServerSidePropsContext) => {
  const data = await fetchItem(params?.id as string)

  // TODO: throw if no data

  return {
    props: {
      id: data?.id ?? '',
      src: data?.image?.url ?? '',
      publicId: data?.image?.publicId ?? '',
      width: data?.image?.width ?? 0,
      height: data?.image?.height ?? 0,
    },
  }
}

// TODO: refactor duplicate codes from ImageViewerModal
const ImagePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, src, publicId, width, height }): JSX.Element => {
  const router = useRouter()

  const mode = useRef<null | 'dismiss' | 'pinch'>(null)

  const offset = useRef<[number, number]>([0, 0])

  const [[windowWidth, windowHeight], setWindowSize] = useState([
    typeof window === 'undefined' ? 0 : window.innerWidth,
    typeof window === 'undefined' ? 0 : window.innerHeight,
  ])

  const [headerStyles, headerApi] = useSpring(() => ({
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
    function handleResize() {
      setWindowSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    headerApi.start({
      display: 'block',
    })
  }, [headerApi])

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

  const onDrag = useDrag(
    ({ last, active, movement: [mx, my], cancel, pinching }) => {
      if (pinching) {
        cancel()
        return
      }

      if (mode.current === null) {
        mode.current = my > 0 && my > Math.abs(mx) ? 'dismiss' : null
      }

      imageApi.start((i) => {
        const h = active ? mx : 0

        switch (mode.current) {
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
      }
    }
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
      scaleBounds: { min: 1.0, max: Infinity },
      from: () => [imageApi.current[0].get().scale, 0],
    }
  )

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      <div className="fixed inset-0 bg-black"></div>
      <animated.header className="fixed left-0 top-0 z-50" style={headerStyles}>
        <p className="fixed left-4 top-4 flex items-center justify-center rounded border-none bg-black/30 p-2 text-white">
          {id}
        </p>
        <button
          className="fixed right-4 top-4 flex h-10 w-10 items-center justify-center rounded border-none bg-black/30 p-0 text-white"
          onClick={() => {
            router.push('/gallery')
          }}
        >
          <HiX />
        </button>
      </animated.header>
      <animated.main
        className="absolute inset-0 shrink-0 touch-none items-center justify-center overflow-hidden"
        style={{ display: imageStyles.display, x: imageStyles.h }}
        {...onDrag()}
        {...onPinch()}
        onDoubleClick={handleDoubleClick}
      >
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
          onLoadingComplete={() => {
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
    </div>
  )
}
export default ImagePage
