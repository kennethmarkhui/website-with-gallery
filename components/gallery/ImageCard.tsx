import React, { useState } from 'react'
import Image from 'next/image'
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

const ImageCard = ({ photo, imageProps, wrapperProps }: ImageCardProps) => {
  const [isLoading, setIsLoading] = useState(true)

  const { width, height } = photo
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
      <Image
        src={src}
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
        unoptimized
      />
    </div>
  )
}

export default ImageCard
