import { useState } from 'react'
import Image, { ImageLoaderProps } from 'next/image'
import { Photo, RenderPhotoProps } from 'react-photo-album'

import { cn } from 'lib/utils'

export const cloudinaryLoader = ({
  src,
  width,
  quality,
}: ImageLoaderProps): string => {
  const { origin, pathname } = new URL(src)
  // Demo: https://res.cloudinary.com/demo/image/upload/w_300,c_limit,q_auto/turtles.jpg
  const params = ['f_auto', 'c_limit', 'w_' + width, 'q_' + (quality || 'auto')]
  // https://res.cloudinary.com/<cloud_name>/<asset_type>/<delivery_type>/<transformations>/<version>/<public_id_full_path>.<extension>
  let newPathname = pathname.split('/')
  newPathname.splice(4, 0, params.join(','))

  return origin + newPathname.join('/')
}

const ImageCard = ({
  photo,
  imageProps,
  wrapperStyle,
}: RenderPhotoProps<Photo>) => {
  const [isLoading, setIsLoading] = useState(true)

  const { width, height } = photo
  const { src, alt, title, sizes, className, onClick } = imageProps

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded bg-gray-200',
        isLoading && 'animate-pulse'
      )}
      style={wrapperStyle}
    >
      <Image
        loader={cloudinaryLoader}
        src={src || '/placeholder.png'}
        alt={alt}
        title={title}
        sizes={sizes}
        width={width || 1665}
        height={height || 2048}
        quality={50}
        className={cn(
          'duration-700 ease-in-out',
          isLoading
            ? 'scale-110 blur-2xl grayscale'
            : 'scale-100 blur-0 grayscale-0',
          className
        )}
        onLoadingComplete={() => setIsLoading(false)}
        onClick={onClick}
        unoptimized={src === ''}
      />
    </div>
  )
}

export default ImageCard
