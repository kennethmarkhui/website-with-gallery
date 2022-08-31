import { ReactElement, useState } from 'react'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'

import { NextPageWithLayout } from 'pages/_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import { fetchItems, OmittedItem } from 'pages/api/gallery'
import { pick } from 'lib/utils'

interface IGallery {
  data: OmittedItem[]
}

const Gallery: NextPageWithLayout<IGallery> = ({ data }): JSX.Element => {
  const [items, setItems] = useState<OmittedItem[]>(data ?? [])

  // useEffect(() => {
  //   const fetchItems = async () => {
  //     try {
  //       const res = await fetch('/api/gallery')
  //       const data = await res.json()
  //       setItems(data)
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   }

  //   fetchItems()
  // }, [])

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>itemId: {item.itemId}</li>
      ))}
    </ul>
  )
}

Gallery.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getServerSideProps: GetServerSideProps = async ({
  locale,
}: GetServerSidePropsContext) => {
  const data = await fetchItems()
  console.log(data)

  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
      data: data,
    },
  }
}

export default Gallery
