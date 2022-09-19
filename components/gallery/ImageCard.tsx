import React from 'react'
import Image from 'next/image'
import { Photo, PhotoProps } from 'react-photo-album'
import { HiPencil } from 'react-icons/hi'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

type ImageCardProps = PhotoProps<Photo> & {
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>
}

const ImageCard = ({ photo, imageProps, wrapperProps }: ImageCardProps) => {
  const { data: session } = useSession()

  const { width, height } = photo
  const { src, alt, title, style, sizes, className, onClick } = imageProps
  const { style: wrapperStyle, ...restWrapperProps } = wrapperProps ?? {}

  return (
    <div
      className="relative overflow-hidden rounded"
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
        className={className}
        onClick={onClick}
        unoptimized
      />
      {session && session.user.role === 'ADMIN' && (
        <span className="absolute right-0 top-0 flex cursor-pointer">
          <Link href={`/gallery/update/${title}`}>
            <a>
              <HiPencil />
            </a>
          </Link>
        </span>
      )}
    </div>
  )
}

export default ImageCard
