import { ReactElement, useMemo, useState } from 'react'
import type { GetStaticProps } from 'next'
import PhotoAlbum from 'react-photo-album'
import { FaSpinner } from 'react-icons/fa'

import type { NextPageWithLayout } from 'pages/_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import PageStatus from '@/components/PageStatus'
import useGallery from 'hooks/gallery/useGallery'
import { pick } from 'lib/utils'
import ImageCard, { ExtendedPhoto } from '@/components/gallery/ImageCard'
import ImageViewerModal from '@/components/gallery/ImageViewerModal'
import Sidebar from '@/components/gallery/Sidebar'
import GalleryContainer from '@/components/gallery/GalleryContainer'

const Gallery: NextPageWithLayout = (): JSX.Element => {
  const [modalData, setModalData] = useState<ExtendedPhoto | null>(null)

  const {
    query: {
      data,
      status,
      error,
      isFetchingNextPage,
      fetchNextPage,
      hasNextPage,
    },
  } = useGallery()

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

  return (
    <>
      <Sidebar disabled={status !== 'success'} />

      {status === 'loading' && (
        <PageStatus>
          <FaSpinner className="h-10 w-10 animate-spin" />
        </PageStatus>
      )}
      {status === 'error' && (
        <PageStatus
          title="Something went wrong"
          description="Please try again later."
        />
      )}
      {status === 'success' && (
        <PhotoAlbum
          layout="rows"
          photos={photos}
          renderPhoto={ImageCard}
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
      )}

      {modalData && (
        <ImageViewerModal data={modalData} close={() => setModalData(null)} />
      )}
    </>
  )
}

Gallery.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
    },
  }
}

export default Gallery
