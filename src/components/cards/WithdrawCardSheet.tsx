import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import PinEntry from '../treasury/PinEntry'
import SideSheetStack, { type SheetLayer } from '../treasury/SideSheetStack'
import { useBusiness } from '../../context/BusinessContext'
import { useToast } from '../../context/ToastContext'
import { ApiError, cardsApi } from '../../lib/api'
import type { VirtualCard } from '../../lib/api'
import styles from './FundCardSheet.module.css'

type Step = 'amount' | 'pin' | 'success'

type Props = {
  open: boolean
  onClose: () => void
  card: VirtualCard | null
  onWithdrawn?: () => void
}

const MIN_AMOUNT = 1

function usd(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function WithdrawCardSheet({ open, onClose, card, onWithdrawn }: Props) {
  const { businessId } = useBusiness()
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  const cardBalance = Number(card?.balance ?? 0)
  const maxAmount = Number.isFinite(cardBalance) && cardBalance > 0 ? cardBalance : undefined

  useEffect(() => {
    if (open) {
      setStep('amount')
      setAmount(maxAmount != null ? String(maxAmount) : '')
      setPinLoading(false)
    }
  }, [open, card?.card_id, maxAmount])

  const parsedAmount = Number(amount)
  const amountValid =
    amount !== ''
    && parsedAmount >= MIN_AMOUNT
    && (maxAmount == null || parsedAmount <= maxAmount)

  function handleClose() {
    onClose()
  }

  function handleBack() {
    if (step === 'pin') setStep('amount')
    else handleClose()
  }

  async function handlePinConfirm(pin: string) {
    if (!amountValid || !card || !businessId) return
    setPinLoading(true)
    try {
      await cardsApi.withdraw(businessId, {
        card_id: card.card_id,
        amount: parsedAmount,
        wallet_pin: pin,
      })
      onWithdrawn?.()
      setStep('success')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not withdraw from card')
    } finally {
      setPinLoading(false)
    }
  }

  const titles: Record<Step, string> = {
    amount: 'Withdraw from card',
    pin: 'Confirm withdrawal',
    success: 'Withdrawal successful',
  }

  const amountContent = (
    <div className={styles.form}>
      <p className={styles.hint}>
        Move USD from this card back to your virtual card program balance.
      </p>

      {card && (
        <div className={styles.cardTarget}>
          <div>
            <div className={styles.cardTargetLabel}>Card</div>
            <div className={styles.cardTargetValue}>{card.cardholder_name}</div>
          </div>
          <div className={styles.cardTargetValue}>
            {maxAmount != null ? usd(maxAmount) : '••••'}
          </div>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="withdraw-amount">Amount</label>
        <div className={styles.amountInputWrap}>
          <span className={styles.amountPrefix}>$</span>
          <input
            id="withdraw-amount"
            className={styles.amountInput}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min={MIN_AMOUNT}
            max={maxAmount}
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
          />
        </div>
        <span className={styles.amountHint}>
          {maxAmount != null ? `Available ${usd(maxAmount)}` : `Minimum ${usd(MIN_AMOUNT)}`}
        </span>
      </div>

      <Button
        variant="primary"
        fullWidth
        disabled={!amountValid}
        onClick={() => setStep('pin')}
      >
        Continue
      </Button>
    </div>
  )

  const pinContent = (
    <PinEntry
      key="withdraw-pin"
      onConfirm={handlePinConfirm}
      loading={pinLoading}
      length={4}
      subtitle={`Confirm withdrawal of ${usd(parsedAmount)} from •••• ${card?.last_four ?? ''}`}
    />
  )

  const successContent = (
    <div className={styles.success}>
      <div className={styles.successIcon} aria-hidden>
        <CheckIcon />
      </div>
      <div className={styles.successTitle}>Withdrawal complete</div>
      <div className={styles.successAmount}>{usd(parsedAmount)}</div>
      <p className={styles.successSub}>
        {usd(parsedAmount)} was returned to your USD virtual card balance.
      </p>
      <Button variant="primary" fullWidth onClick={handleClose}>
        Done
      </Button>
    </div>
  )

  function getContent() {
    if (step === 'pin') return pinContent
    if (step === 'success') return successContent
    return amountContent
  }

  const layers: SheetLayer[] = [
    {
      key: 'withdraw-card',
      title: titles[step],
      showBack: step === 'pin',
      onBack: handleBack,
      children: (
        <div key={step} className={styles.morphContent}>
          {getContent()}
        </div>
      ),
    },
  ]

  return <SideSheetStack open={open && !!card} onClose={handleClose} layers={layers} />
}
