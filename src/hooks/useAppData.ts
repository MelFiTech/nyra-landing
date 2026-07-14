import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  apiClientApi,
  customersApi,
  notificationsApi,
  transactionsApi,
  type TransactionListParams,
  walletApi,
  webhooksApi,
} from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useBusiness } from '../context/BusinessContext'

export function useBusinessWallet() {
  const { businessId } = useBusiness()
  return useQuery({
    queryKey: queryKeys.wallet(businessId ?? ''),
    queryFn: () => walletApi.getBusinessWallet(businessId!),
    enabled: !!businessId,
  })
}

const TX_HISTORY_PAGE_SIZE = 100

export function useTransactions(params?: TransactionListParams) {
  const { businessId } = useBusiness()
  return useQuery({
    queryKey: queryKeys.transactions(businessId ?? '', params),
    queryFn: () => transactionsApi.list(params, businessId!),
    enabled: !!businessId,
  })
}

/** Cursor-paginated fetch so the transactions page can load full wallet history. */
export function useAllTransactions(
  params?: Omit<TransactionListParams, 'cursor' | 'page_size'>,
) {
  const { businessId } = useBusiness()
  return useInfiniteQuery({
    queryKey: queryKeys.transactions(businessId ?? '', { ...params, mode: 'all' }),
    queryFn: ({ pageParam }) =>
      transactionsApi.list(
        {
          ...params,
          page_size: TX_HISTORY_PAGE_SIZE,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        businessId!,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => {
      if (lastPage.length < TX_HISTORY_PAGE_SIZE) return undefined
      return lastPage[lastPage.length - 1]?.transaction_id
    },
    enabled: !!businessId,
  })
}

export function useCustomers() {
  const { businessId } = useBusiness()
  return useQuery({
    queryKey: queryKeys.customers(businessId ?? ''),
    queryFn: () => customersApi.list(businessId!),
    enabled: !!businessId,
  })
}

export function useCustomer(walletId: string | undefined) {
  const { businessId } = useBusiness()
  return useQuery({
    queryKey: queryKeys.customer(businessId ?? '', walletId ?? ''),
    queryFn: () => customersApi.get(walletId!, businessId!),
    enabled: !!businessId && !!walletId,
  })
}

export function useCustomerTransactions(walletId: string | undefined) {
  const { businessId } = useBusiness()
  return useQuery({
    queryKey: queryKeys.customerTransactions(businessId ?? '', walletId ?? ''),
    queryFn: () => customersApi.transactions(walletId!, { limit: 50 }, businessId!),
    enabled: !!businessId && !!walletId,
  })
}

export function useApiClient() {
  const { businessId, business } = useBusiness()
  return useQuery({
    queryKey: queryKeys.apiClient(businessId ?? ''),
    queryFn: () => apiClientApi.get(businessId!),
    enabled: !!businessId && business?.verification_status === 'VERIFIED',
  })
}

export function useWebhookConfigs() {
  const { businessId } = useBusiness()
  return useQuery({
    queryKey: queryKeys.webhookConfigs(businessId ?? ''),
    queryFn: () => webhooksApi.listConfigs(businessId!),
    enabled: !!businessId,
  })
}

export function useWebhookDeliveries() {
  const { businessId } = useBusiness()
  return useQuery({
    queryKey: queryKeys.webhookDeliveries(businessId ?? ''),
    queryFn: async () => {
      const { items } = await webhooksApi.listDeliveries(businessId!, { limit: 50 })
      return items
    },
    enabled: !!businessId,
  })
}

export function useNotifications() {
  const { businessId } = useBusiness()
  return useQuery({
    queryKey: queryKeys.notifications(businessId ?? ''),
    queryFn: () => notificationsApi.list(businessId!),
    enabled: !!businessId,
    staleTime: 30_000,
  })
}
