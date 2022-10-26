import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import { HiMagnifyingGlass } from 'react-icons/hi2'

import { GalleryFilters } from 'types/gallery'
import FloatingLabelInput from '../FloatingLabelInput'

const GallerySidebar = (): JSX.Element => {
  const router = useRouter()
  const { register, handleSubmit } = useForm<GalleryFilters>()

  const onSubmit: SubmitHandler<GalleryFilters> = (data) => {
    router.push(data.search !== '' ? { query: data } : router.pathname)
  }

  return (
    <aside className="sticky top-8 hidden h-full divide-y pt-4 lg:flex lg:flex-col">
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
