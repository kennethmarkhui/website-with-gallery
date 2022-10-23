import FloatingLabelInput from '../FloatingLabelInput'

const GallerySidebar = (): JSX.Element => {
  return (
    <aside className="sticky top-8 hidden h-full divide-y pt-4 lg:flex lg:flex-col">
      <FloatingLabelInput name="search" />
    </aside>
  )
}

export default GallerySidebar
