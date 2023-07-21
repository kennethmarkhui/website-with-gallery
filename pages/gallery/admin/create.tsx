import type { GetServerSideProps } from 'next'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Tab } from '@headlessui/react'

import { fetchCategories } from 'pages/api/gallery/category'
import GalleryAdminLayout from '@/components/layout/GalleryAdminLayout'
import GalleryForm from '@/components/gallery/Form'
import CategoryForm from '@/components/gallery/CategoryForm'
import { cn, pick } from 'lib/utils'

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient()

  await queryClient.fetchQuery(['categories'], () => fetchCategories())

  return {
    props: {
      messages: pick(await import(`../../../intl/${locale}.json`), [
        'gallery-admin',
        'auth',
        'form',
      ]),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  }
}

const Create = (): JSX.Element => {
  const t = useTranslations('gallery-admin')
  const tForm = useTranslations('form')

  const tabs = [
    { name: tForm('item'), node: <GalleryForm mode="create" /> },
    { name: tForm('category'), node: <CategoryForm /> },
  ]

  return (
    <GalleryAdminLayout title={t('create-title')}>
      <Tab.Group as={'div'} defaultIndex={0} className="w-full">
        <Tab.List className="flex w-full justify-around space-x-1 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                cn(
                  'w-full border-b-2 text-xl focus:outline-none',
                  selected && 'pointer-events-none border-black font-bold'
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {tabs.map((tab, index) => (
            <Tab.Panel key={index} className="focus:outline-none">
              {tab.node}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </GalleryAdminLayout>
  )
}

export default Create
