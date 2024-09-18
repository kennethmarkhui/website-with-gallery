import { notFound } from 'next/navigation'

import ImageDisplay from './image-display'
import { getItem } from '@/actions/gallery'

interface ImagePageProps {
  params: {
    id: string
  }
}

export default async function ImagePage({ params: { id } }: ImagePageProps) {
  const data = await getItem(id)

  if (!data?.image) notFound()

  return (
    <ImageDisplay
      id={id}
      src={data.image.url}
      width={data.image.width}
      height={data.image.height}
    />
  )
}
