import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../ui/Button'
import BankLogo from '../ui/BankLogo'
import { useBalance } from '../../context/BalanceContext'
import { useBusiness } from '../../context/BusinessContext'
import { transactionsApi } from '../../lib/api'
import { findBank, getCachedBanks, loadBanks } from '../../lib/banks'
import { mapApiTransaction } from '../../lib/mapTransaction'
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

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
)

const BoltIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const TvIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2"/>
    <polyline points="17 2 12 7 7 2"/>
  </svg>
)

const TicketIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
    <path d="M13 5v2M13 17v2M13 11v2"/>
  </svg>
)

const GiftIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
)

const ArrowIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/>
    <polyline points="7 7 17 7 17 17"/>
  </svg>
)

export type TransactionParty = {
  label: string
  name: string
  bankName?: string
  bankCode?: string
  accountNumber?: string
}

export type TransactionDetailField = {
  label: string
  value: string
  copyable?: boolean
}

export type Transaction = {
  id: string
  title: string
  dot: 'green' | 'red'
  fromTo: string
  method: string
  amount: string
  amountRaw: string
  amountType: 'credit' | 'debit'
  currency: 'NGN' | 'USD'
  date: string
  processedAt: string
  status: 'successful' | 'failed' | 'pending'
  reference: string
  counterparty: string
  fee: string
  summary: string
  wallet: string
  category?: string
  channel?: string
  transactionType: 'credit' | 'debit'
  party?: TransactionParty
  /** Bill / VAS identifiers from meta (phone, meter, smartcard, token, …) */
  detailFields?: TransactionDetailField[]
  customerName?: string
  timeline: { label: string; date: string; type: 'neutral' | 'success' | 'fail' }[]
  prevBalance: string
  currBalance: string
}

type Props = {
  tx: Transaction | null
  onClose: () => void
}

function hasValue(value?: string | null): value is string {
  return Boolean(value && value !== '—')
}

function heroIconForTitle(title: string) {
  const t = title.toLowerCase()
  if (t.includes('airtime') || t.includes('data')) return <PhoneIcon />
  if (t.includes('electricity')) return <BoltIcon />
  if (t.includes('tv')) return <TvIcon />
  if (t.includes('betting')) return <TicketIcon />
  if (t.includes('cashback')) return <GiftIcon />
  return <ArrowIcon />
}

function CopyableValue({
  value,
  copied,
  onCopy,
}: {
  value: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className={styles.copyRow}>
      <span className={styles.copyText}>{value}</span>
      <button
        type="button"
        className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
        onClick={onCopy}
        aria-label={copied ? 'Copied' : 'Copy'}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  )
}

export default function TransactionDrawer({ tx, onClose }: Props) {
  const { visible } = useBalance()
  const { businessId } = useBusiness()
  const [detail, setDetail] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [banks, setBanks] = useState(() => getCachedBanks())
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const display = detail ?? tx
  const mask = (val: string) => visible ? val : '••••••'

  const heroBank = useMemo(() => {
    if (!display?.party) return undefined
    return findBank(banks, {
      bankCode: display.party.bankCode,
      bankName: display.party.bankName,
    })
  }, [banks, display?.party])

  const partyBankName = heroBank?.bank_name || display?.party?.bankName
  const showBankAvatar = Boolean(heroBank)
  const showBankDetail = Boolean(heroBank || hasValue(display?.party?.bankName))

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    void loadBanks()
      .then(setBanks)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!tx?.id || !businessId) {
      setDetail(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setCopiedKey(null)

    transactionsApi
      .get(tx.id, businessId)
      .then(apiTx => {
        if (cancelled) return
        setDetail(mapApiTransaction(apiTx))
      })
      .catch(() => {
        if (cancelled) return
        setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tx?.id, businessId])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedKey(key)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopiedKey(null), 1500)
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${tx ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.drawer} ${tx ? styles.drawerOpen : ''}`}>
        {display && (
          <>
            <div className={styles.header}>
              <span className={styles.headerTitle}>{display.title}</span>
              <Button variant="icon" onClick={onClose}><CloseIcon /></Button>
            </div>

            {loading && <div className={styles.loadingBar} aria-hidden />}

            <div className={styles.hero}>
              {showBankAvatar && heroBank ? (
                <BankLogo bank={heroBank} size={52} fill className={styles.heroBankLogo} />
              ) : (
                <div className={styles.heroAvatar} aria-hidden>
                  {heroIconForTitle(display.title)}
                </div>
              )}
              <div className={`${styles.heroAmount} ${display.amountType === 'credit' ? styles.heroAmountCredit : styles.heroAmountDebit}`}>
                {mask(display.amountRaw)}
              </div>
              {display.fromTo !== '—' && (
                <div className={styles.heroSub}>{display.fromTo}</div>
              )}
            </div>

            <div className={styles.body}>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Date & time</span>
                <span className={styles.metaValue}>{display.processedAt}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Method</span>
                <span className={styles.metaValue}>{display.method}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Wallet</span>
                <span className={styles.metaValue}>{display.wallet}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                {display.status === 'successful' ? (
                  <span className={styles.badgeSuccess}>
                    <span className={styles.statusDot} style={{ background: BRAND }} />
                    Successful
                  </span>
                ) : display.status === 'failed' ? (
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
              {display.channel && display.channel !== '—' && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Channel</span>
                  <span className={styles.metaValue}>{display.channel}</span>
                </div>
              )}
              {display.category && display.category !== '—' && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Category</span>
                  <span className={styles.metaValue}>{display.category}</span>
                </div>
              )}
            </div>

            {(display.party ||
              display.customerName ||
              (display.detailFields && display.detailFields.length > 0)) && (
              <>
                <div className={styles.divider} />
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Payment details</div>

                  {display.party && (
                    <>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>{display.party.label}</span>
                        <span className={styles.detailValue}>{display.party.name}</span>
                      </div>

                      {showBankDetail && hasValue(partyBankName) && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Bank</span>
                          <div className={styles.bankRow}>
                            <BankLogo
                              bank={heroBank ?? { bank_name: partyBankName }}
                              size={28}
                            />
                            <span className={styles.detailValue}>{partyBankName}</span>
                          </div>
                        </div>
                      )}

                      {hasValue(display.party.accountNumber) && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Account number</span>
                          <CopyableValue
                            value={display.party.accountNumber}
                            copied={copiedKey === 'party-account'}
                            onCopy={() => copyText('party-account', display.party!.accountNumber!)}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {display.detailFields?.map(field => (
                    <div key={`${field.label}-${field.value}`} className={styles.detailRow}>
                      <span className={styles.detailLabel}>{field.label}</span>
                      {field.copyable ? (
                        <CopyableValue
                          value={field.value}
                          copied={copiedKey === `field-${field.label}`}
                          onCopy={() => copyText(`field-${field.label}`, field.value)}
                        />
                      ) : (
                        <span className={styles.detailValue}>{field.value}</span>
                      )}
                    </div>
                  ))}

                  {hasValue(display.customerName) && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Customer</span>
                      <span className={styles.detailValue}>{display.customerName}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className={styles.divider} />

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Details</div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Reference</span>
                <CopyableValue
                  value={display.reference}
                  copied={copiedKey === 'reference'}
                  onCopy={() => copyText('reference', display.reference)}
                />
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Fee</span>
                <span className={styles.detailValue}>{display.fee}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Summary</span>
                <span className={`${styles.detailValue} ${styles.detailValueSummary}`}>{display.summary}</span>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Timeline</div>
              <div className={styles.timeline}>
                {display.timeline.map((item, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <span
                      className={styles.timelineDot}
                      style={{
                        background: item.type === 'success' ? BRAND : item.type === 'fail' ? '#dc2626' : '#9ca3af'
                      }}
                    />
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineLabel}>{item.label}</span>
                      <span className={styles.timelineDate}>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            </div>

            <div className={styles.balanceFooter}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Balance Summary</div>
                <div className={styles.balanceGrid}>
                  <div className={styles.balanceItem}>
                    <span className={styles.balanceLabel}>Previous Balance</span>
                    <span className={styles.balanceValue}>{mask(display.prevBalance)}</span>
                  </div>
                  <div className={styles.balanceItem}>
                    <span className={styles.balanceLabel}>Current Balance</span>
                    <span className={styles.balanceValue}>{mask(display.currBalance)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
