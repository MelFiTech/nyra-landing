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
  customerCryptoWallets: (businessId: string, walletId: string) =>
    ['customer-crypto-wallets', businessId, walletId] as const,
  cryptoAssets: (businessId: string) => ['crypto-assets', businessId] as const,
  cryptoMasterWallets: (businessId: string) => ['crypto-master-wallets', businessId] as const,
  webhookConfigs: (businessId: string) => ['webhook-configs', businessId] as const,
  webhookDeliveries: (businessId: string) => ['webhook-deliveries', businessId] as const,
  apiClient: (businessId: string) => ['api-client', businessId] as const,
  apiEnvironment: (businessId: string) => ['api-environment', businessId] as const,
  team: (businessId: string) => ['team', businessId] as const,
  teamRole: (businessId: string) => ['team-role', businessId] as const,
  notifications: (businessId: string) => ['notifications', businessId] as const,
  cardSummary: (businessId: string) => ['card-summary', businessId] as const,
  cards: (businessId: string) => ['cards', businessId] as const,
  cardCustomers: (businessId: string) => ['card-customers', businessId] as const,
  cardTransactions: (businessId: string, cardId: string, monthYear: string) =>
    ['card-transactions', businessId, cardId, monthYear] as const,
  usdCryptoDeposit: (businessId: string) => ['usd-crypto-deposit', businessId] as const,
}
