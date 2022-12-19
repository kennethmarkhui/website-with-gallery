import type { ReactElement } from 'react'
import type { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'

import type { GalleryFormFields } from 'types/gallery'
import { NextPageWithLayout } from 'pages/_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm from '@/components/gallery/Form'
import { fetchItem } from 'pages/api/gallery/[id]'
import { pick } from 'lib/utils'

interface UpdateProps {
  data: GalleryFormFields
}

const Update: NextPageWithLayout<UpdateProps> = ({ data }) => {
  const { data: session } = useSession()

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <GalleryForm mode="update" defaults={{ ...data }} />
    </div>
  )
}

Update.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
}) => {
  let data

  const { data: queryData, id } = query

  if (queryData) {
    data = JSON.parse(queryData as string)
    data.id = id
  }

  if (!queryData) {
    // fetch item if no query data provided
    try {
      const resData = await fetchItem(id as string)
      data = resData
    } catch (error) {
      console.error(error)
      return {
        redirect: { destination: '/gallery', permanent: false },
      }
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
