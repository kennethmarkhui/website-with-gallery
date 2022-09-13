import type { ReactElement } from 'react'
import type { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'

import type { GalleryFormFields } from 'types/gallery'
import { NextPageWithLayout } from 'pages/_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm from '@/components/gallery/Form'
import { fetchItem } from 'pages/api/gallery/[id]'
import { pick } from 'lib/utils'

interface IUpdate {
  data: GalleryFormFields
}

const Update: NextPageWithLayout<IUpdate> = ({ data }) => {
  const { data: session } = useSession()

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return <GalleryForm mode="update" defaults={{ ...data }} />
}

Update.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  let data
  if (params?.id) {
    try {
      const resData = await fetchItem(params.id as string)
      data = resData
    } catch (error) {
      console.error(error)
    }
  }

  return {
    props: {
      messages: pick(await import(`../../../intl/${locale}.json`), ['gallery']),
      data,
    },
  }
}

export default Update
