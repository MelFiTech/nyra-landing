import BankLogo from '../ui/BankLogo'
import { DOC_BANK_SHOWCASE_SAMPLES } from '../../lib/apiDocs/bankShowcaseSamples'
import styles from './BankListShowcase.module.css'

type Props = {
  intro: string
}

export default function BankListShowcase({ intro }: Props) {
  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>{intro}</p>
      <p className={styles.hint}>
        Example rows from the API response (your call returns every supported bank with{' '}
        <code className={styles.code}>bank_code</code>, <code className={styles.code}>bank_name</code>
        , and logo URLs). Use <code className={styles.code}>bank_code</code> in resolve and transfer
        calls.
      </p>
      <ul className={styles.list} aria-label="Sample banks">
        {DOC_BANK_SHOWCASE_SAMPLES.map(bank => (
          <li key={bank.bank_code} className={styles.row}>
            <BankLogo bank={bank} size={36} />
            <div className={styles.meta}>
              <span className={styles.name}>{bank.bank_name}</span>
              <span className={styles.bankCode}>
                bank_code <strong>{bank.bank_code}</strong>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.more}>Full list is returned by GET /business/transfers/bank/list</p>
    </div>
  )
}
