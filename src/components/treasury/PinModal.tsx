import { useState, useEffect, useRef } from 'react'
import Button from '../ui/Button'
import styles from './PinModal.module.css'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (pin: string) => void
  loading?: boolean
  title?: string
}

export default function PinModal({ open, onClose, onConfirm, loading, title = 'Enter Transaction PIN' }: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { setPin(''); setError(''); setTimeout(() => inputRef.current?.focus(), 100) }
  }, [open])

  function handleKey(e: React.KeyboardEvent) {
    if (loading) return
    if (e.key >= '0' && e.key <= '9' && pin.length < 6) {
      const next = pin + e.key
      setPin(next)
      setError('')
      if (next.length === 6) onConfirm(next)
    } else if (e.key === 'Backspace') {
      setPin(p => p.slice(0, -1))
      setError('')
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <Button variant="icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </Button>
        </div>

        <div className={styles.body}>
          <p className={styles.sub}>Enter your 6-digit transaction PIN to confirm</p>
          <div
            className={styles.dotsWrap}
            tabIndex={0}
            onKeyDown={handleKey}
            ref={inputRef as any}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${styles.dot} ${i < pin.length ? styles.dotFilled : ''} ${loading ? styles.dotLoading : ''}`} />
            ))}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {loading && (
            <div className={styles.spinner}>
              <div className={styles.spinnerInner} />
            </div>
          )}

          <Button variant="text" type="button">Forgot PIN?</Button>
        </div>
      </div>
    </div>
  )
}
