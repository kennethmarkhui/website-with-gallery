import React, { useState } from 'react'
import Image, { ImageLoaderProps } from 'next/legacy/image'
import { Photo, PhotoProps } from 'react-photo-album'

export interface ExtendedPhoto extends Photo {
  name: string
  storage: string
  category: string
  publicId: string
}

type ImageCardProps = PhotoProps<ExtendedPhoto> & {
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>
}

// fallback placeholder
// overrides the default loader defined in the images section of next.config.js.
// https://nextjs.org/docs/api-reference/next/image#loader
const fallbackLoader = ({ src }: ImageLoaderProps) => src

const ImageCard = ({ photo, imageProps, wrapperProps }: ImageCardProps) => {
  const [isLoading, setIsLoading] = useState(true)

  const { width, height, publicId } = photo
  const { src, alt, title, style, sizes, className, onClick } = imageProps
  const { style: wrapperStyle, ...restWrapperProps } = wrapperProps ?? {}

  return (
    <div
      className={`${
        isLoading && 'animate-pulse '
      }relative group cursor-pointer overflow-hidden rounded bg-gray-200`}
      style={{
        width: style.width,
        padding: style.padding,
        marginBottom: style.marginBottom,
        ...wrapperStyle,
      }}
      {...restWrapperProps}
    >
      {/* TODO make this work with the new Next13 Image */}
      <Image
        loader={publicId === '' ? fallbackLoader : undefined}
        src={publicId || src}
        alt={alt}
        title={title}
        sizes={sizes}
        width={width}
        height={height}
        className={
          className +
          `${
            isLoading
              ? ' scale-110 blur-2xl grayscale'
              : ' scale-100 blur-0 grayscale-0'
          } duration-700 ease-in-out`
        }
        onLoadingComplete={() => setIsLoading(false)}
        onClick={onClick}
        unoptimized={publicId === ''}
      />
    </div>
  )
}

export default ImageCard
