import { SubmitHandler, useForm } from 'react-hook-form'
import { HiMagnifyingGlass } from 'react-icons/hi2'

import { GalleryFilters } from 'types/gallery'
import FloatingLabelInput from '../FloatingLabelInput'

interface IGallerySidebar {
  setFilters: (filters: GalleryFilters) => void
}

const GallerySidebar = ({ setFilters }: IGallerySidebar): JSX.Element => {
  const { register, handleSubmit } = useForm<GalleryFilters>()

  const onSubmit: SubmitHandler<GalleryFilters> = (data) => {
    setFilters(data)
  }

  return (
    <aside className="sticky top-8 hidden h-full w-1/5 divide-y pt-4 lg:flex lg:flex-col">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FloatingLabelInput
          id="search"
          {...register('search')}
          icon={<HiMagnifyingGlass />}
        />
      </form>
    </aside>
  )
}

export default GallerySidebar
