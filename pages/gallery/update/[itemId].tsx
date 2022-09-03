import type { ReactElement } from 'react'
import type { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import type { FormValues, OmittedItem } from 'types/gallery'
import { NextPageWithLayout } from 'pages/_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm from '@/components/gallery/Form'
import { fetchItem } from 'pages/api/gallery/[itemId]'
import { useUpdate } from 'hooks/gallery'
import { pick } from 'lib/utils'

interface IUpdate {
  data: OmittedItem
}

const Update: NextPageWithLayout<IUpdate> = ({ data }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const { mutate, status } = useUpdate(() => router.push('/gallery'))

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return (
    <GalleryForm
      handleFormSubmit={(formData: FormValues) => mutate(formData)}
      loading={status === 'loading'}
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
}) => {
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
