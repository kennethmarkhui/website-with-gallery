import { ReactElement, useMemo, useState } from 'react'
import type { GetServerSideProps } from 'next'
import PhotoAlbum from 'react-photo-album'
import { dehydrate, QueryClient } from '@tanstack/react-query'

import type { GalleryFilters, GalleryResponse } from 'types/gallery'
import type { NextPageWithLayout } from 'pages/_app'
import { fetchItems, GALLERY_LIMIT } from 'pages/api/gallery'
import { fetchCategories } from 'pages/api/gallery/category'
import GalleryLayout from '@/components/layout/GalleryLayout'
import ImageCard, { ExtendedPhoto } from '@/components/gallery/ImageCard'
import ImageViewerModal from '@/components/gallery/ImageViewerModal'
import Sidebar from '@/components/gallery/Sidebar'
import GalleryContainer from '@/components/gallery/GalleryContainer'
import useGallery from 'hooks/gallery/useGallery'
import { isValidRequest, pick, removeEmptyObjectFromArray } from 'lib/utils'

const PHOTOALBUM_TARGET_ROW_HEIGHT = 200

const Gallery: NextPageWithLayout = (): JSX.Element => {
  const [modalData, setModalData] = useState<ExtendedPhoto>()

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useGallery()

  const photos: ExtendedPhoto[] = useMemo(
    () =>
      data?.pages.flatMap(({ items }) =>
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
    [data]
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
    <>
      <Sidebar />

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
    </>
  )
}

Gallery.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
}) => {
  const queryClient = new QueryClient()

  if (
    !isValidRequest<GalleryFilters>(query, ['search', 'categories', 'orderBy'])
  ) {
    return { redirect: { destination: '/gallery', permanent: false } }
  }
  const queryKey = removeEmptyObjectFromArray(['gallery', query])

  try {
    await queryClient.fetchInfiniteQuery<GalleryResponse>(
      queryKey,
      () =>
        fetchItems({ nextCursor: '0', ...query }).then((value) => ({
          items: value,
          nextCursor:
            // TODO: FIX to maybe return undefined if length === limit and there are no further items to load,
            // because currently it sets hasNextPage to true even if there are no more to load.
            // also in pages/api/gallery response
            value.length === GALLERY_LIMIT
              ? value[GALLERY_LIMIT - 1].id
              : undefined,
        })),
      {
        getNextPageParam: ({ nextCursor }) => nextCursor,
      }
    )
    await queryClient.fetchQuery(['categories'], () => fetchCategories())
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

export default Gallery
