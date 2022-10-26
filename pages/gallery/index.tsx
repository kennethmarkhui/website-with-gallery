import { ReactElement, useMemo, useState } from 'react'
import type { GetStaticProps } from 'next'
import PhotoAlbum, { RenderContainerProps } from 'react-photo-album'
import { FaSpinner } from 'react-icons/fa'

import type { NextPageWithLayout } from 'pages/_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import useGallery from 'hooks/gallery/useGallery'
import { pick } from 'lib/utils'
import ImageCard, { ExtendedPhoto } from '@/components/gallery/ImageCard'
import ImageViewerModal from '@/components/gallery/ImageViewerModal'

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

  if (status === 'loading') {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center">
        <FaSpinner className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  if (status === 'error' && error instanceof Error) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-4">
        <h1 className="text-3xl">Something went wrong</h1>
        <p>Please try again later.</p>
      </div>
    )
  }

  return (
    <>
      <PhotoAlbum
        layout="rows"
        photos={photos}
        renderPhoto={ImageCard}
        renderContainer={({
          containerProps: { style, ...containerProps },
          containerRef,
          children,
        }: RenderContainerProps<ExtendedPhoto>) => (
          <div ref={containerRef} {...containerProps}>
            {children}
            <button
              className="mt-4 flex w-full items-center justify-center rounded bg-gray-100 p-2 enabled:hover:bg-gray-200 md:p-4"
              disabled={!hasNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? (
                <FaSpinner className="animate-spin" />
              ) : hasNextPage ? (
                'Load More'
              ) : (
                'Nothing more to load'
              )}
            </button>
          </div>
        )}
        // TODO figure out a way to make the custom renderContainer to accept custom props
        // https://react-photo-album.com/examples/renderers
        // renderContainer={GalleryContainer}
        onClick={(event, photo, index) => setModalData(photo)}
      />
      {modalData && (
        <ImageViewerModal data={modalData} close={() => setModalData(null)} />
      )}
    </>
  )
}

Gallery.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout withSideBar>{page}</GalleryLayout>
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
    },
  }
}

export default Gallery
