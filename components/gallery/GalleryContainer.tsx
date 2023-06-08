import { RenderContainerProps } from 'react-photo-album'
import { useTranslations } from 'next-intl'
import { FaSpinner } from 'react-icons/fa'

import PageStatus from '../PageStatus'
import { cn } from 'lib/utils'

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
  const t = useTranslations('gallery')
  const { className } = containerProps
  return (
    <div
      ref={containerRef}
      {...containerProps}
      className={cn(
        className,
        isPreviousData && 'pointer-events-none opacity-50'
      )}
    >
      {isEmpty && (
        <PageStatus
          title={t('no-results')}
          description={t('no-results-description')}
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
              t('load-more')
            ) : (
              t('no-load-more')
            )}
          </button>
        </>
      )}
    </div>
  )
}

export default GalleryContainer
