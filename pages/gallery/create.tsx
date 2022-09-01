import { ReactElement } from 'react'
import { GetStaticProps, GetStaticPropsContext } from 'next'
import { useSession } from 'next-auth/react'

import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm, { FormValues } from '@/components/gallery/Form'
import { NextPageWithLayout } from 'pages/_app'
import { pick } from 'lib/utils'
import useGallery from 'hooks/use-gallery'

const Create: NextPageWithLayout = (): JSX.Element => {
  const { createItem, loading } = useGallery()
  const { data: session, status } = useSession()

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return (
    <GalleryForm
      handleFormSubmit={(formData: FormValues) => createItem(formData)}
      loading={loading}
    />
  )
}

Create.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getStaticProps: GetStaticProps = async ({
  locale,
}: GetStaticPropsContext) => {
  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
    },
  }
}

export default Create
