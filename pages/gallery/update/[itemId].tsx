import { ReactElement } from 'react'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { useSession } from 'next-auth/react'

import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm, { FormValues } from '@/components/gallery/Form'
import { NextPageWithLayout } from 'pages/_app'
import { pick } from 'lib/utils'
import { fetchItem, OmittedItem } from 'pages/api/gallery'
import useGallery from 'hooks/use-gallery'

interface IUpdate {
  data: OmittedItem
}

const Update: NextPageWithLayout<IUpdate> = ({ data }) => {
  const { updateItem, loading } = useGallery()
  const { data: session } = useSession()

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return (
    <GalleryForm
      handleFormSubmit={(formData: FormValues) => updateItem(formData)}
      loading={loading}
      updating
      defaultValues={{ ...data }}
    />
  )
}

Update.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}: GetServerSidePropsContext) => {
  let data
  if (params?.itemId) {
    try {
      const resData = await fetchItem(params.itemId as string)
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
