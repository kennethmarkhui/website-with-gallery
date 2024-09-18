import { notFound } from 'next/navigation'

import ImageModal from './image-modal'
import { getItem } from '@/actions/gallery'

interface ImageModalPageProps {
  params: {
    id: string
  }
}

export default async function ImageModalPage({
  params: { id },
}: ImageModalPageProps) {
  const data = await getItem(id)

  if (!data?.image) notFound()

  return (
    <ImageModal
      id={data.id}
      src={data.image.url}
      width={data.image.width}
      height={data.image.height}
    />
  )
}
