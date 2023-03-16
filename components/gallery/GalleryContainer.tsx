import { RenderContainerProps } from 'react-photo-album'
import { FaSpinner } from 'react-icons/fa'
import clsx from 'clsx'

import PageStatus from '../PageStatus'

interface GalleryContainerProps extends RenderContainerProps {
  isEmpty: boolean
  fetchNextPage: () => void
  isFetchingNextPage: boolean
  hasNextPage?: boolean
  isPreviousData?: boolean
}

const GalleryContainer = ({
  containerProps,
  containerRef,
  children,
  isEmpty,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  isPreviousData,
}: GalleryContainerProps): JSX.Element => {
  const { className } = containerProps
  return (
    <div
      ref={containerRef}
      {...containerProps}
      className={clsx(
        className,
        isPreviousData && 'pointer-events-none opacity-50'
      )}
    >
      {isEmpty && (
        <PageStatus
          title="No results found"
          description="Try adjusting your search or filter to find what you&#39;re
        looking for."
        />
      )}
      {!isEmpty && (
        <>
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
        </>
      )}
    </div>
  )
}

export default GalleryContainer
