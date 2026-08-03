import { useEffect, useRef, useState } from 'react'
import NumericKeypad from '../ui/NumericKeypad'
import styles from './PinEntry.module.css'

type Props = {
  onConfirm: (pin: string) => void
  loading?: boolean
  subtitle?: string
  length?: number
}

export default function PinEntry({
  onConfirm,
  loading,
  subtitle,
  length = 4,
}: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPin('')
    setError('')
    window.setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  function appendDigit(digit: string) {
    if (loading || pin.length >= length) return
    const next = pin + digit
    setPin(next)
    setError('')
    if (next.length === length) onConfirm(next)
  }

  function removeDigit() {
    if (loading) return
    setPin(p => p.slice(0, -1))
    setError('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (loading) return
    if (e.key >= '0' && e.key <= '9') {
      appendDigit(e.key)
    } else if (e.key === 'Backspace') {
      removeDigit()
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pinArea}>
        <p className={styles.sub}>{subtitle ?? `Enter your ${length}-digit transaction PIN to confirm`}</p>
        <div
          className={styles.dotsWrap}
          tabIndex={0}
          onKeyDown={handleKey}
          ref={inputRef}
        >
          {Array.from({ length }).map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i < pin.length ? styles.dotFilled : ''} ${loading ? styles.dotLoading : ''}`}
            />
          ))}
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {loading && (
          <div className={styles.spinner}>
            <div className={styles.spinnerInner} />
          </div>
        )}
        <NumericKeypad
          className={styles.keypad}
          disabled={loading}
          onDigit={appendDigit}
          onBackspace={removeDigit}
        />
      </div>
    </div>
  )
}
