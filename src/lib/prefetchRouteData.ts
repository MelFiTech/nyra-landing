import type { QueryClient } from '@tanstack/react-query'
import {
  apiClientApi,
  customersApi,
  transactionsApi,
  walletApi,
  webhooksApi,
} from './api'
import { queryKeys } from './queryKeys'

const STALE_TIME = 60_000

function prefetch<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
) {
  return queryClient.prefetchQuery({ queryKey, queryFn, staleTime: STALE_TIME })
}

export function prefetchRouteData(
  queryClient: QueryClient,
  businessId: string,
  path: string,
) {
  if (!businessId) return

  switch (path) {
    case '/app/dashboard':
      void prefetch(queryClient, queryKeys.wallet(businessId), () =>
        walletApi.getBusinessWallet(businessId),
      )
      void prefetch(queryClient, queryKeys.transactions(businessId, { page_size: 10 }), () =>
        transactionsApi.list({ page_size: 10 }),
      )
      break
    case '/app/transactions':
      void prefetch(queryClient, queryKeys.transactions(businessId, { page_size: 200 }), () =>
        transactionsApi.list({ page_size: 200 }),
      )
      break
    case '/app/customers':
      void prefetch(queryClient, queryKeys.customers(businessId), () =>
        customersApi.list(),
      )
      break
    case '/app/webhooks':
      void prefetch(queryClient, queryKeys.webhookDeliveries(businessId), async () => {
        const { items } = await webhooksApi.listDeliveries(businessId, { limit: 50 })
        return items
      })
      break
    case '/app/settings':
      void prefetch(queryClient, queryKeys.apiClient(businessId), () =>
        apiClientApi.get(businessId),
      )
      void prefetch(queryClient, queryKeys.webhookConfigs(businessId), () =>
        webhooksApi.listConfigs(businessId),
      )
      break
    default:
      break
  }
}
