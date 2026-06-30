import { useState } from 'react'
import Button from '../ui/Button'
import SideSheetStack, { type SheetLayer } from './SideSheetStack'
import styles from './DepositModal.module.css'

export type DepositAccount = {
  bank_name: string
  account_number: string
  account_name: string
}

type Props = {
  open: boolean
  onClose: () => void
  /** The business's dedicated (float) accounts, transfers to these fund the wallet. */
  accounts: DepositAccount[]
}

export default function DepositModal({ open, onClose, accounts }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  const content = (
    <>
      <p className={styles.hint}>
        Transfer to your dedicated account below. Funds reflect automatically once the transfer settles.
      </p>
      {accounts.length === 0 ? (
        <div className={styles.form}>
          <p className={styles.hint}>
            No dedicated account yet. Complete business verification to get your funding account.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {accounts.map(acc => (
            <li key={acc.account_number} className={styles.listItem}>
              <div className={styles.listTop}>
                <span className={styles.bankName}>{acc.bank_name}</span>
                <Button variant="text" onClick={() => copy(acc.account_number)}>
                  {copied === acc.account_number ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className={styles.accountNumber}>{acc.account_number}</div>
              <div className={styles.accountName}>{acc.account_name}</div>
            </li>
          ))}
        </ul>
      )}
    </>
  )

  const layers: SheetLayer[] = [{ key: 'methods', title: 'Fund your wallet', children: content }]

  return <SideSheetStack open={open} onClose={onClose} layers={layers} />
}
