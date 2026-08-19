import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Button from '../components/ui/Button'
import EmptyState, { DocumentEmptyIcon } from '../components/ui/EmptyState'
import RouteErrorBoundary from '../components/ui/RouteErrorBoundary'
import { TableRowsSkeleton } from '../components/ui/Skeletons'
import CustomerRowMenu from '../components/customers/CustomerRowMenu'
import UsdDepositSheet from '../components/treasury/UsdDepositSheet'
import UsdTransferSheet from '../components/treasury/UsdTransferSheet'
import { useBalance } from '../context/BalanceContext'
import { useBusiness, usePermissions } from '../context/BusinessContext'
import {
  useBusinessWallet,
  useCardSummary,
  useCryptoMasterWallets,
  useCryptoTransactions,
} from '../hooks/useAppData'
import type { CryptoMasterWallet, CryptoTransaction } from '../lib/api'
import {
  floatWalletKey,
  formatCryptoAmount,
  formatNetworkLabel,
  isStablecoinAsset,
  walletToCryptoDeposit,
} from '../lib/cryptoFloat'
import { formatTxDateShort } from '../lib/mapTransaction'
import { queryKeys } from '../lib/queryKeys'
import styles from './AssetsPage.module.css'
import txStyles from './TransactionsPage.module.css'

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)

const CoinsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6"/>
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
    <path d="M7 6h1v4"/>
    <path d="m16.71 13.88.7.71-2.82 2.82"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

type AssetTab = 'all' | 'USDT' | 'USDC' | 'BTC'

const ASSET_TABS: { id: AssetTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'USDT', label: 'USDT' },
  { id: 'USDC', label: 'USDC' },
  { id: 'BTC', label: 'BTC' },
]

const PAGE_SIZE = 50

function asText(value: unknown, fallback = '—') {
  if (value == null || value === '') return fallback
  if (typeof value === 'object') return fallback
  return String(value)
}

function normalizeCryptoStatus(status: unknown): 'successful' | 'failed' | 'pending' {
  const value = asText(status, '').toLowerCase()
  if (['success', 'successful', 'completed', 'confirmed'].includes(value)) return 'successful'
  if (['failed', 'reversed', 'cancelled', 'rejected'].includes(value)) return 'failed'
  return 'pending'
}

function mapCryptoRow(tx: CryptoTransaction, masked: boolean) {
  const type = asText(tx.type, '').toLowerCase()
  const credit = type === 'deposit'
  const asset = asText(tx.asset, '')
  const formatted = formatCryptoAmount(tx.amount, asset, masked)
  const network = formatNetworkLabel(asText(tx.network, ''))
  const method = !network || network === '—' ? 'On-chain' : network
  const status = normalizeCryptoStatus(tx.status)
  const date = formatTxDateShort(tx.created_at) || '—'

  return {
    id: asText(tx.transaction_id, asText(tx.reference, `${asset}-${date}`)),
    flowType: credit ? 'Inflow' : 'Outflow',
    method,
    currency: asset || '—',
    amount: masked
      ? `${credit ? '+' : '−'} ••••`
      : `${credit ? '+' : '−'} ${formatted}`,
    amountType: credit ? 'credit' as const : 'debit' as const,
    date,
    status,
    dot: status === 'successful' ? 'green' as const : 'red' as const,
  }
}

export default function AssetsPage() {
  return (
    <RouteErrorBoundary>
      <AssetsPageInner />
    </RouteErrorBoundary>
  )
}

function AssetsPageInner() {
  const queryClient = useQueryClient()
  const { business, businessId, businessesLoading } = useBusiness()
  const { canAct } = usePermissions()
  const { visible: balanceVisible } = useBalance()
  const cryptoFloatEnabled = business?.crypto_float_enabled === true
  const { data: wallet } = useBusinessWallet()
  const { data: cardSummary } = useCardSummary()
  const {
    data: floatWalletsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCryptoMasterWallets(cryptoFloatEnabled)
  const {
    data: cryptoTransactionsData,
    isLoading: txLoading,
    isError: txError,
    isFetching: txFetching,
    refetch: refetchTransactions,
  } = useCryptoTransactions(cryptoFloatEnabled)

  const floatWallets = Array.isArray(floatWalletsData) ? floatWalletsData : []
  const cryptoTransactions = Array.isArray(cryptoTransactionsData) ? cryptoTransactionsData : []

  const [assetTab, setAssetTab] = useState<AssetTab>('all')
  const [txPage, setTxPage] = useState(1)

  const orderedWallets = useMemo(() => {
    const rank = (asset?: string) => {
      const key = String(asset ?? '').toUpperCase()
      if (key === 'USDT') return 0
      if (key === 'USDC') return 1
      if (key === 'BTC') return 2
      return 3
    }
    return [...floatWallets].sort((a, b) => rank(a.asset) - rank(b.asset))
  }, [floatWallets])

  const visibleTransactions = useMemo(() => {
    const rows = assetTab === 'all'
      ? cryptoTransactions
      : cryptoTransactions.filter(tx => String(tx.asset ?? '').toUpperCase() === assetTab)
    return rows.map(tx => mapCryptoRow(tx, !balanceVisible))
  }, [cryptoTransactions, assetTab, balanceVisible])

  const txTotalPages = Math.max(1, Math.ceil(visibleTransactions.length / PAGE_SIZE))
  const txCurrentPage = Math.min(txPage, txTotalPages)
  const txPageItems = visibleTransactions.slice((txCurrentPage - 1) * PAGE_SIZE, txCurrentPage * PAGE_SIZE)

  const [depositWallet, setDepositWallet] = useState<CryptoMasterWallet | null>(null)
  const [transferWallet, setTransferWallet] = useState<CryptoMasterWallet | null>(null)

  const usdAvailable = Number(cardSummary?.usd_balance ?? 0)
  const canDeposit = canAct
  const canTransfer = canAct && Boolean(wallet?.wallet_pin_changed) && !wallet?.frozen
  const transferAvailableUsd = usdAvailable

  function refreshAssets() {
    if (!businessId) return
    void queryClient.invalidateQueries({ queryKey: queryKeys.cryptoMasterWallets(businessId) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.cryptoTransactions(businessId) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.cardSummary(businessId) })
    void queryClient.invalidateQueries({ queryKey: ['transactions', businessId] })
  }

  function refreshPage() {
    void refetch()
    void refetchTransactions()
  }

  function canTransferWallet(item: CryptoMasterWallet) {
    if (!canTransfer || !isStablecoinAsset(item.asset)) return false
    return usdAvailable >= 1
  }

  function menuItems(item: CryptoMasterWallet) {
    const items = [
      {
        label: 'Deposit',
        disabled: !canDeposit,
        onClick: () => setDepositWallet(item),
      },
    ]

    if (isStablecoinAsset(item.asset)) {
      items.push({
        label: 'Transfer',
        disabled: !canTransferWallet(item),
        onClick: () => setTransferWallet(item),
      })
    }

    return items
  }

  return (
    <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Assets</h1>
            <p className={styles.pageSub}>
              Manage on-chain float wallets for supported crypto assets.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="icon"
              className={styles.refreshBtn}
              disabled={isFetching || txFetching}
              onClick={refreshPage}
              title="Refresh assets"
            >
              <span className={isFetching ? styles.refreshSpinning : undefined}>
                <RefreshIcon />
              </span>
            </Button>
          </div>
        </div>

        <div className={styles.contentWrap}>
          {businessesLoading || (cryptoFloatEnabled && isLoading && floatWallets.length === 0 && !isError) ? (
            <>
              <div className={styles.grid}>
                <div className={styles.skCard} />
                <div className={styles.skCard} />
                <div className={styles.skCard} />
              </div>
              <section className={styles.txSection}>
                <div className={styles.txHeader}>
                  <div className={styles.skTitle} />
                  <div className={styles.txTabs}>
                    <span className={styles.skPill} />
                    <span className={styles.skPill} />
                    <span className={styles.skPill} />
                    <span className={styles.skPill} />
                  </div>
                </div>
                <div className={styles.tableWrap}>
                  <div className={styles.skTable}>
                    <div className={styles.skTxRow} />
                    <div className={styles.skTxRow} />
                    <div className={styles.skTxRow} />
                    <div className={styles.skTxRow} />
                    <div className={styles.skTxRow} />
                  </div>
                </div>
              </section>
            </>
          ) : !cryptoFloatEnabled ? (
            <div className={styles.emptyWrap}>
              <EmptyState
                icon={<CoinsIcon />}
                title="Crypto float not enabled"
                description="Contact Nyra support to enable crypto float wallets for your business."
              />
            </div>
          ) : isError && floatWallets.length === 0 ? (
            <div className={styles.emptyWrap}>
              <EmptyState
                icon={<CoinsIcon />}
                title="Could not load assets"
                description={(error as Error)?.message || 'Check your connection and try again.'}
                action={
                  <Button variant="outline" size="sm" onClick={refreshPage}>
                    Retry
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {orderedWallets.map(item => (
                  <article key={floatWalletKey(item)} className={styles.assetCard}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardHeading}>
                        <span className={styles.assetName}>{asText(item.asset)}</span>
                      </div>
                      <CustomerRowMenu
                        ariaLabel={`${item.asset} wallet actions`}
                        items={menuItems(item)}
                      />
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.balanceBlock}>
                        <span className={styles.balanceLabel}>Balance</span>
                        <span className={styles.balanceValue}>
                          {isLoading
                            ? '—'
                            : formatCryptoAmount(item.balance, item.asset, !balanceVisible)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <section className={styles.txSection}>
                <div className={styles.txHeader}>
                  <h2 className={styles.txTitle}>Transactions</h2>
                  <div className={styles.txTabs} role="tablist" aria-label="Filter by asset">
                    {ASSET_TABS.map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={assetTab === tab.id}
                        className={`${styles.txTab} ${assetTab === tab.id ? styles.txTabActive : ''}`}
                        onClick={() => {
                          setAssetTab(tab.id)
                          setTxPage(1)
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={txStyles.tableWrap}>
                  {txLoading && visibleTransactions.length === 0 && !txError ? (
                    <TableRowsSkeleton rows={6} />
                  ) : txError && visibleTransactions.length === 0 ? (
                    <EmptyState
                      icon={<DocumentEmptyIcon />}
                      title="Could not load transactions"
                      description="Check your connection and try again"
                      action={
                        <Button variant="outline" size="sm" onClick={() => void refetchTransactions()}>
                          Retry
                        </Button>
                      }
                    />
                  ) : txPageItems.length === 0 ? (
                    <EmptyState
                      icon={<DocumentEmptyIcon />}
                      title="No transactions yet"
                      description={
                        assetTab === 'all'
                          ? 'Crypto inflows and outflows will appear here'
                          : `No ${assetTab} inflows or outflows yet`
                      }
                    />
                  ) : (
                    <table className={txStyles.table}>
                      <thead>
                        <tr>
                          <th style={{ width: 28 }}></th>
                          <th>Type</th>
                          <th>Method</th>
                          <th>Currency</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {txPageItems.map(tx => (
                          <tr key={tx.id} className={`${txStyles.txRow} ${styles.txRowStatic}`}>
                            <td>
                              <span className={`${txStyles.dot} ${tx.dot === 'green' ? txStyles.dotGreen : txStyles.dotRed}`} />
                            </td>
                            <td className={txStyles.fromTo}>{tx.flowType}</td>
                            <td className={txStyles.method}>{tx.method}</td>
                            <td className={txStyles.currency}>{tx.currency}</td>
                            <td className={`${txStyles.amount} ${tx.amountType === 'credit' ? txStyles.amountCredit : txStyles.amountDebit}`}>
                              {tx.amount}
                            </td>
                            <td className={txStyles.date}>{tx.date}</td>
                            <td>
                              {tx.status === 'successful' ? (
                                <span className={txStyles.badgeSuccess}>
                                  <span className={txStyles.badgeIcon}><CheckIcon /></span>
                                  Successful
                                </span>
                              ) : tx.status === 'failed' ? (
                                <span className={txStyles.badgeFailed}>
                                  <span className={txStyles.badgeIcon}><XIcon /></span>
                                  Failed
                                </span>
                              ) : (
                                <span className={txStyles.badgeFailed} style={{ background: '#fffbeb', color: '#d97706' }}>
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className={txStyles.footer}>
                  <span className={txStyles.footerMeta}>
                    Showing {txPageItems.length} of {visibleTransactions.length} loaded transactions
                  </span>
                  <div className={txStyles.pagination}>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={txCurrentPage === 1}
                      onClick={() => setTxPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className={txStyles.footerPage}>Page {txCurrentPage} of {txTotalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={txCurrentPage >= txTotalPages}
                      onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

      {depositWallet ? (
        <UsdDepositSheet
          open
          onClose={() => setDepositWallet(null)}
          mode="crypto-only"
          cryptoDeposit={walletToCryptoDeposit(depositWallet)}
          loading={false}
          onFunded={refreshAssets}
        />
      ) : null}

      {transferWallet ? (
        <UsdTransferSheet
          open
          onClose={() => setTransferWallet(null)}
          availableUsd={transferAvailableUsd}
          floatWallet={transferWallet}
          pinReady={Boolean(wallet?.wallet_pin_changed)}
          canAct={canAct}
          onTransferred={refreshAssets}
        />
      ) : null}
    </div>
  )
}
