import { useEffect } from 'react'
import Button from '../ui/Button'
import { useBalance } from '../../context/BalanceContext'
import { BRAND } from '../../lib/brand'
import styles from './TransactionDrawer.module.css'

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

export type Transaction = {
  id: string
  dot: 'green' | 'red'
  fromTo: string
  method: string
  amount: string
  amountRaw: string
  amountType: 'credit' | 'debit'
  date: string
  status: 'successful' | 'failed' | 'pending'
  reference: string
  counterparty: string
  fee: string
  summary: string
  wallet: string
  timeline: { label: string; date: string; type: 'neutral' | 'success' | 'fail' }[]
  prevBalance: string
  currBalance: string
}

type Props = {
  tx: Transaction | null
  onClose: () => void
}

export default function TransactionDrawer({ tx, onClose }: Props) {
  const { visible } = useBalance()
  const mask = (val: string) => visible ? val : '••••••'
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function copyText(text: string) {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${tx ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.drawer} ${tx ? styles.drawerOpen : ''}`}>
        {tx && (
          <>
            <div className={styles.header}>
              <span className={styles.headerTitle}>Transaction Details</span>
              <Button variant="icon" onClick={onClose}><CloseIcon /></Button>
            </div>

            {/* Top hero */}
            <div className={styles.hero}>
              <div className={`${styles.heroAvatar} ${tx.amountType === 'credit' ? styles.heroAvatarCredit : styles.heroAvatarDebit}`}>
                {tx.fromTo === '—' ? 'U' : tx.fromTo.charAt(0).toUpperCase()}
              </div>
              <div className={`${styles.heroAmount} ${tx.amountType === 'credit' ? styles.heroAmountCredit : styles.heroAmountDebit}`}>
                {mask(tx.amountRaw)}
              </div>
              {tx.fromTo !== '—' && (
                <div className={styles.heroSub}>{tx.fromTo}</div>
              )}
            </div>

            <div className={styles.divider} />

            {/* Meta grid */}
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Processed on</span>
                <span className={styles.metaValue}>{tx.date.replace(/,.*/, '')}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Method</span>
                <span className={styles.metaValue}>{tx.method}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Wallets</span>
                <span className={styles.metaValue}>{tx.wallet}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                {tx.status === 'successful' ? (
                  <span className={styles.badgeSuccess}>
                    <span className={styles.statusDot} style={{ background: BRAND }} />
                    Successful
                  </span>
                ) : tx.status === 'failed' ? (
                  <span className={styles.badgeFailed}>
                    <span className={styles.statusDot} style={{ background: '#dc2626' }} />
                    Failed
                  </span>
                ) : (
                  <span className={styles.badgeFailed} style={{ background: '#fffbeb', color: '#d97706' }}>
                    <span className={styles.statusDot} style={{ background: '#d97706' }} />
                    Pending
                  </span>
                )}
              </div>
            </div>

            <div className={styles.divider} />

            {/* Details */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Details</div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Reference</span>
                <div className={styles.refPill}>
                  <span className={styles.refText}>{tx.reference}</span>
                  <Button variant="icon" onClick={() => copyText(tx.reference)}>
                    <CopyIcon />
                  </Button>
                </div>
              </div>

              {tx.counterparty && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Counterparty</span>
                  <span className={styles.detailValue}>{tx.counterparty}</span>
                </div>
              )}

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Fee</span>
                <span className={styles.detailValue}>{tx.fee}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Summary</span>
                <span className={`${styles.detailValue} ${styles.detailValueSummary}`}>{tx.summary}</span>
              </div>
            </div>

            <div className={styles.divider} />

            {/* Timeline */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Timeline</div>
              <div className={styles.timeline}>
                {tx.timeline.map((item, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <span
                      className={styles.timelineDot}
                      style={{
                        background: item.type === 'success' ? BRAND : item.type === 'fail' ? '#dc2626' : '#9ca3af'
                      }}
                    />
                    <span className={styles.timelineLabel}>{item.label}</span>
                    <span className={styles.timelineDate}>{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.divider} />

            {/* Balance Summary */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Balance Summary</div>
              <div className={styles.balanceGrid}>
                <div className={styles.balanceItem}>
                  <span className={styles.balanceLabel}>Previous Balance</span>
                  <span className={styles.balanceValue}>{mask(tx.prevBalance)}</span>
                </div>
                <div className={styles.balanceItem}>
                  <span className={styles.balanceLabel}>Current Balance</span>
                  <span className={styles.balanceValue}>{mask(tx.currBalance)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
