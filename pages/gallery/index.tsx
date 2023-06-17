import { useMemo, useState } from 'react'
import type { GetServerSideProps } from 'next'
import { useTranslations } from 'next-intl'
import PhotoAlbum from 'react-photo-album'
import { dehydrate, QueryClient } from '@tanstack/react-query'

import { fetchItems } from 'pages/api/gallery'
import { fetchCategories } from 'pages/api/gallery/category'
import GalleryLayout from '@/components/layout/GalleryLayout'
import ImageCard, { ExtendedPhoto } from '@/components/gallery/ImageCard'
import ImageViewerModal from '@/components/gallery/ImageViewerModal'
import GalleryContainer from '@/components/gallery/GalleryContainer'
import useCursorGallery from 'hooks/gallery/useCursorGallery'
import useUrlGalleryFilters from 'hooks/gallery/useUrlGalleryFilters'
import { pick } from 'lib/utils'
import { GalleryOffsetQuerySchema } from 'lib/validations'

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
    return { redirect: { destination: '/gallery', permanent: false } }
  }

  try {
    await queryClient.fetchInfiniteQuery({
      queryKey: ['gallery', 'cursor', parsedQuery.data] as const,
      queryFn: ({ queryKey }) =>
        fetchItems({ nextCursor: '0', ...queryKey[2] }),
      getNextPageParam: ({ nextCursor }) => nextCursor,
    })
    await queryClient.fetchQuery({
      queryKey: ['categories'] as const,
      queryFn: () => fetchCategories(),
    })
  } catch (error) {
    return {
      redirect: { destination: '/500', permanent: false },
    }
  }

  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  }
}

const Gallery = (): JSX.Element => {
  const t = useTranslations('gallery')
  const [modalData, setModalData] = useState<ExtendedPhoto>()

  const { filters } = useUrlGalleryFilters()

  const {
    localizedData,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isPreviousData,
  } = useCursorGallery({ filters })

  const photos: ExtendedPhoto[] = useMemo(
    () =>
      localizedData.pages?.flatMap(({ items }) =>
        items.map((item) => ({
          key: item.id,
          title: item.id,
          src: item.image?.url ?? '/placeholder.png',
          width: item.image?.width ?? 1665,
          height: item.image?.height ?? 2048,
          name: item.name ?? '',
          storage: item.storage ?? '',
          category: item.category ?? '',
          publicId: item.image?.publicId ?? '',
        }))
      ) || [],
    [localizedData]
  )

  // https://github.com/igordanchenko/react-photo-album/discussions/67#discussioncomment-4561261
  const maxWidth = Math.floor(
    photos.reduce(
      (acc, { width, height }) =>
        acc + (width / height) * PHOTOALBUM_TARGET_ROW_HEIGHT * 1.2,
      Math.max(10 * (photos.length - 1), 0)
    )
  )

  return (
    <GalleryLayout title={t('title')} description={t('description')}>
      <PhotoAlbum
        layout="rows"
        photos={photos}
        renderPhoto={ImageCard}
        targetRowHeight={PHOTOALBUM_TARGET_ROW_HEIGHT}
        componentsProps={(containerWidth) =>
          containerWidth && maxWidth && maxWidth <= containerWidth
            ? { rowContainerProps: { style: { maxWidth } } }
            : {}
        }
        renderContainer={(renderContainerProps) => (
          <GalleryContainer
            {...renderContainerProps}
            isEmpty={photos.length === 0}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            isPreviousData={isPreviousData}
          />
        )}
        onClick={({ event, photo, index }) => setModalData(photo)}
      />

      {modalData && (
        <ImageViewerModal
          data={modalData}
          close={() => setModalData(undefined)}
        />
      )}
    </GalleryLayout>
  )
}

export default Gallery
