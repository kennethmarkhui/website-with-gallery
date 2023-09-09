import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { animated } from '@react-spring/web'
import { HiX } from 'react-icons/hi'
import { FaSpinner } from 'react-icons/fa'

import { fetchItem } from 'pages/api/gallery/[id]'
import useImageViewer from 'hooks/gallery/useImageViewer'

interface ImagePageProps {
  id: string
  src: string
  width: number
  height: number
}

const AnimatedImage = animated(Image)
const AnimatedFaSpinner = animated(FaSpinner)

export const getServerSideProps: GetServerSideProps<ImagePageProps> = async ({
  params,
}: GetServerSidePropsContext) => {
  const data = await fetchItem(params?.id as string)

  // TODO: throw if no data
  return {
    props: {
      id: data?.id ?? '',
      src: data?.image?.url ?? '',
      width: data?.image?.width ?? 0,
      height: data?.image?.height ?? 0,
    },
  }
}

const ImagePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, src, width, height }): JSX.Element => {
  const router = useRouter()

  const {
    headerStyles,
    loadingStyles,
    imageStyles,
    gestures,
    handleLoadingComplete,
    handleDoubleClick,
  } = useImageViewer({ src })

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
        {...gestures()}
        onDoubleClick={handleDoubleClick}
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
          onLoadingComplete={handleLoadingComplete}
          unoptimized
        />
      </animated.main>
    </div>
  )
}
export default ImagePage
