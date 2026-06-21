import { useEffect } from 'react'
import Button from '../ui/Button'
import styles from './AccountDetailsModal.module.css'

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22"/>
    <line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/>
    <line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/>
    <polygon points="12 2 20 7 4 7"/>
  </svg>
)

type Props = {
  open: boolean
  onClose: () => void
}

const accounts = [
  {
    bank: 'Providus Bank',
    accountName: 'Mel-Fi Technology Limited',
    accountNumber: '9900441827',
  },
  {
    bank: 'Sterling Bank',
    accountName: 'Mel-Fi Technology Limited',
    accountNumber: '0082774531',
  },
]

export default function AccountDetailsModal({ open, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <BankIcon />
            </div>
            <div>
              <div className={styles.headerTitle}>Account Details</div>
              <div className={styles.headerSub}>Fund your NGN wallet via bank transfer</div>
            </div>
          </div>
          <Button variant="icon" onClick={onClose}><CloseIcon /></Button>
        </div>

        <div className={styles.body}>
          <div className={styles.notice}>
            <span className={styles.noticeDot} />
            Transfers typically reflect within a few minutes
          </div>

          <div className={styles.accounts}>
            {accounts.map((acc, i) => (
              <div key={i} className={styles.accountCard}>
                <div className={styles.bankRow}>
                  <div className={styles.bankBadge}>{acc.bank.charAt(0)}</div>
                  <span className={styles.bankName}>{acc.bank}</span>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Account Name</span>
                    <span className={styles.fieldValue}>{acc.accountName}</span>
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Account Number</span>
                    <div className={styles.fieldValueRow}>
                      <span className={styles.fieldValueLarge}>{acc.accountNumber}</span>
                      <Button
                        variant="text"
                        onClick={() => copy(acc.accountNumber)}
                        title="Copy account number"
                      >
                        <CopyIcon />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerNote}>
            These are dedicated virtual accounts. Only send NGN to these accounts.
          </p>
        </div>
      </div>
    </div>
  )
}
