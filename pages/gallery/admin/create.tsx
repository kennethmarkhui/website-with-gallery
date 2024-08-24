import type { GetServerSideProps } from 'next'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getServerSession } from 'next-auth'
import { useTranslations } from 'next-intl'
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react'

import { fetchCategories } from 'pages/api/gallery/category'
import GalleryAdminLayout from '@/components/layout/GalleryAdminLayout'
import GalleryForm from '@/components/gallery/Form'
import CategoryForm from '@/components/gallery/CategoryForm'
import { cn, pick } from 'lib/utils'
import { authOptions } from 'lib/auth'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  locale,
}) => {
  const session = await getServerSession(req, res, authOptions)

  const queryClient = new QueryClient()

  await queryClient.fetchQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  })

  return {
    props: {
      session,
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
      <TabGroup as="div" defaultIndex={0} className="w-full">
        <TabList className="flex w-full justify-around space-x-1 p-1">
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
        </TabList>
        <TabPanels className="mt-2">
          {tabs.map((tab, index) => (
            <TabPanel key={index} className="focus:outline-none">
              {tab.node}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </GalleryAdminLayout>
  )
}

export default Create
