import type { ReactNode } from 'react'
import { useIsAuthMobile, useLockHorizontalScroll } from '../../hooks/useLockHorizontalScroll'
import styles from './AuthLayout.module.css'

type AuthLayoutProps = {
  children: ReactNode
  sidePanel?: ReactNode
}

export default function AuthLayout({ children, sidePanel }: AuthLayoutProps) {
  useLockHorizontalScroll()
  const isAuthMobile = useIsAuthMobile()

  return (
    <div className={styles.root}>
      <div className={styles.main}>
        <div className={styles.scroll}>
          <div className={styles.inner}>{children}</div>
        </div>
      </div>
      {!isAuthMobile && sidePanel ? <div className={styles.side}>{sidePanel}</div> : null}
    </div>
  )
}
