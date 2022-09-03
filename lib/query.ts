import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 1000 * 60, // 2 mins
      // refetchOnWindowFocus: false,
    },
  },
})
