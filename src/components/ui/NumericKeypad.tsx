import styles from './NumericKeypad.module.css'

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

type Props = {
  onDigit: (digit: string) => void
  onBackspace: () => void
  disabled?: boolean
  className?: string
}

function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <line x1="18" y1="9" x2="12" y2="15" />
      <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
  )
}

export default function NumericKeypad({ onDigit, onBackspace, disabled = false, className }: Props) {
  return (
    <div className={[styles.keypad, className].filter(Boolean).join(' ')} role="group" aria-label="PIN keypad">
      {DIGITS.map(digit => (
        <button
          key={digit}
          type="button"
          className={styles.key}
          disabled={disabled}
          onClick={() => onDigit(digit)}
          aria-label={`Digit ${digit}`}
        >
          {digit}
        </button>
      ))}

      <span className={`${styles.key} ${styles.keyGhost}`} aria-hidden />

      <button
        type="button"
        className={styles.key}
        disabled={disabled}
        onClick={() => onDigit('0')}
        aria-label="Digit 0"
      >
        0
      </button>

      <button
        type="button"
        className={`${styles.key} ${styles.keyAction}`}
        disabled={disabled}
        onClick={onBackspace}
        aria-label="Delete"
      >
        <BackspaceIcon />
      </button>
    </div>
  )
}
