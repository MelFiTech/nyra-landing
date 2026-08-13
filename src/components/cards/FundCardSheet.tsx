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
  onFunded?: () => void
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

export default function FundCardSheet({ open, onClose, card, onFunded }: Props) {
  const { businessId } = useBusiness()
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('amount')
      setAmount('')
      setPinLoading(false)
    }
  }, [open, card?.card_id])

  const parsedAmount = Number(amount)
  const amountValid = amount !== '' && parsedAmount >= MIN_AMOUNT

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
      await cardsApi.topup(businessId, {
        card_id: card.card_id,
        amount: parsedAmount,
        wallet_pin: pin,
      })
      onFunded?.()
      setStep('success')
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not fund card'
      showToast(message)
    } finally {
      setPinLoading(false)
    }
  }

  const titles: Record<Step, string> = {
    amount: 'Fund card',
    pin: 'Confirm funding',
    success: 'Funding successful',
  }

  const amountContent = (
    <div className={styles.form}>
      <p className={styles.hint}>
        Add USD from your virtual card program balance to this card.
      </p>

      {card && (
        <div className={styles.cardTarget}>
          <div>
            <div className={styles.cardTargetLabel}>Card</div>
            <div className={styles.cardTargetValue}>{card.cardholder_name}</div>
          </div>
          <div className={styles.cardTargetValue}>•••• {card.last_four}</div>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="fund-amount">Amount</label>
        <div className={styles.amountInputWrap}>
          <span className={styles.amountPrefix}>$</span>
          <input
            id="fund-amount"
            className={styles.amountInput}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min={MIN_AMOUNT}
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
          />
        </div>
        <span className={styles.amountHint}>Minimum {usd(MIN_AMOUNT)}</span>
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
      key="fund-pin"
      onConfirm={handlePinConfirm}
      loading={pinLoading}
      length={4}
      subtitle={`Confirm funding of ${usd(parsedAmount)} to •••• ${card?.last_four ?? ''}`}
    />
  )

  const successContent = (
    <div className={styles.success}>
      <div className={styles.successIcon} aria-hidden>
        <CheckIcon />
      </div>
      <div className={styles.successTitle}>Card funded</div>
      <div className={styles.successAmount}>{usd(parsedAmount)}</div>
      <p className={styles.successSub}>
        {usd(parsedAmount)} has been added to {card?.cardholder_name}&apos;s card ending in {card?.last_four}.
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
      key: 'fund-card',
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
