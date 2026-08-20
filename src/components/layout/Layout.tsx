import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BusinessVerificationBanner from './BusinessVerificationBanner'
import { loadBanks } from '../../lib/banks'
import styles from './Layout.module.css'

const MOBILE_BREAKPOINT = 900

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    void loadBanks().catch(() => {
      /* bank list warms cache; transfer UI retries if needed */
    })
  }, [])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > MOBILE_BREAKPOINT) setMobileNavOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  return (
    <div className={styles.layout}>
      <div
        className={`${styles.navBackdrop} ${mobileNavOpen ? styles.navBackdropVisible : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden={!mobileNavOpen}
      />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <div className={styles.main}>
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <BusinessVerificationBanner />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}
