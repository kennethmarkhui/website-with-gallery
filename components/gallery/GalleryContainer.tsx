import { forwardRef } from 'react'
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
  isPlaceholderData?: boolean
}

const GalleryContainer = forwardRef<HTMLDivElement, GalleryContainerProps>(
  function GalleryContainer(
    {
      className,
      children,
      isEmpty,
      fetchNextPage,
      isFetchingNextPage,
      hasNextPage,
      isPlaceholderData,
      ...rest
    },
    ref
  ) {
    const t = useTranslations('gallery')
    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          className,
          isPlaceholderData && 'pointer-events-none opacity-50'
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
            {hasNextPage && (
              <button
                className="mt-4 flex w-full items-center justify-center rounded bg-gray-100 p-2 enabled:hover:bg-gray-200 md:p-4"
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  t('load-more')
                )}
              </button>
            )}
          </>
        )}
      </div>
    )
  }
)

export default GalleryContainer
