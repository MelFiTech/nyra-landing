import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import { businessApi, ApiError, type Business } from '../../lib/api'
import { useBusiness } from '../../context/BusinessContext'
import { useToast } from '../../context/ToastContext'
import styles from './BusinessSwitcher.module.css'

const BUSINESS_TYPES = [
  { value: 'BUSINESS_NAME', label: 'Business Name' },
  { value: 'REGISTERED_COMPANY', label: 'Registered Company' },
  { value: 'INCORPORATED_TRUSTEES', label: 'Incorporated Trustees' },
  { value: 'LIMITED_PARTNERSHIP', label: 'Limited Partnership' },
  { value: 'LIMITED_LIABILITY_PARTNERSHIP', label: 'Limited Liability Partnership' },
]

function statusLabel(s: Business['verification_status']) {
  if (s === 'VERIFIED') return { text: 'Verified', cls: 'verified' as const }
  if (s === 'PENDING') return { text: 'Under review', cls: 'pending' as const }
  if (s === 'REJECTED') return { text: 'Rejected', cls: 'rejected' as const }
  return { text: 'Not verified', cls: 'unverified' as const }
}

export default function BusinessSwitcher() {
  const { showToast } = useToast()
  const { business, businesses, selectBusiness, refreshBusinesses } = useBusiness()
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ business_name: '', business_type: '', address: '' })
  const [creating, setCreating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setAdding(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!business) return null

  async function createBusiness(e: React.FormEvent) {
    e.preventDefault()
    if (!form.business_name.trim() || !form.business_type || !form.address.trim()) return
    setCreating(true)
    try {
      const created = await businessApi.register({
        business_name: form.business_name.trim(),
        business_type: form.business_type,
        address: form.address.trim(),
      })
      await refreshBusinesses()
      selectBusiness(created.id)
      showToast('Business created')
      setOpen(false)
      setAdding(false)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not create business', 'error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen(v => !v)} aria-haspopup="listbox" aria-expanded={open}>
        <span className={styles.name}>{business.name}</span>
        <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className={styles.menu} role="listbox">
          {!adding ? (
            <>
              <div className={styles.menuHeader}>Your businesses</div>
              <div className={styles.list}>
                {businesses.map(b => {
                  const st = statusLabel(b.verification_status)
                  const active = b.id === business.id
                  return (
                    <button
                      key={b.id}
                      className={`${styles.item} ${active ? styles.itemActive : ''}`}
                      onClick={() => { selectBusiness(b.id); setOpen(false) }}
                      role="option"
                      aria-selected={active}
                    >
                      <span className={styles.itemAvatar}>{b.name?.trim()?.[0]?.toUpperCase() ?? '?'}</span>
                      <span className={styles.itemInfo}>
                        <span className={styles.itemName}>{b.name}</span>
                        <span className={`${styles.itemStatus} ${styles[st.cls]}`}>{st.text}</span>
                      </span>
                      {active && (
                        <svg className={styles.check} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
              <button className={styles.addBtn} onClick={() => { setAdding(true); setForm({ business_name: '', business_type: '', address: '' }) }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add new business
              </button>
            </>
          ) : (
            <form className={styles.addForm} onSubmit={createBusiness}>
              <div className={styles.menuHeader}>New business</div>
              <div className={styles.field}>
                <label className={styles.label}>Business name</label>
                <input className={styles.input} placeholder="Acme Technologies Ltd." value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} autoFocus />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Business type</label>
                <select className={styles.input} value={form.business_type} onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))}>
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Address</label>
                <input className={styles.input} placeholder="123 Main Street, Lagos" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className={styles.addActions}>
                <Button variant="secondary" size="sm" type="button" onClick={() => setAdding(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit" loading={creating} disabled={!form.business_name.trim() || !form.business_type || !form.address.trim()}>
                  Create
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
