import { QueryClient, type DefaultOptions } from '@tanstack/react-query'
import { isHttpClientError } from '@/services/httpClient.ts'

const ONE_MINUTE_MS = 60_000
const FIVE_MINUTES_MS = 5 * ONE_MINUTE_MS

function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (failureCount >= 1) {
    return false
  }

  if (isHttpClientError(error) && error.status !== null) {
    // Do not retry deterministic client errors (4xx); retry only 5xx or network failures.
    return error.status >= 500
  }

  return true
}

const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: ONE_MINUTE_MS,
    gcTime: FIVE_MINUTES_MS,
    retry: shouldRetryQuery,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
}

export function createQueryClient(overrides?: DefaultOptions): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...defaultQueryOptions.queries,
        ...overrides?.queries,
      },
      mutations: {
        ...defaultQueryOptions.mutations,
        ...overrides?.mutations,
      },
    },
  })
}

export const queryClient: QueryClient = createQueryClient()
