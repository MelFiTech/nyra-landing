import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import CustomerRowMenu from '../components/customers/CustomerRowMenu'
import IssueCryptoFloatWalletSheet from '../components/treasury/IssueCryptoFloatWalletSheet'
import UsdDepositSheet from '../components/treasury/UsdDepositSheet'
import UsdTransferSheet from '../components/treasury/UsdTransferSheet'
import { useBalance } from '../context/BalanceContext'
import { useBusiness, usePermissions } from '../context/BusinessContext'
import {
  useBusinessWallet,
  useCardSummary,
  useCryptoMasterWallets,
} from '../hooks/useAppData'
import type { CryptoMasterWallet } from '../lib/api'
import {
  floatWalletKey,
  formatCryptoAmount,
  formatNetworkLabel,
  isStablecoinAsset,
} from '../lib/cryptoFloat'
import { queryKeys } from '../lib/queryKeys'
import styles from './AssetsPage.module.css'

const SLOT_COUNT = 3

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

type EmptySlotProps = {
  loading?: boolean
  canAct: boolean
  onAdd: () => void
}

function EmptyAssetSlot({ loading, canAct, onAdd }: EmptySlotProps) {
  return (
    <div className={styles.emptySlot}>
      <button
        type="button"
        className={styles.emptySlotCta}
        disabled={!canAct || loading}
        onClick={onAdd}
      >
        {loading ? 'Loading…' : 'Create wallet'}
      </button>
    </div>
  )
}

export default function AssetsPage() {
  const queryClient = useQueryClient()
  const { business, businessId } = useBusiness()
  const { canAct } = usePermissions()
  const { visible: balanceVisible } = useBalance()
  const cryptoFloatEnabled = business?.crypto_float_enabled === true
  const { data: wallet } = useBusinessWallet()
  const { data: cardSummary } = useCardSummary()
  const {
    data: floatWallets = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCryptoMasterWallets(cryptoFloatEnabled)

  const [issueOpen, setIssueOpen] = useState(false)
  const [depositWallet, setDepositWallet] = useState<CryptoMasterWallet | null>(null)
  const [transferWallet, setTransferWallet] = useState<CryptoMasterWallet | null>(null)

  const usdAvailable = Number(cardSummary?.usd_balance ?? 0)
  const canDeposit = canAct
  const canTransfer = canAct && Boolean(wallet?.wallet_pin_changed) && !wallet?.frozen

  const emptySlotCount = useMemo(
    () => Math.max(0, SLOT_COUNT - floatWallets.length),
    [floatWallets.length],
  )

  const transferAvailableUsd = useMemo(() => {
    if (!transferWallet || !isStablecoinAsset(transferWallet.asset)) return usdAvailable
    return Math.min(Number(transferWallet.balance ?? 0), usdAvailable)
  }, [transferWallet, usdAvailable])

  function refreshAssets() {
    if (!businessId) return
    void queryClient.invalidateQueries({ queryKey: queryKeys.cryptoMasterWallets(businessId) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.cardSummary(businessId) })
    void queryClient.invalidateQueries({ queryKey: ['transactions', businessId] })
  }

  function canTransferWallet(item: CryptoMasterWallet) {
    if (!canTransfer || !isStablecoinAsset(item.asset)) return false
    const available = Math.min(Number(item.balance ?? 0), usdAvailable)
    return available >= 1
  }

  function menuItems(item: CryptoMasterWallet) {
    const items = [
      {
        label: 'Deposit',
        disabled: !canDeposit || !item.deposit_address,
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
    <>
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
              disabled={isFetching}
              onClick={() => void refetch()}
              title="Refresh assets"
            >
              <span className={isFetching ? styles.refreshSpinning : undefined}>
                <RefreshIcon />
              </span>
            </Button>
            {cryptoFloatEnabled && canAct && (
              <Button variant="primary" size="sm" onClick={() => setIssueOpen(true)}>
                Add wallet
              </Button>
            )}
          </div>
        </div>

        <div className={styles.contentWrap}>
          {!cryptoFloatEnabled ? (
            <div className={styles.emptyWrap}>
              <EmptyState
                icon={<CoinsIcon />}
                title="Crypto float not enabled"
                description="Contact Nyra support to enable crypto float wallets for your business."
              />
            </div>
          ) : (
            <>
              {isError && (
                <div className={styles.errorBanner}>
                  {(error as Error)?.message || 'Could not load assets. Check your connection and try again.'}
                </div>
              )}

              <div className={styles.grid}>
                {floatWallets.map(item => (
                  <article key={floatWalletKey(item)} className={styles.assetCard}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardHeading}>
                        <span className={styles.assetName}>{item.asset}</span>
                        <span className={styles.networkBadge}>{formatNetworkLabel(item.network)}</span>
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

                {Array.from({ length: emptySlotCount }, (_, index) => (
                  <EmptyAssetSlot
                    key={`empty-slot-${index}`}
                    loading={isLoading && floatWallets.length === 0}
                    canAct={canAct}
                    onAdd={() => setIssueOpen(true)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {cryptoFloatEnabled && floatWallets.length > 0 && (
          <div className={styles.footer}>
            <span className={styles.footerCount}>
              {floatWallets.length} wallet{floatWallets.length === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>

      <IssueCryptoFloatWalletSheet
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        onCreated={() => {
          refreshAssets()
        }}
      />

      <UsdDepositSheet
        open={Boolean(depositWallet)}
        onClose={() => setDepositWallet(null)}
        mode="crypto-only"
        cryptoDeposit={
          depositWallet
            ? {
                asset: depositWallet.asset,
                network: depositWallet.network,
                deposit_address: depositWallet.deposit_address,
                min_deposit: '1',
              }
            : null
        }
        loading={false}
        onFunded={refreshAssets}
      />

      <UsdTransferSheet
        open={Boolean(transferWallet)}
        onClose={() => setTransferWallet(null)}
        availableUsd={transferAvailableUsd}
        floatWallet={transferWallet}
        pinReady={Boolean(wallet?.wallet_pin_changed)}
        canAct={canAct}
        onTransferred={refreshAssets}
      />
    </>
  )
}
