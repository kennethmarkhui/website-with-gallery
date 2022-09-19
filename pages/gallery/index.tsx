import type { ReactElement } from 'react'
import type { GetStaticProps } from 'next'
import PhotoAlbum, { Photo } from 'react-photo-album'

import type { NextPageWithLayout } from 'pages/_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import useGallery from 'hooks/gallery/useGallery'
import { pick } from 'lib/utils'
import ImageCard from '@/components/gallery/ImageCard'

const Gallery: NextPageWithLayout = (): JSX.Element => {
  const {
    query: {
      data,
      status,
      error,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    },
  } = useGallery()

  const photos: Photo[] =
    data?.pages.flatMap(({ items }) =>
      items.map((item) => ({
        key: item.id,
        title: item.id,
        src: item.image?.url ?? '/placeholder.png',
        width: item.image?.width ?? 1665,
        height: item.image?.height ?? 2048,
      }))
    ) || []

  if (status === 'loading') {
    return <p>loading</p>
  }

  if (status === 'error' && error instanceof Error) {
    return <p>{error.message}</p>
  }

  return (
    <>
      <PhotoAlbum layout="rows" photos={photos} renderPhoto={ImageCard} />
      <button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
          ? 'Load More'
          : 'Nothing more to load'}
      </button>
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
