import type { ReactElement } from 'react'
import type { GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'

import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm from '@/components/gallery/Form'
import { NextPageWithLayout } from 'pages/_app'
import { pick } from 'lib/utils'

const Create: NextPageWithLayout = (): JSX.Element => {
  const { data: session, status } = useSession()

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return <GalleryForm />
}

Create.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
    },
  }
}

export default Create
