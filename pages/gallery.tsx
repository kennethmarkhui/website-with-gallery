import { ReactElement } from 'react'
import { GetStaticProps, GetStaticPropsContext } from 'next'

import { NextPageWithLayout } from './_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import { pick } from 'lib/utils'

const Gallery: NextPageWithLayout = () => {
  return <p>gallery</p>
}

Gallery.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getStaticProps: GetStaticProps = async ({
  locale,
}: GetStaticPropsContext) => {
  return {
    props: {
      messages: pick(await import(`../intl/${locale}.json`), ['gallery']),
    },
  }
}

export default Gallery
