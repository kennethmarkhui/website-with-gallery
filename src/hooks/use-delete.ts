import { useMutation } from '@tanstack/react-query'

import { deleteItem } from '@/actions/gallery-admin'
import { queryClient } from '@/lib/query'

const useDelete = () => {
  return useMutation({
    mutationFn: ({ id, publicId }: { id: string; publicId?: string }) =>
      deleteItem({ id, publicId }),
    onMutate: async ({ id }) => {
      // await queryClient.cancelQueries(['gallery'])
      // const snapshot = queryClient.getQueryData<
      //   InfiniteData<{
      //     items: OmittedItem[]
      //     nextCursor: NextCursor
      //   }>
      // >(['gallery'])
      // queryClient.setQueryData<InfiniteData<{
      //   items: OmittedItem[]
      //   nextCursor: NextCursor
      // }>>(
      //   ['gallery'],
      //   (prevItems) => prevItems?.filter((current) => current.id !== id)
      // )
      // return { snapshot }
    },
    onError: (error, id, context) => {
      // queryClient.setQueryData(['gallery'], context?.snapshot)
    },
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
    onSettled: (data, error, item, context) => {},
  })
}

export default useDelete
