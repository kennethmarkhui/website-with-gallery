'use client'

import useItem from '@/hooks/use-item'
import { DefaultGalleryFormFields } from '@/types/gallery'
import {
  useLocale,
  // useTranslations
} from 'next-intl'
import GalleryForm from '../../create/gallery-form'

interface GalleryAdminUpdateFormProps {
  id: string
}

export default function GalleryAdminUpdateForm({
  id,
}: GalleryAdminUpdateFormProps) {
  const locale = useLocale()
  //   const t = useTranslations('gallery-admin')

  const { data } = useItem(id)

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
      : [{ code: locale, value: '' }],
    storage: data.translations.some(({ storage }) => storage)
      ? data.translations
          .map(({ language: { code }, storage }) => ({
            code,
            value: storage ?? '',
          }))
          .filter(({ value }) => value)
      : [{ code: locale, value: '' }],
    category: data.category ?? '',
    image: data.image ?? undefined,
  } satisfies DefaultGalleryFormFields

  return <GalleryForm mode="update" defaultFormValues={fetchedData} />
}
