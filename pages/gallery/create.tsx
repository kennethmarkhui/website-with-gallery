import type { ReactElement } from 'react'
import type { GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import type { FormValues } from 'types/gallery'
import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm from '@/components/gallery/Form'
import { NextPageWithLayout } from 'pages/_app'
import { useCreate } from 'hooks/gallery'
import { pick } from 'lib/utils'

const Create: NextPageWithLayout = (): JSX.Element => {
  const router = useRouter()
  const { mutate, status, error } = useCreate(() => router.push('/gallery'))
  const { data: session, status: sessionStatus } = useSession()

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return (
    <GalleryForm
      handleFormSubmit={(formData: FormValues) => mutate(formData)}
      loading={status === 'loading'}
    />
  )
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
