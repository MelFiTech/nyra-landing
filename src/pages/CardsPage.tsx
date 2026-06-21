import styles from './CardsPage.module.css'

export default function CardsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Cards</h1>
      </div>
      <div className={styles.comingSoonContainer}>
        <div className={styles.comingSoonIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div className={styles.comingSoonBadge}>Coming Soon</div>
        <h2 className={styles.comingSoonTitle}>Virtual Cards</h2>
        <p className={styles.comingSoonSub}>
          Issue and manage virtual USD cards for your business.<br />
          This feature is currently in development.
        </p>
      </div>
    </div>
  )
}
