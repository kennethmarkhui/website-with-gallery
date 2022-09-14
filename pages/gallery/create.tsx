import { ReactElement, ReactNode, useState } from 'react'
import type { GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'
import { Tab } from '@headlessui/react'

import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm from '@/components/gallery/Form'
import { NextPageWithLayout } from 'pages/_app'
import { pick } from 'lib/utils'
import CategoryForm from '@/components/gallery/CategoryForm'

const Create: NextPageWithLayout = (): JSX.Element => {
  const [tabs] = useState<{ name: string; node: ReactNode }[]>([
    { name: 'Item', node: <GalleryForm /> },
    { name: 'Category', node: <CategoryForm /> },
  ])

  const { data: session } = useSession()

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return (
    <div className="mt-4 sm:mt-8 md:mt-16">
      <Tab.Group>
        <Tab.List className="flex w-full justify-around space-x-1 rounded-xl p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full border-b-2 text-xl ${
                  selected && 'border-black font-bold'
                }`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {tabs.map((tab, index) => (
            <Tab.Panel key={index}>{tab.node}</Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

Create.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

// TODO use react-query for caching categories with ISR ?hydration?
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
    },
  }
}

export default Create
