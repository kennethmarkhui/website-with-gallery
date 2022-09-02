import { ReactElement } from 'react'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { useSession } from 'next-auth/react'

import { NextPageWithLayout } from 'pages/_app'
import { FormValues, OmittedItem } from 'types/gallery'
import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm from '@/components/gallery/Form'
import useGallery from 'hooks/use-gallery'
import { fetchItem } from 'pages/api/gallery/[itemId]'
import { pick } from 'lib/utils'

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
