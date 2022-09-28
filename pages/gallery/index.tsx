import { ReactElement, useMemo, useState } from 'react'
import type { GetStaticProps } from 'next'
import PhotoAlbum from 'react-photo-album'

import type { NextPageWithLayout } from 'pages/_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import useGallery from 'hooks/gallery/useGallery'
import { pick } from 'lib/utils'
import ImageCard, { ExtendedPhoto } from '@/components/gallery/ImageCard'
import GalleryContainer from '@/components/gallery/GalleryContainer'
import ImageViewerModal from '@/components/gallery/ImageViewerModal'

const Gallery: NextPageWithLayout = (): JSX.Element => {
  const [modalData, setModalData] = useState<ExtendedPhoto | null>(null)

  const {
    query: { data, status, error },
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

  if (status === 'loading') {
    return <p>loading</p>
  }

  if (status === 'error' && error instanceof Error) {
    return <p>{error.message}</p>
  }

  return (
    <>
      <PhotoAlbum
        layout="rows"
        photos={photos}
        renderPhoto={ImageCard}
        renderContainer={GalleryContainer}
        onClick={(event, photo, index) => setModalData(photo)}
      />
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
