import type { ReactElement } from 'react'
import type { GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'

import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm from '@/components/gallery/Form'
import { NextPageWithLayout } from 'pages/_app'
import { pick } from 'lib/utils'
import CategoryForm from '@/components/gallery/CategoryForm'

const Create: NextPageWithLayout = (): JSX.Element => {
  const { data: session } = useSession()

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return (
    <>
      <GalleryForm />
      <br />
      <CategoryForm />
    </>
  )
}

Create.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

// TODO use react-query for caching categories with ISR ?hydration?
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
    },
  }
}

export default Create
