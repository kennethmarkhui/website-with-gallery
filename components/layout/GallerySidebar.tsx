import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import { HiOutlineSearch } from 'react-icons/hi'

import { GalleryFilters } from 'types/gallery'
import FloatingLabelInput from '../FloatingLabelInput'

const GallerySidebar = (): JSX.Element => {
  const router = useRouter()
  const { register, handleSubmit } = useForm<GalleryFilters>()

  const onSubmit: SubmitHandler<GalleryFilters> = (data) => {
    router.push(data.search !== '' ? { query: data } : router.pathname)
  }

  return (
    <aside className="sticky top-8 hidden h-full shrink-0 basis-1/6 divide-y pt-4 lg:flex lg:flex-col">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FloatingLabelInput
          id="search"
          {...register('search')}
          icon={<HiOutlineSearch />}
        />
      </form>
    </aside>
  )
}

export default GallerySidebar
