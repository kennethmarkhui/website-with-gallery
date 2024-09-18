'use client'

import GallerySidebar from './gallery-sidebar'
import GalleryHeader from './gallery-header'
import useDrawer from '@/hooks/use-drawer'
import { cn } from '@/lib/utils'

export default function MainGalleryLayout({
  children,
  modal,
  params: { locale },
}: {
  children: React.ReactNode
  modal: React.ReactNode
  params: { locale: string }
}) {
  const { isOpen, openDrawer, closeDrawer } = useDrawer()

  return (
    <div className="flex min-h-screen flex-row">
      <GallerySidebar
        locale={locale}
        isOpen={isOpen}
        closeDrawer={closeDrawer}
      />
      <div
        className={cn(
          'transition-all duration-150 ease-in',
          '-ml-64 w-full lg:ml-0'
        )}
      >
        <GalleryHeader onSidebarButtonClicked={openDrawer} />
        <main
          className={cn(
            'w-full px-8 pb-8 lg:pt-8',
            'transition-all duration-150 ease-in',
            'ml-0 lg:-mt-16'
          )}
        >
          {modal}
          {children}
        </main>
      </div>
    </div>
  )
}
