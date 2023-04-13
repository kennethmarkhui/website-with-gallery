import { useState } from 'react'
import Image, { ImageLoaderProps } from 'next/image'
import { Photo, RenderPhotoProps } from 'react-photo-album'

import { cn } from 'lib/utils'

export interface ExtendedPhoto extends Photo {
  name: string
  storage: string
  category: string
  publicId: string
}

type ImageCardProps = RenderPhotoProps<ExtendedPhoto>

// Taken from the legacy image, since currently the new Next13 Image does not support cloudinary loader out of the box(or maybe im wrong?).
// https://github.com/vercel/next.js/blob/f3fc9126add85cda1d58dd21a1556ee878b4117c/packages/next/client/image.tsx#L92-L102
const cloudinaryLoader = ({
  src,
  width,
  quality,
}: ImageLoaderProps): string => {
  // Demo: https://res.cloudinary.com/demo/image/upload/w_300,c_limit,q_auto/turtles.jpg
  const params = ['f_auto', 'c_limit', 'w_' + width, 'q_' + (quality || 'auto')]
  const paramsString = params.join(',') + '/'
  return `${process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_PATH}${paramsString}${src}`
}

const ImageCard = ({ photo, imageProps, wrapperStyle }: ImageCardProps) => {
  const [isLoading, setIsLoading] = useState(true)

  const { width, height, publicId } = photo
  const { src, alt, title, sizes, className, onClick } = imageProps

  return (
    <div style={wrapperStyle}>
      <div
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded bg-gray-200',
          isLoading && 'animate-pulse'
        )}
      >
        <Image
          loader={cloudinaryLoader}
          src={publicId || src}
          alt={alt}
          title={title}
          sizes={sizes}
          width={width}
          height={height}
          className={cn(
            'duration-700 ease-in-out',
            isLoading
              ? 'scale-110 blur-2xl grayscale'
              : 'scale-100 blur-0 grayscale-0',
            className
          )}
          onLoadingComplete={() => setIsLoading(false)}
          onClick={onClick}
          unoptimized={publicId === ''}
        />
      </div>
    </div>
  )
}

export default ImageCard
