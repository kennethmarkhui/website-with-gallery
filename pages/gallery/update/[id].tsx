import type { ReactElement } from 'react'
import type { GetServerSideProps } from 'next'
import { unstable_getServerSession } from 'next-auth'

import type { GalleryFormFields } from 'types/gallery'
import { NextPageWithLayout } from 'pages/_app'
import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm from '@/components/gallery/Form'
import { fetchItem } from 'pages/api/gallery/[id]'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { pick } from 'lib/utils'

interface UpdateProps {
  data: GalleryFormFields
}

type Params = {
  id: string
}

const Update: NextPageWithLayout<UpdateProps> = ({ data }) => {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <GalleryForm mode="update" defaultFormValues={data} />
    </div>
  )
}

Update.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getServerSideProps: GetServerSideProps<
  UpdateProps,
  Params
> = async ({ req, res, locale, query, params }) => {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!params || !session || session.user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/gallery',
        permanent: false,
      },
    }
  }

  const { id } = params

  let data

  if (query.data && typeof query.data === 'string') {
    data = JSON.parse(query.data)
    data.id = id
  }

  if (!query.data) {
    // fetch item if no query data provided
    try {
      const resData = await fetchItem(id)
      if (resData) {
        data = {
          id: resData.id,
          name: resData.name ?? '',
          storage: resData.storage ?? '',
          category: resData.category ?? '',
          image: resData.image
            ? resData.image
            : { url: '/placeholder.png', publicId: '' },
        } as GalleryFormFields
      } else {
        throw new Error('no data found')
      }
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
