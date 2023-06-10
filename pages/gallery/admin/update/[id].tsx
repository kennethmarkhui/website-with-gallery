import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { dehydrate, QueryClient } from '@tanstack/react-query'

import type { DefaultGalleryFormFields } from 'types/gallery'
import { fetchItem } from 'pages/api/gallery/[id]'
import { fetchCategories } from 'pages/api/gallery/category'
import GalleryAdminLayout from '@/components/layout/GalleryAdminLayout'
import GalleryForm from '@/components/gallery/Form'
import useItem from 'hooks/gallery/useItem'
import { pick } from 'lib/utils'

interface UpdateProps {}

type Params = {
  id: string
}

export const getServerSideProps: GetServerSideProps<
  UpdateProps,
  Params
> = async ({ req, res, locale, query, params }) => {
  const queryClient = new QueryClient()

  if (!params) {
    return {
      redirect: {
        destination: '/gallery',
        permanent: false,
      },
    }
  }

  const { id } = params

  if (query.data && typeof query.data === 'string') {
    await queryClient.setQueryData(['item', id], {
      id,
      ...JSON.parse(query.data),
    })
  }

  if (!query.data) {
    // fetch item if no query data provided
    try {
      await queryClient.fetchQuery(['item', id], () => fetchItem(id))
      await queryClient.fetchQuery(['categories'], () => fetchCategories())
    } catch (error) {
      return {
        redirect: { destination: '/500', permanent: false },
      }
    }
  }

  return {
    props: {
      messages: pick(await import(`../../../../intl/${locale}.json`), [
        'gallery-admin',
        'auth',
      ]),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  }
}

const Update = (): JSX.Element => {
  const t = useTranslations('gallery-admin')
  const router = useRouter()

  const { data } = useItem(router.query.id as string)

  if (!data) {
    return <></>
  }

  const fetchedData = {
    id: data.id,
    name: data.name ?? '',
    storage: data.storage ?? '',
    category: data.category ?? '',
    image: data.image ?? undefined,
  } satisfies DefaultGalleryFormFields

  return (
    <GalleryAdminLayout title={t('update-title')}>
      <GalleryForm mode="update" defaultFormValues={fetchedData} />
    </GalleryAdminLayout>
  )
}

export default Update
