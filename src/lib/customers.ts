import type { CustomerWallet } from './api'

export type GroupStatus = 'active' | 'frozen' | 'mixed'

export function customerNameKey(name: string | null | undefined) {
  return (name ?? '').trim().toLowerCase() || 'unnamed'
}

export function sortCustomerAccounts(accounts: CustomerWallet[]) {
  return [...accounts].sort(
    (a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime(),
  )
}

export function getGroupStatus(accounts: CustomerWallet[]): GroupStatus {
  const frozenCount = accounts.filter(a => a.frozen).length
  if (frozenCount === 0) return 'active'
  if (frozenCount === accounts.length) return 'frozen'
  return 'mixed'
}

export function getEarliestCreatedAt(accounts: CustomerWallet[]) {
  return accounts.reduce<string | undefined>((earliest, account) => {
    if (!account.created_at) return earliest
    if (!earliest || new Date(account.created_at) < new Date(earliest)) return account.created_at
    return earliest
  }, undefined)
}

export function findCustomerByWalletId(wallets: CustomerWallet[], walletId: string) {
  return wallets.find(w => w.wallet_id === walletId) ?? null
}

export function getAccountsForCustomer(wallets: CustomerWallet[], customer: CustomerWallet) {
  const key = customerNameKey(customer.owners_fullname)
  return sortCustomerAccounts(wallets.filter(w => customerNameKey(w.owners_fullname) === key))
}
