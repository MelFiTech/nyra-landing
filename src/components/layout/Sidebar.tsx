import { useCallback, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Button from '../ui/Button'
import NyraLogo from '../ui/NyraLogo'
import { useBusiness } from '../../context/BusinessContext'
import { session } from '../../lib/api'
import { prefetchRouteData } from '../../lib/prefetchRouteData'
import styles from './Sidebar.module.css'

const TreasuryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22"/>
    <line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/>
    <line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/>
    <polygon points="12 2 20 7 4 7"/>
  </svg>
)

const SpendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
)

const CustomersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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

const DocsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    <line x1="8" y1="7" x2="16" y2="7"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)

const WebhookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

const CollapseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const SignOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

type Props = {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { businessId } = useBusiness()
  const [treasuryOpen, setTreasuryOpen] = useState(true)
  const [spendOpen, setSpendOpen] = useState(true)
  const [theme, setTheme] = useState<'default' | 'light' | 'dark'>(
    () => (localStorage.getItem('nyra-theme-pref') as 'default' | 'light' | 'dark') || 'default'
  )

  useEffect(() => {
    localStorage.setItem('nyra-theme-pref', theme)
    if (theme === 'default') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      document.documentElement.classList.toggle('dark', mq.matches)
      const handler = (e: MediaQueryListEvent) => document.documentElement.classList.toggle('dark', e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  const isTreasuryActive = ['/app/dashboard', '/app/assets', '/app/transactions'].includes(location.pathname)
  const isSpendActive = ['/app/cards', '/app/cards/physical'].includes(location.pathname)
  const isVirtualCardsActive = location.pathname === '/app/cards'
  const isPhysicalCardsActive = location.pathname === '/app/cards/physical'
  const isCustomersActive = location.pathname.startsWith('/app/customers')
  const isWebhooksActive = location.pathname === '/app/webhooks'
  const isDocsActive = location.pathname === '/app/docs'
  const isSettingsActive = location.pathname === '/app/settings'

  const navItemStyle = collapsed
    ? { justifyContent: 'center', padding: '9px 0' }
    : undefined

  const inviteBtnStyle = collapsed
    ? { justifyContent: 'center', padding: '9px 0' }
    : undefined

  const prefetchRoute = useCallback((path: string) => {
    if (businessId) prefetchRouteData(queryClient, businessId, path)
  }, [businessId, queryClient])

  function handleSignOut() {
    session.clear()
    navigate('/app/login')
  }

  return (
    <aside
      className={styles.sidebar}
      style={{ width: collapsed ? 60 : 220, minWidth: collapsed ? 60 : 220 }}
    >
      <div className={styles.logo}>
        {collapsed ? <NyraLogo variant="icon" /> : <NyraLogo />}
        <Button
          variant="icon"
          iconSm
          className={`${styles.collapseBtn} ${collapsed ? styles.collapseBtnCollapsed : ''}`}
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <CollapseIcon />
        </Button>
      </div>

      <nav className={styles.nav}>
        {/* Treasury group */}
        <div className={styles.navGroup}>
          <button
            className={`${styles.navItem} ${isTreasuryActive ? styles.active : ''}`}
            style={navItemStyle}
            onClick={() => { if (!collapsed) setTreasuryOpen(v => !v) }}
            onMouseEnter={() => {
              prefetchRoute('/app/dashboard')
              prefetchRoute('/app/assets')
              prefetchRoute('/app/transactions')
            }}
            title={collapsed ? 'Treasury' : undefined}
          >
            <span className={styles.icon}><TreasuryIcon /></span>
            {!collapsed && <span>Treasury</span>}
            {!collapsed && (
              <span className={`${styles.chevron} ${treasuryOpen ? styles.open : ''}`}>
                <ChevronDown />
              </span>
            )}
          </button>
          {treasuryOpen && !collapsed && (
            <div className={styles.subNav}>
              <button
                className={`${styles.subItem} ${location.pathname === '/app/dashboard' ? styles.subActive : ''}`}
                onClick={() => navigate('/app/dashboard')}
                onMouseEnter={() => prefetchRoute('/app/dashboard')}
              >
                Accounts
              </button>
              <button
                className={`${styles.subItem} ${location.pathname === '/app/assets' ? styles.subActive : ''}`}
                onClick={() => navigate('/app/assets')}
                onMouseEnter={() => prefetchRoute('/app/assets')}
              >
                Assets
              </button>
              <button
                className={`${styles.subItem} ${location.pathname === '/app/transactions' ? styles.subActive : ''}`}
                onClick={() => navigate('/app/transactions')}
                onMouseEnter={() => prefetchRoute('/app/transactions')}
              >
                Transactions
              </button>
            </div>
          )}
        </div>

        {/* Spend group */}
        <div className={styles.navGroup}>
          <button
            className={`${styles.navItem} ${isSpendActive ? styles.active : ''}`}
            style={navItemStyle}
            onClick={() => { if (!collapsed) setSpendOpen(v => !v) }}
            onMouseEnter={() => {
              prefetchRoute('/app/cards')
              prefetchRoute('/app/cards/physical')
            }}
            title={collapsed ? 'Spend' : undefined}
          >
            <span className={styles.icon}><SpendIcon /></span>
            {!collapsed && <span>Spend</span>}
            {!collapsed && (
              <span className={`${styles.chevron} ${spendOpen ? styles.open : ''}`}>
                <ChevronDown />
              </span>
            )}
          </button>
          {spendOpen && !collapsed && (
            <div className={styles.subNav}>
              <button
                className={`${styles.subItem} ${isVirtualCardsActive ? styles.subActive : ''}`}
                onClick={() => navigate('/app/cards')}
                onMouseEnter={() => prefetchRoute('/app/cards')}
              >
                Virtual card
              </button>
              <button
                className={`${styles.subItem} ${isPhysicalCardsActive ? styles.subActive : ''}`}
                onClick={() => navigate('/app/cards/physical')}
                onMouseEnter={() => prefetchRoute('/app/cards/physical')}
              >
                Physical card
              </button>
            </div>
          )}
        </div>

        <button
          className={`${styles.navItem} ${isCustomersActive ? styles.active : ''}`}
          style={navItemStyle}
          onClick={() => navigate('/app/customers')}
          onMouseEnter={() => prefetchRoute('/app/customers')}
          title={collapsed ? 'Customers' : undefined}
        >
          <span className={styles.icon}><CustomersIcon /></span>
          {!collapsed && <span>Customers</span>}
        </button>

        <button
          className={`${styles.navItem} ${isWebhooksActive ? styles.active : ''}`}
          style={navItemStyle}
          onClick={() => navigate('/app/webhooks')}
          onMouseEnter={() => prefetchRoute('/app/webhooks')}
          title={collapsed ? 'Webhooks' : undefined}
        >
          <span className={styles.icon}><WebhookIcon /></span>
          {!collapsed && <span>Webhooks</span>}
        </button>

        <button
          className={`${styles.navItem} ${isDocsActive ? styles.active : ''}`}
          style={navItemStyle}
          onClick={() => window.open('/docs', '_blank', 'noopener,noreferrer')}
          title={collapsed ? 'API docs' : undefined}
        >
          <span className={styles.icon}><DocsIcon /></span>
          {!collapsed && <span>API docs</span>}
        </button>

        <button
          className={`${styles.navItem} ${isSettingsActive ? styles.active : ''}`}
          style={navItemStyle}
          onClick={() => navigate('/app/settings')}
          onMouseEnter={() => prefetchRoute('/app/settings')}
          title={collapsed ? 'Settings' : undefined}
        >
          <span className={styles.icon}><SettingsIcon /></span>
          {!collapsed && <span>Settings</span>}
        </button>
      </nav>

      <div className={styles.signOutWrap}>
        <Button
          variant="nav"
          className={styles.signOutBtn}
          style={inviteBtnStyle}
          onClick={handleSignOut}
          title={collapsed ? 'Sign out' : undefined}
          type="button"
        >
          <span className={styles.icon}><SignOutIcon /></span>
          {!collapsed && <span>Sign out</span>}
        </Button>
      </div>

      <div className={styles.bottom}>
        {!collapsed ? (
          <div className={styles.themePill}>
            <button
              className={`${styles.themeBtn} ${theme === 'default' ? styles.themeBtnActive : ''}`}
              onClick={() => setTheme('default')}
              title="Default (system)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              Default
            </button>
            <button
              className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
              onClick={() => setTheme('light')}
              title="Light"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              Light
            </button>
            <button
              className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
              onClick={() => setTheme('dark')}
              title="Dark"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              Dark
            </button>
          </div>
        ) : (
          <Button
            variant="nav"
            className={styles.inviteBtn}
            style={inviteBtnStyle}
            onClick={() => setTheme(t => t === 'default' ? 'light' : t === 'light' ? 'dark' : 'default')}
            title={`Theme: ${theme}`}
          >
            <span className={styles.icon}>
              {theme === 'dark' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : theme === 'light' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              )}
            </span>
          </Button>
        )}
      </div>
    </aside>
  )
}
