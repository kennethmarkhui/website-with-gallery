import GallerySidebar from './GallerySidebar'
import GalleryHeader from './header/GalleryHeader'

interface IGalleryLayout {
  children: React.ReactNode
  withSideBar?: boolean
}

const GalleryLayout = ({
  children,
  withSideBar,
}: IGalleryLayout): JSX.Element => {
  return (
    <div className="my-0 mx-auto flex min-h-screen w-full flex-col gap-4 py-4 px-12 sm:gap-8">
      <GalleryHeader />
      <main
        className={` ${
          withSideBar ? 'max-w-screen-2xl ' : 'max-w-5xl '
        }mx-auto flex w-full gap-8`}
      >
        {withSideBar && <GallerySidebar />}
        <section className="flex-grow">{children}</section>
      </main>
    </div>
  )
}

export default GalleryLayout
