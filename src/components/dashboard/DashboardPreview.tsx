import { useLayoutEffect, useRef, useState } from 'react'
import NyraLogo from '../ui/NyraLogo'
import TrendSparkline from './TrendSparkline'
import layoutStyles from '../layout/Layout.module.css'
import sidebarStyles from '../layout/Sidebar.module.css'
import topbarStyles from '../layout/Topbar.module.css'
import bellStyles from '../layout/NotificationBell.module.css'
import switcherStyles from '../layout/BusinessSwitcher.module.css'
import dashStyles from '../../pages/DashboardPage.module.css'
import chatStyles from './ChatPanel.module.css'
import styles from './DashboardPreview.module.css'

const metrics = [
  { label: 'Total Inflow', trend: 'up' as const, change: '+12.4%', data: [3, 5, 4, 7, 6, 9, 11], value: '₦ 1.8M' },
  { label: 'Total Outflow', trend: 'down' as const, change: '-3.1%', data: [9, 8, 10, 7, 6, 5, 4], value: '₦ 900K' },
  { label: 'Transactions', trend: 'up' as const, change: '+8.2%', data: [2, 3, 2, 4, 5, 6, 8], value: '124' },
]

const suggestions = ["What's my balance?", 'Show recent transfers', 'How do I top up?']

const DESIGN_WIDTH = 1280
const DESIGN_HEIGHT = 760
const MAX_SCALE = 1
const PEEK_HEIGHT = 520

const TreasuryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
  </svg>
)

const SpendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
)

const CustomersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const WebhookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const DepositIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const TransferIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
  </svg>
)

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

export default function DashboardPreview() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.85)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateScale = () => {
      const width = viewport.clientWidth
      setScale(Math.min(MAX_SCALE, width / DESIGN_WIDTH))
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  const scaledWidth = DESIGN_WIDTH * scale
  const scaledHeight = DESIGN_HEIGHT * scale
  const visibleHeight = Math.min(scaledHeight, PEEK_HEIGHT)

  return (
    <div ref={viewportRef} className={styles.viewport} aria-hidden>
      <div
        className={styles.frame}
        style={{ width: scaledWidth, height: visibleHeight }}
      >
        <div
          className={styles.scaleInner}
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <div className={`${layoutStyles.layout} ${styles.previewLayout}`}>
        <aside className={`${sidebarStyles.sidebar} ${styles.sidebar}`}>
          <div className={sidebarStyles.logo}>
            <NyraLogo />
          </div>

          <nav className={sidebarStyles.nav}>
            <div className={sidebarStyles.navGroup}>
              <div className={`${sidebarStyles.navItem} ${sidebarStyles.active}`}>
                <span className={sidebarStyles.icon}><TreasuryIcon /></span>
                <span>Treasury</span>
                <span className={`${sidebarStyles.chevron} ${sidebarStyles.open}`}><ChevronDown /></span>
              </div>
              <div className={sidebarStyles.subNav}>
                <div className={`${sidebarStyles.subItem} ${sidebarStyles.subActive}`}>Accounts</div>
                <div className={sidebarStyles.subItem}>Transactions</div>
              </div>
            </div>

            <div className={sidebarStyles.navGroup}>
              <div className={sidebarStyles.navItem}>
                <span className={sidebarStyles.icon}><SpendIcon /></span>
                <span>Spend</span>
                <span className={`${sidebarStyles.chevron} ${sidebarStyles.open}`}><ChevronDown /></span>
              </div>
              <div className={sidebarStyles.subNav}>
                <div className={sidebarStyles.subItem}>Cards</div>
              </div>
            </div>

            <div className={sidebarStyles.navItem}>
              <span className={sidebarStyles.icon}><CustomersIcon /></span>
              <span>Customers</span>
            </div>
            <div className={sidebarStyles.navItem}>
              <span className={sidebarStyles.icon}><WebhookIcon /></span>
              <span>Webhooks</span>
            </div>
            <div className={sidebarStyles.navItem}>
              <span className={sidebarStyles.icon}><SettingsIcon /></span>
              <span>Settings</span>
            </div>
          </nav>

          <div className={sidebarStyles.bottom}>
            <div className={sidebarStyles.themePill}>
              <div className={`${sidebarStyles.themeBtn} ${sidebarStyles.themeBtnActive}`}>Default</div>
              <div className={sidebarStyles.themeBtn}>Light</div>
              <div className={sidebarStyles.themeBtn}>Dark</div>
            </div>
          </div>
        </aside>

        <div className={`${layoutStyles.main} ${styles.previewMain}`}>
          <header className={`${topbarStyles.topbar} ${styles.previewTopbar}`}>
            <div className={topbarStyles.left}>
              <div className={switcherStyles.trigger}>
                <span className={switcherStyles.name}>Mel-Fi Technology Limited</span>
                <span className={switcherStyles.chevron}><ChevronDown /></span>
              </div>
            </div>
            <div className={topbarStyles.right}>
              <div className={topbarStyles.sandboxToggle}>
                <span className={topbarStyles.sandboxLabel}>Go live</span>
                <div className={topbarStyles.toggle}>
                  <span className={topbarStyles.toggleKnob} />
                </div>
              </div>
              <div className={bellStyles.wrap}>
                <div className={bellStyles.bell}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
              </div>
              <div className={topbarStyles.langBtn}>
                <GlobeIcon />
                <span>EN</span>
                <ChevronDown />
              </div>
              <div className={topbarStyles.settingsBtn}>
                <SettingsIcon />
              </div>
            </div>
          </header>

          <div className={layoutStyles.content}>
            <div className={dashStyles.content}>
              <h1 className={dashStyles.greeting}>Hello, Mel-Fi Technology Limited</h1>

              <div className={dashStyles.grid}>
                <div className={dashStyles.leftCol} style={{ width: '62%', flexShrink: 0 }}>
                  <div className={dashStyles.walletCard}>
                    <div className={dashStyles.walletTop}>
                      <div className={dashStyles.currencyBadge}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        <span>NGN</span>
                      </div>
                      <div className={dashStyles.addWalletBtn}>
                        <span className={dashStyles.addIcon}>+</span>
                        Add Wallet
                      </div>
                    </div>

                    <div className={dashStyles.walletBody}>
                      <div className={dashStyles.walletBg} />
                      <div className={dashStyles.walletInfo}>
                        <div className={dashStyles.balanceLabel}>Available Balance</div>
                        <div className={dashStyles.balanceAmount}>₦ 8,450,190.32</div>
                      </div>
                      <div className={dashStyles.walletBottom}>
                        <div className={dashStyles.balanceRow}>
                          <div>
                            <div className={dashStyles.subLabel}>Total Balance</div>
                            <div className={dashStyles.subAmount}>₦ 8,548,315.82</div>
                          </div>
                          <div>
                            <div className={dashStyles.subLabel}>Unsettled Balance</div>
                            <div className={dashStyles.subAmount}>₦ 98,125.50</div>
                          </div>
                        </div>
                        <div className={dashStyles.walletActions}>
                          <div className={dashStyles.walletActionBtn}>
                            <div className={dashStyles.actionIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>
                              <DepositIcon />
                            </div>
                            <span className={dashStyles.walletActionLabel}>Deposit</span>
                          </div>
                          <div className={dashStyles.walletActionBtn}>
                            <div className={dashStyles.actionIcon} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                              <TransferIcon />
                            </div>
                            <span className={dashStyles.walletActionLabel}>Transfer</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={dashStyles.metrics}>
                    {metrics.map(metric => (
                      <div key={metric.label} className={dashStyles.metricCard}>
                        <div className={dashStyles.metricHeader}>
                          <span className={dashStyles.metricLabel}>{metric.label}</span>
                          <span className={`${dashStyles.metricTrend} ${dashStyles[`metricTrend${metric.trend === 'up' ? 'Up' : 'Down'}`]}`}>
                            {metric.change}
                          </span>
                        </div>
                        <div className={dashStyles.metricBody}>
                          <span className={dashStyles.metricValue}>{metric.value}</span>
                          <span className={dashStyles.metricChart}>
                            <TrendSparkline data={metric.data} trend={metric.trend} width={48} height={20} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <section className={`${dashStyles.txSection} ${styles.txSection}`}>
                    <h2 className={`${dashStyles.txTitle} ${styles.txTitle}`}>Recent transactions</h2>
                    <div className={styles.txList}>
                      <div className={styles.txRow}>
                        <span className={styles.txDesc}>Paystack Settlement</span>
                        <span className={styles.txAmountPositive}>+₦125,000.00</span>
                      </div>
                      <div className={styles.txRow}>
                        <span className={styles.txDesc}>Vendor Payout</span>
                        <span className={styles.txAmountNegative}>-₦240,000.00</span>
                      </div>
                    </div>
                  </section>
                </div>

                <div className={dashStyles.dragHandle} />

                <div className={`${dashStyles.rightCol} ${styles.chatCol}`}>
                  <div className={chatStyles.panel}>
                    <div className={chatStyles.header}>
                      <span className={chatStyles.headerTitle}>New Conversation</span>
                    </div>
                    <div className={chatStyles.messages}>
                      <div className={chatStyles.aiMessage}>
                        <p className={chatStyles.aiText}>
                          Hi! I&apos;m Nyra AI. Ask me anything about your wallet — balances, transactions, payments and more.
                        </p>
                      </div>
                    </div>
                    <div className={chatStyles.suggestions}>
                      {suggestions.map(s => (
                        <span key={s} className={chatStyles.suggestion}>{s}</span>
                      ))}
                    </div>
                    <div className={chatStyles.inputRow}>
                      <div className={chatStyles.input}>Ask Nyra AI...</div>
                      <div className={chatStyles.sendBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}
