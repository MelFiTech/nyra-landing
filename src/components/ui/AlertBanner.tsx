import type { ReactNode } from 'react'
import styles from './AlertBanner.module.css'

const WarningIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

type Props = {
  children: ReactNode
  action?: ReactNode
  actionLabel?: string
  onClick?: () => void
  centered?: boolean
}

export default function AlertBanner({
  children,
  action,
  actionLabel,
  onClick,
  centered = false,
}: Props) {
  const className = [
    styles.banner,
    centered ? styles.bannerCentered : '',
    onClick ? styles.bannerClickable : '',
  ].filter(Boolean).join(' ')

  const content = (
    <>
      <span className={styles.icon}><WarningIcon /></span>
      <div className={styles.message}>{children}</div>
      {action ? (
        <div className={styles.actionWrap}>{action}</div>
      ) : actionLabel ? (
        <span className={styles.actionLink}>{actionLabel}</span>
      ) : null}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-label={typeof children === 'string' ? children : undefined}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={className} role="status">
      {content}
    </div>
  )
}
