import styles from './PersonalPreview.module.css'

function StatusGlyphs() {
  return (
    <span className={styles.statusGlyphs} aria-hidden>
      <svg width="15" height="10" viewBox="0 0 17 11" fill="currentColor">
        <rect x="0" y="7" width="3" height="4" rx="1" />
        <rect x="4.5" y="5" width="3" height="6" rx="1" />
        <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
        <rect x="13.5" y="0" width="3" height="11" rx="1" />
      </svg>
      <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor">
        <path d="M8 2.6c2.3 0 4.4.9 6 2.4l-1.3 1.3A6.6 6.6 0 0 0 8 5.3 6.6 6.6 0 0 0 3.3 6.3L2 5C3.6 3.5 5.7 2.6 8 2.6Zm0 3.3c1.4 0 2.7.5 3.6 1.5l-1.3 1.3A2.9 2.9 0 0 0 8 8.9c-.9 0-1.7.3-2.3.8L4.4 8.4A5 5 0 0 1 8 5.9Zm0 3.3c.6 0 1.1.2 1.5.6L8 11l-1.5-1.2c.4-.4.9-.6 1.5-.6Z" />
      </svg>
      <span className={styles.battery}>
        <span className={styles.batteryLevel} />
      </span>
    </span>
  )
}

const TRANSACTIONS = [
  { type: 'sent' as const, title: 'Money Sent', date: 'Today', amount: '-₦200.00' },
  { type: 'received' as const, title: 'Money Received', date: 'Jan 1', amount: '+₦1,000.00' },
  { type: 'sent' as const, title: 'Money Sent', date: 'Dec 22', amount: '-₦500.00' },
]

export default function PersonalPreview() {
  return (
    <div className={styles.viewport} aria-hidden>
      <div className={styles.device}>
        <span className={`${styles.sideBtn} ${styles.silent}`} />
        <span className={`${styles.sideBtn} ${styles.volUp}`} />
        <span className={`${styles.sideBtn} ${styles.volDown}`} />
        <span className={`${styles.sideBtn} ${styles.power}`} />

        <div className={styles.frame}>
          <div className={styles.screen}>
            <div className={styles.dynamicIsland} />

            <div className={styles.statusBar}>
              <span className={styles.statusTime}>8:43</span>
              <StatusGlyphs />
            </div>

            <div className={styles.app}>
              <div className={styles.topRow}>
                <span className={styles.avatar}>GO</span>
                <div className={styles.topActions}>
                  <span className={styles.earnPill}>Earn daily 2k</span>
                  <span className={styles.bell}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </span>
                </div>
              </div>

              <h2 className={styles.accountsTitle}>Accounts</h2>

              <div className={styles.accountTabs}>
                <span className={styles.accountTab}>Main Account</span>
                <span className={`${styles.accountTab} ${styles.accountTabActive}`}>Joint Accounts</span>
              </div>

              <div className={styles.accountCards}>
                <div className={styles.addCard}>
                  <span className={styles.addIcon}>+</span>
                </div>
                <div className={styles.addCard}>
                  <span className={styles.addIcon}>+</span>
                </div>
              </div>

              <div className={styles.transactions}>
                <div className={styles.transactionsHeader}>
                  <span>Transactions</span>
                  <span className={styles.seeAll}>See all</span>
                </div>

                <div className={styles.txList}>
                  {TRANSACTIONS.map(tx => (
                    <div key={`${tx.title}-${tx.date}`} className={styles.txRow}>
                      <span className={tx.type === 'sent' ? styles.txIconSent : styles.txIconReceived}>
                        {tx.type === 'sent' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        )}
                      </span>
                      <div className={styles.txInfo}>
                        <span className={styles.txTitle}>{tx.title}</span>
                        <span className={styles.txDate}>{tx.date}</span>
                      </div>
                      <span className={tx.type === 'received' ? styles.txAmountIn : styles.txAmountOut}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.bottomNav}>
              <div className={styles.bottomNavInner}>
                <div className={`${styles.navItem} ${styles.navItemActive}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
                  </svg>
                  <span>Home</span>
                </div>
                <div className={styles.navItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <span>Cards</span>
                </div>
                <div className={styles.navItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Pay Bills</span>
                </div>
                <div className={styles.navItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                  <span>More</span>
                </div>
              </div>

              <button type="button" className={styles.sendFab} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
