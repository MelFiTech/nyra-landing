import { useEffect, useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BusinessVerificationBanner from './BusinessVerificationBanner'
import { loadBanks } from '../../lib/banks'
import styles from './Layout.module.css'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    void loadBanks().catch(() => {
      /* bank list warms cache; transfer UI retries if needed */
    })
  }, [])

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />
      <div className={styles.main}>
        <Topbar />
        <BusinessVerificationBanner />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}
