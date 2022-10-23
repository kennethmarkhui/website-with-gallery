import FloatingLabelInput from '../FloatingLabelInput'
import { HiMagnifyingGlass } from 'react-icons/hi2'

const GallerySidebar = (): JSX.Element => {
  return (
    <aside className="sticky top-8 hidden h-full divide-y pt-4 lg:flex lg:flex-col">
      <FloatingLabelInput name="search" icon={<HiMagnifyingGlass />} />
    </aside>
  )
}

export default GallerySidebar
