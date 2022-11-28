import GalleryHeader from './header/GalleryHeader'

interface IGalleryLayout {
  children: React.ReactNode
}

const GalleryLayout = ({ children }: IGalleryLayout): JSX.Element => {
  return (
    <div className="my-0 mx-auto flex min-h-screen w-full flex-col gap-4 py-4 px-12 sm:gap-8">
      <GalleryHeader />
      <main className="mx-auto flex w-full max-w-screen-2xl gap-8">
        {children}
      </main>
    </div>
  )
}

export default GalleryLayout
