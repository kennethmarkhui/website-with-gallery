import useGallery from 'hooks/gallery/useGallery'
import { RenderContainerProps } from 'react-photo-album'
import { FaSpinner } from 'react-icons/fa'

const GalleryContainer = ({
  containerProps,
  children,
  containerRef,
}: RenderContainerProps) => {
  const {
    query: { isFetchingNextPage, hasNextPage, fetchNextPage },
  } = useGallery()
  return (
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
  )
}

export default GalleryContainer
