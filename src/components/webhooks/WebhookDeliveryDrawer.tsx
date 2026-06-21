import { useEffect } from 'react'
import Button from '../ui/Button'
import styles from './WebhookDeliveryDrawer.module.css'

export type DeliveryLog = {
  id: string
  business_id: string | null
  webhook_config_id: string | null
  target_url: string
  event: string
  http_status: number | null
  outcome: 'delivered' | 'failed_retrying' | 'failed_final'
  attempt_number: number
  error_message: string | null
  response_preview: string | null
  created_at: string
}

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

type Props = {
  log: DeliveryLog | null
  onClose: () => void
  onResend: (id: string) => void
  resending: boolean
  resent: boolean
}

export default function WebhookDeliveryDrawer({ log, onClose, onResend, resending, resent }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div
        className={`${styles.overlay} ${log ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.drawer} ${log ? styles.drawerOpen : ''}`}>
        {log && (
          <>
            <div className={styles.header}>
              <span className={styles.headerTitle}>Delivery Details</span>
              <Button variant="icon" onClick={onClose}><CloseIcon /></Button>
            </div>

            <div className={styles.body}>
              <div className={styles.eventBlock}>
                <span className={styles.eventLabel}>Event</span>
                <code className={styles.eventName}>{log.event}</code>
              </div>

              <div className={styles.rows}>
                <div className={styles.row}>
                  <span className={styles.label}>Delivery ID</span>
                  <code className={styles.value}>{log.id}</code>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Config ID</span>
                  <code className={styles.value}>{log.webhook_config_id ?? '—'}</code>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Timestamp</span>
                  <span className={styles.value}>{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Target URL</span>
                  <span className={styles.value}>{log.target_url}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>HTTP Status</span>
                  <span className={styles.value}>{log.http_status ?? '—'}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Attempt</span>
                  <span className={styles.value}>
                    {log.attempt_number}{log.attempt_number === 5 ? ' (max)' : ''}
                  </span>
                </div>
              </div>

              {log.error_message && (
                <div className={styles.block}>
                  <span className={styles.label}>Error</span>
                  <p className={styles.error}>{log.error_message}</p>
                </div>
              )}

              {log.response_preview && (
                <div className={styles.block}>
                  <span className={styles.label}>Response Preview</span>
                  <code className={styles.code}>{log.response_preview}</code>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <Button
                variant="primary"
                fullWidth
                loading={resending}
                disabled={resent}
                onClick={() => onResend(log.id)}
              >
                {resent ? '✓ Sent' : 'Resend webhook'}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
