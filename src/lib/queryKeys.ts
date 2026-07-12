export const queryKeys = {
  businesses: ['businesses'] as const,
  wallet: (businessId: string) => ['wallet', businessId] as const,
  transactions: (businessId: string, params?: Record<string, unknown>) =>
    ['transactions', businessId, params ?? {}] as const,
  customers: (businessId: string) => ['customers', businessId] as const,
  customer: (businessId: string, walletId: string) =>
    ['customer', businessId, walletId] as const,
  customerTransactions: (businessId: string, walletId: string) =>
    ['customer-transactions', businessId, walletId] as const,
  webhookConfigs: (businessId: string) => ['webhook-configs', businessId] as const,
  webhookDeliveries: (businessId: string) => ['webhook-deliveries', businessId] as const,
  apiClient: (businessId: string) => ['api-client', businessId] as const,
  team: (businessId: string) => ['team', businessId] as const,
  teamRole: (businessId: string) => ['team-role', businessId] as const,
}
