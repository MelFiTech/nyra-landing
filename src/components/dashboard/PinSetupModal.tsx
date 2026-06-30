import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import { walletApi, ApiError } from '../../lib/api'
import styles from './PinSetupModal.module.css'

const PIN_LENGTH = 4

type Props = {
  open: boolean
  businessId: string
  onComplete: () => void
}

/**
 * Blocking modal shown after onboarding: the user must set their
 * 4-digit transaction PIN before doing anything else on the dashboard.
 * No close button, no overlay dismiss.
 */
export default function PinSetupModal({ open, businessId, onComplete }: Props) {
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const trapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) trapRef.current?.focus()
  }, [open, stage])

  if (!open) return null

  const current = stage === 'enter' ? pin : confirmPin

  async function submit(finalPin: string) {
    setLoading(true)
    setError('')
    try {
      await walletApi.createPin(businessId, finalPin)
      setLoading(false)
      onComplete()
    } catch (err) {
      setLoading(false)
      setPin('')
      setConfirmPin('')
      setStage('enter')
      setError(err instanceof ApiError ? err.message : 'Could not set your PIN. Please try again.')
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (loading) return
    if (e.key === 'Backspace') {
      setError('')
      if (stage === 'enter') setPin(p => p.slice(0, -1))
      else setConfirmPin(p => p.slice(0, -1))
      return
    }
    if (!/^\d$/.test(e.key)) return
    setError('')

    if (stage === 'enter') {
      const next = pin + e.key
      if (next.length > PIN_LENGTH) return
      setPin(next)
      if (next.length === PIN_LENGTH) setStage('confirm')
    } else {
      const next = confirmPin + e.key
      if (next.length > PIN_LENGTH) return
      setConfirmPin(next)
      if (next.length === PIN_LENGTH) {
        if (next === pin) {
          submit(next)
        } else {
          setError('PINs do not match. Try again.')
          setPin('')
          setConfirmPin('')
          setStage('enter')
        }
      }
    }
  }

  return (
    <div className={styles.overlay}>
      <div
        className={styles.modal}
        ref={trapRef}
        tabIndex={0}
        onKeyDown={handleKey}
        onBlur={e => {
          // keep keyboard focus inside the modal, it cannot be dismissed
          if (!e.currentTarget.contains(e.relatedTarget as Node)) e.currentTarget.focus()
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Set your transaction PIN"
      >
        <div className={styles.iconCircle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className={styles.title}>Set your transaction PIN</h2>
        <p className={styles.sub}>
          Before you continue, create a {PIN_LENGTH}-digit PIN.
          You'll use it to authorise transfers and payments.
        </p>

        <p className={styles.stage}>
          {stage === 'enter' ? 'Enter a new PIN' : 'Confirm your PIN'}
        </p>

        <div className={styles.pinRow}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`${styles.pinCircle} ${i < current.length ? styles.pinCircleFilled : ''}`}
            />
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.hint}>Use your keyboard to enter your PIN</p>

        {loading && <Button variant="primary" fullWidth loading disabled />}
      </div>
    </div>
  )
}
