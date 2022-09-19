import { useMutation } from '@tanstack/react-query'

import { queryClient } from 'lib/query'
import fetcher from 'lib/fetcher'

const useDelete = () => {
  return useMutation(
    (variables: { id: string; publicId?: string }) =>
      fetcher(
        `/api/gallery/delete?id=${variables.id}${
          variables.publicId ? `&publicId=${variables.publicId}` : ''
        }`,
        { method: 'DELETE' }
      ),
    {
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
        queryClient.invalidateQueries(['gallery'])
      },
      onSettled: (data, error, item, context) => {},
    }
  )
}

export default useDelete
