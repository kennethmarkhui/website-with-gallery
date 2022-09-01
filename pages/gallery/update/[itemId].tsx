import { ReactElement, useState } from 'react'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm, { FormValues } from '@/components/gallery/Form'
import { NextPageWithLayout } from 'pages/_app'
import { pick } from 'lib/utils'
import { fetchItem, OmittedItem } from 'pages/api/gallery'

interface IUpdate {
  data: OmittedItem
}

const Update: NextPageWithLayout<IUpdate> = ({ data }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handleFormSubmit = (formData: FormValues) => {
    setLoading(true)
    const submitData = async () => {
      try {
        const res = await fetch(`/api/gallery/update/${data.itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        await res.json()
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
      router.push('/gallery')
    }
    submitData()
  }

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return (
    <GalleryForm
      handleFormSubmit={handleFormSubmit}
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
