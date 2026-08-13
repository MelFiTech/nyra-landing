import { useRef, useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Button from '../components/ui/Button'
import DepositModal from '../components/treasury/DepositModal'
import TransferModal from '../components/treasury/TransferModal'
import ChatPanel from '../components/dashboard/ChatPanel'
import PinSetupModal from '../components/dashboard/PinSetupModal'
import TransactionDrawer, { type Transaction } from '../components/treasury/TransactionDrawer'
import { useBalance } from '../context/BalanceContext'
import { useBusiness, usePermissions } from '../context/BusinessContext'
import { useBusinessWallet, useTransactions } from '../hooks/useAppData'
import { mapApiTransaction } from '../lib/mapTransaction'
import type { Transaction as ApiTransaction } from '../lib/api'
import TrendSparkline from '../components/dashboard/TrendSparkline'
import styles from './DashboardPage.module.css'

function naira(value: number | string | undefined | null) {
  const n = Number(value ?? 0)
  return `₦ ${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function compactNaira(value: number | string | undefined | null) {
  const n = Number(value ?? 0)
  const abs = Math.abs(n)
  const prefix = n < 0 ? '-₦ ' : '₦ '

  if (abs >= 1_000_000) {
    const m = abs / 1_000_000
    const formatted = m >= 100 ? m.toFixed(0) : m >= 10 ? m.toFixed(1) : m.toFixed(2)
    return `${prefix}${formatted.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1')}M`
  }
  if (abs >= 1_000) {
    const k = abs / 1_000
    const formatted = k >= 100 ? k.toFixed(0) : k >= 10 ? k.toFixed(1) : k.toFixed(2)
    return `${prefix}${formatted.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1')}K`
  }
  return naira(n)
}

function txCurrency(tx: ApiTransaction) {
  return (tx.currency ?? 'NGN').toUpperCase()
}

function formatTxAmount(tx: ApiTransaction) {
  const prefix = tx.transaction_type === 'CREDIT' ? '+' : '-'
  const amount = Math.abs(Number(tx.amount ?? 0))
  return `${prefix}${naira(amount)}`
}

const METRIC_CHART = { width: 48, height: 20 }

function formatDate(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

const DepositIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const TransferIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/>
    <polyline points="7 7 17 7 17 17"/>
  </svg>
)

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

const SearchIllustration = () => (
  <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.emptyIllustration}>
    <rect x="10" y="20" width="70" height="8" rx="4" className={styles.illuBar1}/>
    <rect x="10" y="34" width="55" height="6" rx="3" className={styles.illuBar2}/>
    <rect x="10" y="46" width="62" height="6" rx="3" className={styles.illuBar2}/>
    <circle cx="90" cy="38" r="22" className={styles.illuCircleStroke} strokeWidth="3" fill="none"/>
    <line x1="106" y1="54" x2="116" y2="64" className={styles.illuLine} strokeWidth="3" strokeLinecap="round"/>
    <circle cx="90" cy="38" r="14" className={styles.illuCircleFill}/>
  </svg>
)


export default function DashboardPage() {
  const queryClient = useQueryClient()
  const { business } = useBusiness()
  const { canAct } = usePermissions()
  const { visible: balanceVisible, toggle: toggleBalance } = useBalance()
  // const verificationStatus = business?.verification_status
  // const showVerificationBanner =
  //   verificationStatus === 'NOT_STARTED' || verificationStatus === 'REJECTED'
  const [depositOpen, setDepositOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const { data: wallet } = useBusinessWallet()
  const { data: transactions = [] } = useTransactions({ page_size: 50 })

  const walletTransactions = useMemo(
    () => transactions.filter(tx => txCurrency(tx) === 'NGN'),
    [transactions],
  )

  useEffect(() => {
    if (wallet && !wallet.wallet_pin_changed) setPinModalOpen(true)
  }, [wallet])

  const floatAccounts = wallet?.sub_wallets?.filter(sw => sw.is_business_float) ?? []
  const sourceAccountNumber = floatAccounts[0]?.account_number ?? ''
  const canTransfer = canAct && Boolean(sourceAccountNumber) && Boolean(wallet?.wallet_pin_changed) && !wallet?.frozen
  const canDeposit = canAct
  const unsettled = floatAccounts.reduce((sum, sw) => sum + Number(sw.staged_balance ?? 0), 0)
  const available = Number(wallet?.balance ?? 0)
  const total = available + unsettled

  const metrics = [
    { label: 'Total Inflow', trend: 'up' as const, value: compactNaira(wallet?.total_credit), data: [3, 5, 4, 7, 6, 9, 11], masked: true },
    { label: 'Total Outflow', trend: 'down' as const, value: compactNaira(wallet?.total_debit), data: [9, 8, 10, 7, 6, 5, 4], masked: true },
    { label: 'Transactions', trend: 'up' as const, value: String(walletTransactions.length), data: [0, 0, 0, 0, 0, 0, 0], masked: false },
  ]

  const [leftPct, setLeftPct] = useState(62)
  const gridRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const onDragStart = useCallback(() => {
    dragging.current = true
    document.documentElement.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current || !gridRef.current) return
      const rect = gridRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setLeftPct(Math.min(62, Math.max(38, pct)))
    }
    function onUp() {
      dragging.current = false
      document.documentElement.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return (
    <>
      {/* {showVerificationBanner && (
        <AlertBanner
          centered
          actionLabel="Verify now"
          onClick={() => navigate('/app/compliance')}
        >
          Your business is not yet verified. Complete KYB compliance to unlock full transaction limits.
        </AlertBanner>
      )} */}
      <div className={styles.content}>
        <h1 className={styles.greeting}>Hello, {business?.name ?? 'Mel-Fi Technology Limited'}</h1>

        <div className={styles.grid} ref={gridRef}>
          {/* Left: Wallet card + actions + transactions */}
          <div className={styles.leftCol} style={{ width: `${leftPct}%`, flexShrink: 0 }}>
            <div className={styles.walletCard}>
              <div className={styles.walletTop}>
                <div className={styles.currencyBadge}>
                  <GlobeIcon />
                  <span>NGN</span>
                </div>
              </div>

              <div className={styles.walletBody}>
                <div className={styles.walletBg} />
                <div className={styles.walletInfo}>
                  <div className={styles.balanceLabel}>
                    Available Balance
                    <span className={styles.infoIcon}><InfoIcon /></span>
                  </div>
                  <div className={styles.balanceAmount}>
                    {balanceVisible ? naira(available) : '₦ ••••'}
                    <Button variant="icon" className={styles.eyeBtn} onClick={toggleBalance}>
                      <EyeOffIcon />
                    </Button>
                  </div>
                </div>

                <div className={styles.walletBottom}>
                  <div className={styles.balanceRow}>
                    <div>
                      <div className={styles.subLabel}>Total Balance</div>
                      <div className={styles.subAmount}>
                        {balanceVisible ? naira(total) : '₦ ••••'}
                      </div>
                    </div>
                    <div>
                      <div className={styles.subLabel}>Unsettled Balance</div>
                      <div className={styles.subAmount}>
                        {balanceVisible ? naira(unsettled) : '₦ ••••'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.walletActions}>
                    <Button
                      variant="ghost"
                      className={styles.walletActionBtn}
                      onClick={() => setDepositOpen(true)}
                      disabled={!canDeposit}
                      title={!canDeposit ? 'Only the business owner can deposit' : undefined}
                    >
                      <div className={styles.actionIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <DepositIcon />
                      </div>
                      <span className={styles.walletActionLabel}>Deposit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className={styles.walletActionBtn}
                      onClick={() => setTransferOpen(true)}
                      disabled={!canTransfer}
                      title={
                        !canAct
                          ? 'Only the business owner can transfer'
                          : !sourceAccountNumber
                          ? 'Deposit account not ready'
                          : wallet?.frozen
                            ? 'Wallet is frozen'
                            : !wallet?.wallet_pin_changed
                              ? 'Set your transaction PIN first'
                              : undefined
                      }
                    >
                      <div className={styles.actionIcon} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                        <TransferIcon />
                      </div>
                      <span className={styles.walletActionLabel}>Transfer</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.metrics}>
              {metrics.map(metric => (
                <div key={metric.label} className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>{metric.label}</span>
                    <span className={`${styles.metricTrend} ${styles[`metricTrend${metric.trend === 'up' ? 'Up' : 'Down'}`]}`}>
                      {metric.trend === 'up' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                          <polyline points="17 18 23 18 23 12" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className={styles.metricBody}>
                    <span className={styles.metricValue}>
                      {metric.masked && !balanceVisible ? '₦ ••••' : metric.value}
                    </span>
                    <span className={styles.metricChart}>
                      <TrendSparkline
                        data={metric.data}
                        trend={metric.trend}
                        width={METRIC_CHART.width}
                        height={METRIC_CHART.height}
                      />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent transactions — same width as wallet */}
            <section className={styles.txSection}>
              <h2 className={styles.txTitle}>Recent transactions</h2>
              {walletTransactions.length === 0 ? (
                <div className={styles.emptyState}>
                  <SearchIllustration />
                  <p className={styles.emptyTitle}>No transactions</p>
                  <p className={styles.emptySub}>No transactions yet.</p>
                </div>
              ) : (
                <ul className={styles.txList}>
                  {walletTransactions.map(tx => (
                    <li
                      key={tx.transaction_id}
                      className={styles.txRow}
                      onClick={() => setSelectedTx(mapApiTransaction(tx))}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedTx(mapApiTransaction(tx))
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View transaction: ${tx.description || tx.transaction_reference}`}
                    >
                      <div
                        className={styles.txIcon}
                        data-credit={tx.transaction_type === 'CREDIT' || undefined}
                      >
                        {tx.transaction_type === 'CREDIT' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                          </svg>
                        )}
                      </div>
                      <div className={styles.txMeta}>
                        <span className={styles.txDesc}>{tx.description || tx.transaction_reference}</span>
                        <span className={styles.txDate}>{formatDate(tx.created_at)}</span>
                      </div>
                      <div className={styles.txRight}>
                        <span
                          className={styles.txAmount}
                          data-credit={tx.transaction_type === 'CREDIT' || undefined}
                        >
                          {balanceVisible ? formatTxAmount(tx) : '₦ ••••'}
                        </span>
                        <span className={styles.txStatus} data-status={tx.transaction_status?.toLowerCase()}>
                          {tx.transaction_status?.toLowerCase()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Drag handle */}
          <div className={styles.dragHandle} onMouseDown={onDragStart} />

          {/* Right: AI Chat */}
          <div className={styles.rightCol}>
            <ChatPanel onOpenTransfer={() => setTransferOpen(true)} />
          </div>
        </div>
      </div>

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        accounts={floatAccounts.map(a => ({
          bank_name: a.bank,
          account_number: a.account_number,
          account_name: a.owners_fullname,
        }))}
      />
      <TransferModal
        open={transferOpen}
        onClose={() => {
          setTransferOpen(false)
          queryClient.invalidateQueries()
        }}
        sourceAccountNumber={sourceAccountNumber}
        pinReady={Boolean(wallet?.wallet_pin_changed)}
      />
      {business && canAct && (
        <PinSetupModal
          open={pinModalOpen}
          businessId={business.id}
          onComplete={() => setPinModalOpen(false)}
        />
      )}
      <TransactionDrawer tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </>
  )
}
