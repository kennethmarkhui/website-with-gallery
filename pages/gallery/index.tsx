import { useMemo, useState } from 'react'
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { RowsPhotoAlbum, Photo } from 'react-photo-album'
import { dehydrate, QueryClient } from '@tanstack/react-query'

import { fetchItems } from 'pages/api/gallery'
import { fetchCategories } from 'pages/api/gallery/category'
import GalleryLayout from '@/components/layout/GalleryLayout'
import ImageCard from '@/components/gallery/ImageCard'
import ImageViewerModal from '@/components/gallery/ImageViewerModal'
import GalleryContainer from '@/components/gallery/GalleryContainer'
import useCursorGallery from 'hooks/gallery/useCursorGallery'
import useUrlGalleryFilters from 'hooks/gallery/useUrlGalleryFilters'
import { pick } from 'lib/utils'
import { GalleryOffsetQuerySchema } from 'lib/validations'

import 'react-photo-album/rows.css'

const PHOTOALBUM_TARGET_ROW_HEIGHT = 200

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
}) => {
  const queryClient = new QueryClient()

  const parsedQuery = GalleryOffsetQuerySchema.omit({ page: true }).safeParse(
    query
  )
  if (!parsedQuery.success) {
    return { notFound: true }
  }

  await queryClient.fetchInfiniteQuery({
    queryKey: ['gallery', 'cursor', parsedQuery.data] as const,
    queryFn: ({ queryKey }) => fetchItems(queryKey[2]),
    initialPageParam: '0',
  })
  await queryClient.fetchQuery({
    queryKey: ['categories'] as const,
    queryFn: () => fetchCategories(),
  })

  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), [
        'gallery',
        'form',
      ]),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  }
}

const Gallery = (): JSX.Element => {
  const t = useTranslations('gallery')
  const [modalData, setModalData] = useState<Photo>()
  const router = useRouter()

  const handleOpenModal = (data: Photo) => {
    setModalData(data)
    router.push(
      { pathname: router.pathname, query: filters },
      { pathname: `${router.pathname}/${data.title}` },
      { shallow: true }
    )
  }

  const handleCloseModal = () => {
    setModalData(undefined)
    router.push({ pathname: router.pathname, query: filters }, undefined, {
      shallow: true,
    })
  }

  const { filters } = useUrlGalleryFilters({
    mode: 'cursor',
    query: router.query,
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
    <GalleryLayout title={t('title')} description={t('description')}>
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
          handleOpenModal(photo)
        }}
      />

      {modalData && (
        <ImageViewerModal data={modalData} close={handleCloseModal} />
      )}
    </GalleryLayout>
  )
}

export default Gallery
