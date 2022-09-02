import { ReactElement } from 'react'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import { NextPageWithLayout } from 'pages/_app'
import { fetchItems } from 'pages/api/gallery'
import { OmittedItem } from 'types/gallery'
import GalleryLayout from '@/components/layout/GalleryLayout'
import useGallery from 'hooks/use-gallery'
import { pick } from 'lib/utils'

interface IGallery {
  data: OmittedItem[]
}

const Gallery: NextPageWithLayout<IGallery> = ({ data }): JSX.Element => {
  const { items, deleteItem } = useGallery(data)
  const { data: session } = useSession()

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
        <li key={index}>
          <span>itemId: {item.itemId}</span>
          <span>name?: {item.name}</span>
          <span>storage?: {item.storage}</span>

          {session && session.user.role === 'ADMIN' && (
            <>
              <Link href={`/gallery/update/${item.itemId}`}>
                <a>update</a>
              </Link>
              <button onClick={(): Promise<void> => deleteItem(item.itemId)}>
                delete
              </button>
            </>
          )}
        </li>
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
  let data
  try {
    const resData = await fetchItems()
    data = resData
  } catch (error) {
    console.error(error)
  }

  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
      data,
    },
  }
}

export default Gallery
