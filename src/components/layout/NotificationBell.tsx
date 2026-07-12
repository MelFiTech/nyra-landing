import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import EmptyState, { NotificationEmptyIcon } from '../ui/EmptyState'
import { useBusiness } from '../../context/BusinessContext'
import { useNotifications } from '../../hooks/useAppData'
import { queryKeys } from '../../lib/queryKeys'
import styles from './NotificationBell.module.css'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return m <= 0 ? 'just now' : `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell() {
  const queryClient = useQueryClient()
  const { businessId } = useBusiness()
  const { data: notifications = [], isLoading } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const unread = notifications.filter(n => !n.read).length

  function markAllRead() {
    if (!businessId || notifications.length === 0) return
    queryClient.setQueryData(
      queryKeys.notifications(businessId),
      notifications.map(n => ({ ...n, read: true })),
    )
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.bell} onClick={() => setOpen(v => !v)} aria-label="Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && <span className={styles.badge}>{unread}</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Notifications</span>
            {unread > 0 && (
              <button type="button" className={styles.markRead} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className={styles.list}>
            {isLoading ? (
              <EmptyState
                variant="panel"
                icon={<NotificationEmptyIcon />}
                title="Loading notifications…"
                description="Please wait"
              />
            ) : notifications.length === 0 ? (
              <EmptyState
                variant="panel"
                icon={<NotificationEmptyIcon />}
                title="No notifications yet"
                description="Alerts for transfers, collections, and account activity will appear here"
              />
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}>
                  <div className={`${styles.icon} ${styles['icon_' + n.type]}`}>
                    {n.type === 'credit' ? '+' : n.type === 'debit' ? '−' : 'i'}
                  </div>
                  <div className={styles.content}>
                    <div className={styles.notifTitle}>{n.title}</div>
                    <div className={styles.notifBody}>{n.body}</div>
                    <div className={styles.notifTime}>{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.read && <div className={styles.dot} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
