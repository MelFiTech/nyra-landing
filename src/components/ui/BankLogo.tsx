import { useState } from 'react'
import type { Bank } from '../../lib/api'
import { bankLogoSrc, bankInitials } from '../../lib/banks'
import styles from './BankLogo.module.css'

type Props = {
  bank?: Pick<Bank, 'bank_name' | 'logo_url' | 'logo_url_svg'> | null
  size?: number
  /** Fill the circle edge-to-edge (cover). Default contains the logo. */
  fill?: boolean
  className?: string
}

export default function BankLogo({ bank, size = 32, fill = false, className }: Props) {
  const [failed, setFailed] = useState(false)
  const src = bankLogoSrc(bank)
  const showImg = Boolean(src) && !failed

  return (
    <span
      className={`${styles.root}${fill ? ` ${styles.fill}` : ''}${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.34)) }}
      aria-hidden={!bank?.bank_name}
    >
      {showImg ? (
        <img
          src={src!}
          alt=""
          width={size}
          height={size}
          className={styles.img}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.fallback}>{bankInitials(bank?.bank_name)}</span>
      )}
    </span>
  )
}
