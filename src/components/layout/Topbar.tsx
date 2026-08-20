import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Button from '../ui/Button'
import NotificationBell from './NotificationBell'
import BusinessSwitcher from './BusinessSwitcher'
import { useBusiness, usePermissions } from '../../context/BusinessContext'
import { useToast } from '../../context/ToastContext'
import { useApiEnvironment } from '../../hooks/useAppData'
import { ApiError, apiClientApi } from '../../lib/api'
import { queryKeys } from '../../lib/queryKeys'
import styles from './Topbar.module.css'

type Props = {
  onMenuClick?: () => void
}

export default function Topbar({ onMenuClick }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { businessId, business } = useBusiness()
  const { canManageApiKeys } = usePermissions()
  const { showToast } = useToast()
  const { data: apiEnvironment, isLoading: envLoading } = useApiEnvironment()
  const [switching, setSwitching] = useState(false)

  const liveMode = apiEnvironment?.environment === 'LIVE'
  const toggleDisabled = !canManageApiKeys || envLoading || switching || !businessId

  async function handleToggle() {
    if (!businessId || toggleDisabled) return

    const nextLive = !liveMode

    if (nextLive && !apiEnvironment?.can_go_live) {
      if (business?.verification_status === 'PENDING') {
        showToast('Business verification is still in progress', 'error')
      } else if (business?.verification_status === 'REJECTED') {
        showToast('Complete compliance review before going live', 'error')
        navigate('/app/compliance')
      } else {
        showToast('Complete business verification before going live', 'error')
        navigate('/app/compliance')
      }
      return
    }

    setSwitching(true)
    try {
      await apiClientApi.setEnvironment(businessId, nextLive ? 'LIVE' : 'TEST')
      await queryClient.invalidateQueries({ queryKey: queryKeys.apiEnvironment(businessId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.apiClient(businessId) })
      showToast(nextLive ? 'You are now live' : 'Switched to test mode', 'success')
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Could not update environment. Try again.',
        'error',
      )
    } finally {
      setSwitching(false)
    }
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <Button
          variant="icon"
          className={styles.menuBtn}
          onClick={onMenuClick}
          aria-label="Open menu"
          title="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
        </Button>
        <BusinessSwitcher />
      </div>

      <div className={styles.right}>
        <div className={styles.sandboxToggle}>
          <span className={`${styles.sandboxLabel} ${liveMode ? styles.sandboxLabelLive : ''}`}>
            {liveMode ? 'You are live' : 'Go live'}
          </span>
          <button
            type="button"
            className={`${styles.toggle} ${liveMode ? styles.toggleOn : ''}`}
            onClick={() => void handleToggle()}
            disabled={toggleDisabled}
            aria-label="Toggle live mode"
            aria-pressed={liveMode}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>

        <NotificationBell />

        <Button
          variant="icon"
          className={styles.settingsBtn}
          aria-label="Settings"
          onClick={() => navigate('/app/settings')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </Button>
      </div>
    </header>
  )
}
