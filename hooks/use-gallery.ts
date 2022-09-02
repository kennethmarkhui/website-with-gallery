import { useState } from 'react'
import { useRouter } from 'next/router'

import { FormValues, OmittedItem } from 'types/gallery'

const useGallery = (initialItems?: OmittedItem[]) => {
  const router = useRouter()
  const [items, setItems] = useState<OmittedItem[]>(initialItems ?? [])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState(null)

  const deleteItem = async (itemId: string): Promise<void> => {
    setLoading(true)
    try {
      const res = await fetch(`/api/gallery/delete?itemId=${itemId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok && data.hasOwnProperty('error')) {
        throw new Error(data.message)
      }
      setItems((prev) => prev.filter((cur) => cur.itemId !== itemId))
    } catch (error) {
      setError(error as any)
    }
    setLoading(false)
  }

  const createItem = async (data: FormValues): Promise<void> => {
    setLoading(true)
    try {
      const res = await fetch('/api/gallery/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const resData = await res.json()
      if (!res.ok && resData.hasOwnProperty('error')) {
        throw new Error(resData.message)
      }
    } catch (error) {
      setError(error as any)
    }
    setLoading(false)
    router.push('/gallery')
  }

  const updateItem = async (data: FormValues): Promise<void> => {
    setLoading(true)
    try {
      const res = await fetch(`/api/gallery/update/${data.itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const resData = await res.json()
      if (!res.ok && resData.hasOwnProperty('error')) {
        throw new Error(resData.message)
      }
    } catch (error) {
      setError(error as any)
    }
    setLoading(false)
    router.push('/gallery')
  }

  return { items, createItem, updateItem, deleteItem, error, loading }
}

export default useGallery
