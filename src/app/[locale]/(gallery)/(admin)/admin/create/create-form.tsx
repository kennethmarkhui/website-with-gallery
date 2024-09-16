'use client'

import { useTranslations } from 'next-intl'
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react'

import GalleryForm from './gallery-form'
import CategoryForm from './category-form'
import { cn } from '@/lib/utils'

export default function GalleryAdminCreateForm() {
  //   const t = useTranslations('gallery-admin')
  const tForm = useTranslations('form')

  const tabs = [
    { name: tForm('item'), node: <GalleryForm mode="create" /> },
    { name: tForm('category'), node: <CategoryForm /> },
  ]

  return (
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
  )
}
