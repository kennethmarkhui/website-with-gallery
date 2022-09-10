import type { ReactElement } from 'react'
import type { GetServerSideProps, GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'

import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm from '@/components/gallery/Form'
import { NextPageWithLayout } from 'pages/_app'
import { pick } from 'lib/utils'
import CategoryForm from '@/components/gallery/CategoryForm'
import { fetchCategories } from 'pages/api/gallery/category'

const Create: NextPageWithLayout<{
  categories: string[]
}> = ({ categories }): JSX.Element => {
  const { data: session, status } = useSession()

  if (!session || session.user.role !== 'ADMIN') {
    return <div>access denied</div>
  }

  return (
    <>
      <GalleryForm />
      <CategoryForm categories={categories} />
    </>
  )
}

Create.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

// TODO ISR
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const categories = await fetchCategories()

  const extractedCategories = categories.map((c) => c.name)

  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
      categories: extractedCategories,
    },
  }
}

export default Create
