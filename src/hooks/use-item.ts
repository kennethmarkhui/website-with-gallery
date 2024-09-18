import { useQuery } from '@tanstack/react-query'

import { getAdminItem } from '@/actions/gallery-admin'

const useItem = (id: string) => {
  const { data, status, error } = useQuery({
    queryKey: ['item', id],
    queryFn: () => getAdminItem(id),
  })

  return {
    data,
    status,
    error,
  }
}

export default useItem
