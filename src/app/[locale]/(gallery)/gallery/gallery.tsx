'use client'

import { useMemo, useRef } from 'react'
import { useLocale } from 'next-intl'
import { RowsPhotoAlbum, Photo } from 'react-photo-album'

import ImageCard from '@/components/gallery/image-card'
import GalleryContainer from '@/components/gallery/gallery-container'
import useCursorGallery from '@/hooks/use-cursor-gallery'
import useUrlGalleryFilters from '@/hooks/use-url-gallery-filters'
import { useCapturedSearchParams } from '@/hooks/use-captured-search-params'
import { usePathname, useRouter } from '@/i18n/routing'

import 'react-photo-album/rows.css'

const PHOTOALBUM_TARGET_ROW_HEIGHT = 200

export default function Gallery() {
  const router = useRouter()
  const locale = useLocale()
  const pathname = usePathname()
  const pathnameRef = useRef(pathname)

  const searchParams = useCapturedSearchParams()

  const paramsObject = Object.fromEntries(searchParams.entries())

  const handleOpenModal = (data: Photo) => {
    const url = `${pathnameRef.current}/image/${data.key}`

    router.push(url, { locale })
  }

  const { filters } = useUrlGalleryFilters({
    mode: 'cursor',
    query: paramsObject,
  })

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isPlaceholderData,
  } = useCursorGallery({ filters })

  const photos = useMemo(
    () =>
      data?.pages?.flatMap(({ items }) =>
        items.map(
          (item) =>
            ({
              key: item.id,
              title: item.id,
              src: item.image?.url ?? '',
              width: item.image?.width ?? 1665,
              height: item.image?.height ?? 2048,
            }) satisfies Photo
        )
      ) || [],
    [data]
  )
  return (
    <RowsPhotoAlbum
      photos={photos}
      render={{
        container: (renderContainerProps) => (
          <GalleryContainer
            {...renderContainerProps}
            isEmpty={photos.length === 0}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            isPlaceholderData={isPlaceholderData}
          />
        ),
        button: ({ style, ...rest }, { photo: { src } }) => (
          <button
            {...rest}
            style={{ pointerEvents: src ? 'auto' : 'none', ...style }}
          />
        ),
        image: ImageCard,
      }}
      targetRowHeight={PHOTOALBUM_TARGET_ROW_HEIGHT}
      rowConstraints={{ singleRowMaxHeight: 250 }}
      sizes={{
        /**
         * 64px = container's padding
         * 256px = sidebar
         */
        size: 'calc(100vw - 64px)',
        sizes: [
          {
            viewport: '(min-width: 1024px)',
            size: 'calc(100vw - 256px - 64px)',
          },
        ],
      }}
      onClick={({ event, photo, index }) => {
        if (!photo.src) return
        event.preventDefault()
        handleOpenModal(photo)
      }}
    />
  )
}
