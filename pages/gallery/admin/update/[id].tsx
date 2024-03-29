import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { dehydrate, QueryClient } from '@tanstack/react-query'

import type { DefaultGalleryFormFields } from 'types/gallery'
import { fetchAdminItem } from 'pages/api/gallery/admin/[id]'
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
      notFound: true,
    }
  }

  const { id } = params

  // TODO: parse query.data with zod?
  const queryData = typeof query.data === 'string' && JSON.parse(query.data)

  if (queryData) {
    queryClient.setQueryData(['item', id], {
      id,
      ...queryData,
    })
  }

  if (!queryData) {
    // fetch item if no query data provided
    await queryClient.fetchQuery(['item', id], () => fetchAdminItem(id))
    await queryClient.fetchQuery(['categories'], () => fetchCategories())
  }

  return {
    props: {
      messages: pick(await import(`../../../../intl/${locale}.json`), [
        'gallery-admin',
        'auth',
        'form',
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
    name: data.translations.some(({ name }) => name)
      ? data.translations
          .map(({ language: { code }, name }) => ({
            code,
            value: name ?? '',
          }))
          .filter(({ value }) => value)
      : [{ code: router.locale!, value: '' }],
    storage: data.translations.some(({ storage }) => storage)
      ? data.translations
          .map(({ language: { code }, storage }) => ({
            code,
            value: storage ?? '',
          }))
          .filter(({ value }) => value)
      : [{ code: router.locale!, value: '' }],
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
