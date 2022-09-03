import type { ReactElement } from 'react'
import type { GetStaticProps } from 'next'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import type { NextPageWithLayout } from 'pages/_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import { useDelete, useGallery } from 'hooks/gallery'
import { pick } from 'lib/utils'

const Gallery: NextPageWithLayout = (): JSX.Element => {
  const { data: items, status, error } = useGallery()
  const { mutate } = useDelete()

  const { data: session } = useSession()

  if (status === 'loading') {
    return <p>loading</p>
  }

  if (status === 'error' && error instanceof Error) {
    return <p>{error.message}</p>
  }

  return (
    <ul>
      {items?.map((item, index) => (
        <li key={index}>
          <span>itemId: {item.itemId}</span>&emsp;
          <span>name?: {item.name === '' ? '--EMPTY--' : item.name}</span>&emsp;
          <span>
            storage?: {item.storage === '' ? '--EMPTY--' : item.storage}
          </span>
          &emsp;
          {session && session.user.role === 'ADMIN' && (
            <>
              <Link href={`/gallery/update/${item.itemId}`}>
                <a>update</a>
              </Link>
              &emsp;
              <button onClick={(): void => mutate(item.itemId)}>delete</button>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
    },
  }
}

export default Gallery
