import { ReactElement, ReactNode, useState } from 'react'
import type { GetServerSideProps } from 'next'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'

import { NextPageWithLayout } from 'pages/_app'
import { fetchCategories } from 'pages/api/gallery/category'
import GalleryAdminLayout from '@/components/layout/GalleryAdminLayout'
import GalleryForm from '@/components/gallery/Form'
import CategoryForm from '@/components/gallery/CategoryForm'
import { pick } from 'lib/utils'

const Create: NextPageWithLayout = (): JSX.Element => {
  const [tabs] = useState<{ name: string; node: ReactNode }[]>([
    { name: 'Item', node: <GalleryForm /> },
    { name: 'Category', node: <CategoryForm /> },
  ])

  return (
    <Tab.Group as={'div'} defaultIndex={0} className="w-full">
      <Tab.List className="flex w-full justify-around space-x-1 p-1">
        {tabs.map((tab) => (
          <Tab
            key={tab.name}
            className={({ selected }) =>
              clsx(
                'w-full border-b-2 text-xl focus:outline-none',
                selected && 'border-black font-bold'
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
  )
}

Create.getLayout = function getLayout(page: ReactElement) {
  return <GalleryAdminLayout>{page}</GalleryAdminLayout>
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient()

  try {
    await queryClient.fetchQuery(['categories'], () => fetchCategories())
  } catch (error) {
    return {
      redirect: { destination: '/500', permanent: false },
    }
  }

  return {
    props: {
      messages: pick(await import(`../../../intl/${locale}.json`), ['gallery']),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  }
}

export default Create
