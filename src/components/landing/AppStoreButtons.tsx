import type { ReactNode } from 'react'
import styles from './AppStoreButtons.module.css'

export const APP_STORE_URL = 'https://apps.apple.com/ng/app/nyra-wallet/id6670797970'
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.melfi.nayra&pcampaignid=web_share'

function getMobileStore(): 'ios' | 'android' | null {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return null
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3.6 2.4A1.8 1.8 0 0 0 2.4 4.2v15.6a1.8 1.8 0 0 0 2.7 1.56l13.2-7.8a1.8 1.8 0 0 0 0-3.12L3.6 2.4z" />
    </svg>
  )
}

type StoreLinkProps = {
  href: string
  label: string
  title: string
  icon: ReactNode
}

function StoreLink({ href, label, title, icon }: StoreLinkProps) {
  return (
    <a className={styles.storeBtn} href={href} aria-label={title}>
      <span className={styles.storeIcon}>{icon}</span>
      <span className={styles.storeText}>
        <span className={styles.storeEyebrow}>{label}</span>
        <span className={styles.storeName}>{title}</span>
      </span>
    </a>
  )
}

export default function AppStoreButtons() {
  const mobileStore = getMobileStore()
  const showAppStore = !mobileStore || mobileStore === 'ios'
  const showPlayStore = !mobileStore || mobileStore === 'android'

  return (
    <div className={styles.row}>
      {showAppStore && (
        <StoreLink
          href={APP_STORE_URL}
          label="Download on the"
          title="App Store"
          icon={<AppleIcon />}
        />
      )}
      {showPlayStore && (
        <StoreLink
          href={PLAY_STORE_URL}
          label="Get it on"
          title="Google Play"
          icon={<PlayIcon />}
        />
      )}
    </div>
  )
}
