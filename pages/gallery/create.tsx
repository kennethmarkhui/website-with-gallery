import { ReactElement, useState } from 'react'
import { GetStaticProps, GetStaticPropsContext } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import GalleryLayout from '@/components/layout/GalleryLayout'
import GalleryForm, { FormValues } from '@/components/gallery/Form'
import { NextPageWithLayout } from 'pages/_app'
import { pick } from 'lib/utils'

const Create: NextPageWithLayout = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleFormSubmit = (formData: FormValues): void => {
    const submitData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/gallery/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        console.log(data)
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

  return <GalleryForm handleFormSubmit={handleFormSubmit} loading={loading} />
}

Create.getLayout = function getLayout(page: ReactElement) {
  return <GalleryLayout>{page}</GalleryLayout>
}

export const getStaticProps: GetStaticProps = async ({
  locale,
}: GetStaticPropsContext) => {
  return {
    props: {
      messages: pick(await import(`../../intl/${locale}.json`), ['gallery']),
    },
  }
}

export default Create
