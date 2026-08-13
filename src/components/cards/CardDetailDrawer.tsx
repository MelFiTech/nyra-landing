import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import NyraLogo from '../ui/NyraLogo'
import PinEntry from '../treasury/PinEntry'
import { useBalance } from '../../context/BalanceContext'
import { useBusiness } from '../../context/BusinessContext'
import { useToast } from '../../context/ToastContext'
import { ApiError, cardsApi, type CardSensitiveDetails, type CardSpendTransaction, type VirtualCard } from '../../lib/api'
import styles from './CardDetailDrawer.module.css'
import fundStyles from './FundCardSheet.module.css'

type View = 'card' | 'transactions' | 'pin' | 'fund' | 'withdraw'
type AmountFlowStep = 'amount' | 'pin' | 'success'

const MIN_FLOW_AMOUNT = 1

const FlowSuccessIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

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

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const FreezeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
    <path d="M12 10v8M8 14h8"/>
  </svg>
)

const TransactionsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>
)

type Props = {
  card: VirtualCard | null
  onClose: () => void
  onUpdate: (card: VirtualCard) => void
  onRefresh?: () => void
  canManage?: boolean
}

type PinAction = 'freeze' | 'unfreeze' | 'details' | 'terminate'

type DisplayTransaction = {
  refId: string
  type: string
  amount: string
  merchant: string
  entry: 'Debit' | 'Credit'
  status: 'Success' | 'Failed' | 'Pending'
  description: string
  date: string
}

function usd(value: number | string | undefined | null) {
  const n = Number(value ?? 0)
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function maskCardNumber(lastFour: string, short = false) {
  if (short) return `•••• ${lastFour}`
  return `•••• •••• •••• ${lastFour}`
}

function networkLogoSrc(network?: string) {
  const n = (network ?? 'VISA').toUpperCase()
  if (n.includes('MASTER')) return '/card-networks/mastercard.svg'
  return '/card-networks/visa.svg'
}

function networkLabel(network?: string) {
  const n = (network ?? 'VISA').toUpperCase()
  if (n.includes('MASTER')) return 'Mastercard'
  return 'Visa'
}

function formatCardNumber(value: string) {
  return value.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function formatTxDate(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function mapCardTransaction(tx: CardSpendTransaction): DisplayTransaction {
  const statusRaw = String(tx.transaction_status ?? '').toLowerCase()
  const status: DisplayTransaction['status'] =
    statusRaw.includes('pending') ? 'Pending'
    : statusRaw.includes('fail') ? 'Failed'
    : 'Success'
  const entry: DisplayTransaction['entry'] =
    String(tx.transaction_type ?? '').toUpperCase() === 'CREDIT' ? 'Credit' : 'Debit'

  return {
    refId: String(
      tx.transaction_reference_provider
      ?? tx.transaction_reference
      ?? tx.transaction_id
      ?? '—',
    ),
    type: String(tx.transaction_category ?? 'Card'),
    amount: String(tx.amount ?? '0'),
    merchant: String(tx.payment_provider ?? tx.channel ?? '—'),
    entry,
    status,
    description: String(tx.description ?? '—'),
    date: formatTxDate(tx.created_at ? String(tx.created_at) : undefined),
  }
}

function computeSpentThisMonth(transactions: CardSpendTransaction[]): number {
  return transactions.reduce((sum, tx) => {
    if (String(tx.transaction_type ?? '').toUpperCase() === 'CREDIT') return sum
    const category = String(tx.transaction_category ?? '').toLowerCase()
    const description = String(tx.description ?? '').toLowerCase()
    if (category.includes('fund') || category.includes('withdraw')) return sum
    if (description.includes('fund') || description.includes('withdraw')) return sum
    return sum + Math.abs(Number(tx.amount ?? 0))
  }, 0)
}

function pinActionLabel(action: PinAction | null) {
  if (action === 'freeze') return 'Confirm freeze'
  if (action === 'unfreeze') return 'Confirm unfreeze'
  if (action === 'terminate') return 'Terminate card'
  return 'Show card details'
}

function pinActionSubtitle(action: PinAction | null) {
  if (action === 'details') return 'Enter your wallet PIN to reveal card details'
  if (action === 'terminate') return 'Enter your wallet PIN to permanently terminate this card'
  if (action === 'freeze') return 'Enter your wallet PIN to freeze this card'
  if (action === 'unfreeze') return 'Enter your wallet PIN to unfreeze this card'
  return 'Enter your wallet PIN'
}

function TxStatus({ status }: { status: DisplayTransaction['status'] }) {
  if (status === 'Pending') {
    return (
      <span className={styles.statusPending}>
        <span className={styles.statusPendingDot} />
        Pending
      </span>
    )
  }
  return <span className={styles.statusText}>{status}</span>
}

export default function CardDetailDrawer({ card, onClose, onUpdate, onRefresh, canManage = true }: Props) {
  const { visible: balanceVisible } = useBalance()
  const { businessId } = useBusiness()
  const { showToast } = useToast()
  const [view, setView] = useState<View>('card')
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [sensitiveDetails, setSensitiveDetails] = useState<CardSensitiveDetails | null>(null)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [amountFlowStep, setAmountFlowStep] = useState<AmountFlowStep>('amount')
  const [flowAmount, setFlowAmount] = useState('')
  const [flowPinLoading, setFlowPinLoading] = useState(false)
  const [pinAction, setPinAction] = useState<PinAction | null>(null)
  const [pinLoading, setPinLoading] = useState(false)
  const [spentThisMonth, setSpentThisMonth] = useState<number | null>(null)
  const [spentLoading, setSpentLoading] = useState(false)
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  const isFrozen = card?.status === 'FROZEN'
  const isTerminated = card?.status === 'TERMINATED'
  const network = card?.network ?? 'VISA'
  const cardBalance = Number(card?.balance ?? 0)
  const maxWithdrawAmount =
    Number.isFinite(cardBalance) && cardBalance > 0 ? cardBalance : undefined
  const parsedFlowAmount = Number(flowAmount)
  const flowAmountValid =
    flowAmount !== ''
    && parsedFlowAmount >= MIN_FLOW_AMOUNT
    && (view !== 'withdraw' || maxWithdrawAmount == null || parsedFlowAmount <= maxWithdrawAmount)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (moreMenuOpen) {
        setMoreMenuOpen(false)
        return
      }
      if (view === 'transactions' || view === 'pin' || view === 'fund' || view === 'withdraw') {
        if (view === 'fund' || view === 'withdraw') {
          if (amountFlowStep === 'pin') {
            setAmountFlowStep('amount')
            return
          }
          setAmountFlowStep('amount')
          setFlowAmount('')
        }
        setView('card')
        setPinAction(null)
        return
      }
      onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, view, moreMenuOpen, amountFlowStep])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
      }
    }
    if (moreMenuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [moreMenuOpen])

  useEffect(() => {
    if (!card) {
      setView('card')
      setDetailsVisible(false)
      setSensitiveDetails(null)
      setMoreMenuOpen(false)
      setAmountFlowStep('amount')
      setFlowAmount('')
      setPinAction(null)
      setTransactions([])
      setSpentThisMonth(null)
    }
  }, [card])

  useEffect(() => {
    setView('card')
    setDetailsVisible(false)
    setSensitiveDetails(null)
    setMoreMenuOpen(false)
    setAmountFlowStep('amount')
    setFlowAmount('')
    setPinAction(null)
    setCopiedKey(null)
    setTransactions([])
    setSpentThisMonth(null)
  }, [card?.card_id])

  useEffect(() => {
    if (!card || !businessId) return

    const monthYear = new Date().toISOString().slice(0, 7)
    setSpentLoading(true)
    cardsApi.listTransactions(businessId, {
      card_id: card.card_id,
      page: 1,
      monthYear,
      page_size: 100,
    })
      .then(res => setSpentThisMonth(computeSpentThisMonth(res.list)))
      .catch(() => setSpentThisMonth(0))
      .finally(() => setSpentLoading(false))
  }, [card?.card_id, businessId])

  useEffect(() => {
    if (view !== 'transactions' || !card || !businessId) return

    const monthYear = new Date().toISOString().slice(0, 7)
    setTransactionsLoading(true)
    cardsApi.listTransactions(businessId, {
      card_id: card.card_id,
      page: 1,
      monthYear,
      page_size: 50,
    })
      .then(res => {
        setTransactions(
          res.list.map((tx: CardSpendTransaction) => mapCardTransaction(tx)),
        )
      })
      .catch(() => {
        showToast('Could not load card transactions')
      })
      .finally(() => setTransactionsLoading(false))
  }, [view, card?.card_id, businessId, showToast])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  function copyText(key: string, text: string, message: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedKey(key)
    showToast(message)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopiedKey(null), 1500)
  }

  function toggleFreeze() {
    if (!card || isTerminated || !canManage) return
    setPinAction(isFrozen ? 'unfreeze' : 'freeze')
    setView('pin')
  }

  function requestDetailsToggle() {
    if (!card) return
    if (detailsVisible) {
      setDetailsVisible(false)
      return
    }
    setPinAction('details')
    setView('pin')
  }

  async function handlePinConfirm(pin: string) {
    if (!card || !businessId || !pinAction) return
    setPinLoading(true)
    try {
      if (pinAction === 'freeze') {
        await cardsApi.freeze(businessId, { card_id: card.card_id, wallet_pin: pin })
        onUpdate({ ...card, status: 'FROZEN' })
        showToast('Card frozen')
      } else if (pinAction === 'unfreeze') {
        await cardsApi.unfreeze(businessId, { card_id: card.card_id, wallet_pin: pin })
        onUpdate({ ...card, status: 'ACTIVE' })
        showToast('Card unfrozen')
      } else if (pinAction === 'terminate') {
        await cardsApi.terminate(businessId, { card_id: card.card_id, wallet_pin: pin })
        showToast('Card terminated')
        setPinAction(null)
        setView('card')
        onRefresh?.()
        onClose()
        return
      } else {
        const details = await cardsApi.getDetails(businessId, card.card_id, pin)
        setSensitiveDetails(details)
        setDetailsVisible(true)
        if (details.balance) {
          onUpdate({ ...card, balance: details.balance })
        }
      }
      setPinAction(null)
      setView('card')
      onRefresh?.()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Action failed')
    } finally {
      setPinLoading(false)
    }
  }

  function terminateCard() {
    if (!card || isTerminated || !canManage) return
    setMoreMenuOpen(false)
    setPinAction('terminate')
    setView('pin')
  }

  function handleFunded() {
    onRefresh?.()
    if (card) {
      onUpdate({ ...card })
    }
  }

  function openFundView() {
    setMoreMenuOpen(false)
    setAmountFlowStep('amount')
    setFlowAmount('')
    setView('fund')
  }

  function openWithdrawView() {
    setMoreMenuOpen(false)
    setAmountFlowStep('amount')
    setFlowAmount(maxWithdrawAmount != null ? String(maxWithdrawAmount) : '')
    setView('withdraw')
  }

  function handleHeaderBack() {
    if (view === 'fund' || view === 'withdraw') {
      if (amountFlowStep === 'pin') {
        setAmountFlowStep('amount')
        return
      }
      setAmountFlowStep('amount')
      setFlowAmount('')
      setView('card')
      return
    }
    if (view === 'pin') {
      setPinAction(null)
      setView('card')
      return
    }
    if (view === 'transactions') {
      setView('card')
    }
  }

  function finishAmountFlow() {
    setAmountFlowStep('amount')
    setFlowAmount('')
    setView('card')
  }

  async function handleFlowPinConfirm(pin: string) {
    if (!flowAmountValid || !card || !businessId) return
    setFlowPinLoading(true)
    try {
      if (view === 'fund') {
        await cardsApi.topup(businessId, {
          card_id: card.card_id,
          amount: parsedFlowAmount,
          wallet_pin: pin,
        })
        handleFunded()
        setAmountFlowStep('success')
      } else if (view === 'withdraw') {
        await cardsApi.withdraw(businessId, {
          card_id: card.card_id,
          amount: parsedFlowAmount,
          wallet_pin: pin,
        })
        onRefresh?.()
        if (card) onUpdate({ ...card })
        setAmountFlowStep('success')
      }
    } catch (error) {
      showToast(
        error instanceof ApiError
          ? error.message
          : view === 'fund'
            ? 'Could not fund card'
            : 'Could not withdraw from card',
      )
    } finally {
      setFlowPinLoading(false)
    }
  }

  function drawerHeaderTitle() {
    if (view === 'transactions') return 'Transactions'
    if (view === 'pin') return pinActionLabel(pinAction)
    if (view === 'fund') {
      if (amountFlowStep === 'pin') return 'Confirm funding'
      if (amountFlowStep === 'success') return 'Funding successful'
      return 'Fund card'
    }
    if (view === 'withdraw') {
      if (amountFlowStep === 'pin') return 'Confirm withdrawal'
      if (amountFlowStep === 'success') return 'Withdrawal successful'
      return 'Withdraw from card'
    }
    return card?.cardholder_name ?? ''
  }

  function handleClose() {
    setView('card')
    setMoreMenuOpen(false)
    setAmountFlowStep('amount')
    setFlowAmount('')
    onClose()
  }

  const displayCardNumber = detailsVisible && sensitiveDetails?.card_number
    ? formatCardNumber(sensitiveDetails.card_number)
    : maskCardNumber(card?.last_four ?? '', true)
  const displayExpiry = detailsVisible && sensitiveDetails?.expiry
    ? sensitiveDetails.expiry
    : '••/••'
  const displayCvv = detailsVisible && sensitiveDetails?.cvv
    ? sensitiveDetails.cvv
    : '•••'

  const drawerClass = [
    styles.drawer,
    card ? styles.drawerOpen : '',
    view === 'transactions' ? styles.drawerWide : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <div
        className={`${styles.overlay} ${card ? styles.overlayVisible : ''}`}
        onClick={handleClose}
      />
      <div className={drawerClass}>
        {card && (
          <>
            <div className={styles.header}>
              {view !== 'card' && amountFlowStep !== 'success' ? (
                <button
                  type="button"
                  className={styles.headerBackBtn}
                  onClick={handleHeaderBack}
                  aria-label="Back"
                >
                  <BackIcon />
                </button>
              ) : (
                <span className={styles.headerSpacer} aria-hidden />
              )}
              <span className={styles.headerName}>{drawerHeaderTitle()}</span>
              <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            {view === 'pin' ? (
              <div className={styles.body}>
                <PinEntry
                  onConfirm={handlePinConfirm}
                  loading={pinLoading}
                  length={4}
                  subtitle={pinActionSubtitle(pinAction)}
                />
              </div>
            ) : view === 'fund' || view === 'withdraw' ? (
              <div className={styles.body}>
                <div key={`${view}-${amountFlowStep}`} className={fundStyles.morphContent}>
                  {amountFlowStep === 'pin' ? (
                    <PinEntry
                      onConfirm={handleFlowPinConfirm}
                      loading={flowPinLoading}
                      length={4}
                      subtitle={
                        view === 'fund'
                          ? `Confirm funding of ${usd(parsedFlowAmount)} to •••• ${card.last_four}`
                          : `Confirm withdrawal of ${usd(parsedFlowAmount)} from •••• ${card.last_four}`
                      }
                    />
                  ) : amountFlowStep === 'success' ? (
                    <div className={fundStyles.success}>
                      <div className={fundStyles.successIcon} aria-hidden>
                        <FlowSuccessIcon />
                      </div>
                      <div className={fundStyles.successTitle}>
                        {view === 'fund' ? 'Card funded' : 'Withdrawal complete'}
                      </div>
                      <div className={fundStyles.successAmount}>{usd(parsedFlowAmount)}</div>
                      <p className={fundStyles.successSub}>
                        {view === 'fund'
                          ? `${usd(parsedFlowAmount)} has been added to ${card.cardholder_name}'s card ending in ${card.last_four}.`
                          : `${usd(parsedFlowAmount)} was returned to your USD virtual card balance.`}
                      </p>
                      <Button variant="primary" fullWidth onClick={finishAmountFlow}>
                        Done
                      </Button>
                    </div>
                  ) : (
                    <div className={fundStyles.form}>
                      <p className={fundStyles.hint}>
                        {view === 'fund'
                          ? 'Add USD from your virtual card program balance to this card.'
                          : 'Move USD from this card back to your virtual card program balance.'}
                      </p>

                      <div className={fundStyles.cardTarget}>
                        <div>
                          <div className={fundStyles.cardTargetLabel}>Card</div>
                          <div className={fundStyles.cardTargetValue}>{card.cardholder_name}</div>
                        </div>
                        <div className={fundStyles.cardTargetValue}>
                          {view === 'withdraw' && maxWithdrawAmount != null
                            ? usd(maxWithdrawAmount)
                            : `•••• ${card.last_four}`}
                        </div>
                      </div>

                      <div className={fundStyles.field}>
                        <label className={fundStyles.label} htmlFor={`${view}-amount`}>
                          Amount
                        </label>
                        <div className={fundStyles.amountInputWrap}>
                          <span className={fundStyles.amountPrefix}>$</span>
                          <input
                            id={`${view}-amount`}
                            className={fundStyles.amountInput}
                            type="number"
                            inputMode="decimal"
                            placeholder="0.00"
                            min={MIN_FLOW_AMOUNT}
                            max={view === 'withdraw' ? maxWithdrawAmount : undefined}
                            step="0.01"
                            value={flowAmount}
                            onChange={e => setFlowAmount(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <span className={fundStyles.amountHint}>
                          {view === 'withdraw' && maxWithdrawAmount != null
                            ? `Available ${usd(maxWithdrawAmount)}`
                            : `Minimum ${usd(MIN_FLOW_AMOUNT)}`}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        disabled={!flowAmountValid}
                        onClick={() => setAmountFlowStep('pin')}
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : view === 'card' ? (
              <div className={styles.body}>
                <div className={styles.metricsRow}>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Spent this month</span>
                    <span className={styles.metricValue}>
                      {balanceVisible
                        ? spentLoading
                          ? '—'
                          : usd(spentThisMonth ?? 0)
                        : '$ ••••'}
                    </span>
                  </div>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Balance</span>
                    <span className={styles.metricValue}>
                      {balanceVisible ? usd(card.balance) : '$ ••••'}
                    </span>
                  </div>
                </div>

                <div className={styles.cardVisualWrap}>
                  <div className={`${styles.cardVisual} ${isFrozen ? styles.cardVisualFrozen : ''}`}>
                    <div className={styles.cardVisualTop}>
                      <NyraLogo variant="full" className={styles.cardNyraLogo} />
                      <img
                        src={networkLogoSrc(network)}
                        alt={networkLabel(network)}
                        className={styles.networkLogo}
                      />
                    </div>
                    <div className={styles.cardNumber}>
                      {displayCardNumber}
                    </div>
                    <div className={styles.cardVisualBottom}>
                      <span className={styles.cardHolderName}>{card.cardholder_name}</span>
                      <div className={styles.cardExpCvc}>
                        <span>Exp {displayExpiry}</span>
                        <span>CVC {displayCvv}</span>
                      </div>
                    </div>
                    {isFrozen && <div className={styles.frozenOverlay}>FROZEN</div>}
                  </div>
                </div>

                <div className={styles.quickActions}>
                  <div className={styles.quickActionsGroup}>
                    <button
                      type="button"
                      className={styles.quickAction}
                      disabled={isTerminated || !canManage}
                      onClick={toggleFreeze}
                    >
                      <span className={styles.quickActionIcon}><FreezeIcon /></span>
                      <span className={styles.quickActionLabel}>{isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                    </button>
                    <button
                      type="button"
                      className={styles.quickAction}
                      onClick={() => setView('transactions')}
                    >
                      <span className={styles.quickActionIcon}><TransactionsIcon /></span>
                      <span className={styles.quickActionLabel}>Transactions</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.quickAction} ${detailsVisible ? styles.quickActionActive : ''}`}
                      onClick={requestDetailsToggle}
                    >
                      <span className={styles.quickActionIcon}>
                        {detailsVisible ? <EyeIcon /> : <EyeOffIcon />}
                      </span>
                      <span className={styles.quickActionLabel}>
                        {detailsVisible ? 'Hide details' : 'Show details'}
                      </span>
                    </button>
                    <div
                      className={`${styles.quickActionWrap} ${moreMenuOpen ? styles.quickActionWrapOpen : ''}`}
                      ref={moreMenuRef}
                    >
                      <button
                        type="button"
                        className={`${styles.quickAction} ${moreMenuOpen ? styles.quickActionActive : ''}`}
                        disabled={isTerminated || !canManage}
                        aria-expanded={moreMenuOpen}
                        aria-haspopup="menu"
                        onClick={() => setMoreMenuOpen(v => !v)}
                      >
                        <span className={styles.quickActionIcon}><MoreIcon /></span>
                        <span className={styles.quickActionLabel}>More Actions</span>
                      </button>
                      {moreMenuOpen && (
                        <div className={styles.moreMenu} role="menu">
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.moreMenuItem}
                          onClick={openWithdrawView}
                        >
                          Withdraw from card
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.moreMenuItem}
                          onClick={openFundView}
                        >
                          Fund card
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.moreMenuItem}
                          onClick={() => {
                            showToast('Statement generation coming soon')
                            setMoreMenuOpen(false)
                          }}
                        >
                          Generate card statement
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.moreMenuItem}
                          onClick={terminateCard}
                        >
                          Terminate card
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                </div>

                <div className={styles.detailList}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Card ID</span>
                    <div className={styles.copyRow}>
                      <span className={`${styles.detailValue} ${styles.detailValueMono}`}>{card.card_id}</span>
                      <button
                        type="button"
                        className={`${styles.copyBtn} ${copiedKey === 'card-id' ? styles.copyBtnDone : ''}`}
                        onClick={() => copyText('card-id', card.card_id, 'Card ID copied')}
                        aria-label="Copy card ID"
                      >
                        {copiedKey === 'card-id' ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Card number</span>
                    <div className={styles.copyRow}>
                      <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
                        {displayCardNumber}
                      </span>
                      <button
                        type="button"
                        className={`${styles.copyBtn} ${copiedKey === 'card-number' ? styles.copyBtnDone : ''}`}
                        onClick={() => copyText(
                          'card-number',
                          detailsVisible && sensitiveDetails?.card_number
                            ? sensitiveDetails.card_number.replace(/\s/g, '')
                            : card.last_four,
                          'Card number copied',
                        )}
                        aria-label="Copy card number"
                      >
                        {copiedKey === 'card-number' ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Expiration date</span>
                    <span className={styles.detailValue}>{displayExpiry}</span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>CVV</span>
                    <span className={styles.detailValue}>{displayCvv}</span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Monthly spend limit</span>
                    <span className={styles.detailValue}>—</span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Card type</span>
                    <span className={styles.detailValue}>{networkLabel(network)}</span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Billing address</span>
                    <span className={styles.detailValue}>—</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.txBody}>
                <div className={styles.txToolbar}>
                  <button type="button" className={styles.backLink} onClick={() => setView('card')}>
                    <BackIcon />
                    Back to card
                  </button>
                  <button
                    type="button"
                    className={styles.statementBtn}
                    onClick={() => showToast('Statement generation coming soon')}
                  >
                    Generate card statement
                  </button>
                </div>

                <div className={styles.txTableWrap}>
                  <table className={styles.txTable}>
                    <thead>
                      <tr>
                        <th>Ref ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Merchant</th>
                        <th>Entry</th>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionsLoading ? (
                        <tr>
                          <td colSpan={8} className={styles.dateCell}>Loading transactions…</td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className={styles.dateCell}>No transactions for this month.</td>
                        </tr>
                      ) : (
                        transactions.map(tx => (
                        <tr key={tx.refId}>
                          <td>
                            <span className={styles.refPill}>
                              {tx.refId}
                              <button
                                type="button"
                                className={styles.copyBtn}
                                onClick={() => copyText(`ref-${tx.refId}`, tx.refId, 'Ref ID copied')}
                                aria-label="Copy ref ID"
                              >
                                {copiedKey === `ref-${tx.refId}` ? <CheckIcon /> : <CopyIcon />}
                              </button>
                            </span>
                          </td>
                          <td>{tx.type}</td>
                          <td>{tx.amount}</td>
                          <td className={styles.merchantCell} title={tx.merchant}>{tx.merchant}</td>
                          <td>
                            <span className={tx.entry === 'Debit' ? styles.entryDebit : styles.entryCredit}>
                              {tx.entry}
                            </span>
                          </td>
                          <td><TxStatus status={tx.status} /></td>
                          <td className={styles.descCell} title={tx.description}>{tx.description}</td>
                          <td className={styles.dateCell}>{tx.date}</td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
