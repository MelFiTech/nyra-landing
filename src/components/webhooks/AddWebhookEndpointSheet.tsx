import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import SideSheetStack, { type SheetLayer } from '../treasury/SideSheetStack'
import { webhooksApi, ApiError } from '../../lib/api'
import styles from './AddWebhookEndpointSheet.module.css'

export const WEBHOOK_EVENTS = [
  { value: 'managed_wallet.funded', label: 'Wallet Funded' },
  { value: 'managed_wallet.transfer', label: 'Transfer Sent' },
  { value: 'managed_wallet.debited', label: 'Wallet Debited' },
  { value: 'managed_wallet.temporary_account_funded', label: 'Temporary Account Funded' },
  { value: 'vas.electricity.completed', label: 'Electricity Token Ready' },
]

export type WebhookConfig = {
  id: string
  name: string
  url: string
  subscribed_events: string[]
  created_at: string
}

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (config: WebhookConfig) => void
  businessId: string
}

type Step = 'form' | 'success'

export default function AddWebhookEndpointSheet({ open, onClose, onCreated, businessId }: Props) {
  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [createdConfig, setCreatedConfig] = useState<WebhookConfig | null>(null)
  const [createdSecret, setCreatedSecret] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('form')
      setName('')
      setUrl('')
      setSelectedEvents([])
      setSaving(false)
      setError('')
      setCreatedConfig(null)
      setCreatedSecret('')
      setCopied(false)
    }
  }, [open])

  function toggleEvent(val: string) {
    setSelectedEvents(prev =>
      prev.includes(val) ? prev.filter(e => e !== val) : [...prev, val],
    )
  }

  const allEventsSelected = selectedEvents.length === WEBHOOK_EVENTS.length

  function toggleAllEvents() {
    setSelectedEvents(allEventsSelected ? [] : WEBHOOK_EVENTS.map(ev => ev.value))
  }

  async function createConfig() {
    setSaving(true)
    setError('')
    try {
      const created = await webhooksApi.createConfig(businessId, {
        name: name || undefined,
        url,
        subscribed_events: selectedEvents,
      })
      const config: WebhookConfig = {
        id: created.id,
        name: created.name ?? name,
        url: created.url ?? url,
        subscribed_events: created.subscribed_events ?? selectedEvents,
        created_at: created.created_at ?? new Date().toISOString(),
      }
      setCreatedConfig(config)
      setCreatedSecret(created.signing_secret ?? created.secret ?? '')
      setSaving(false)
      setStep('success')
    } catch (err) {
      setSaving(false)
      setError(err instanceof ApiError ? err.message : 'Could not create endpoint. Please try again.')
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(createdSecret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function finish() {
    if (createdConfig) onCreated(createdConfig)
    onClose()
  }

  function handleClose() {
    if (step === 'success' && createdConfig) onCreated(createdConfig)
    onClose()
  }

  const formContent = (
    <div className={styles.form}>
      <p className={styles.hint}>Configure a URL to receive real-time event notifications from Nyra.</p>
      <div className={styles.field}>
        <label className={styles.label}>
          Name <span className={styles.optionalTag}>(optional)</span>
        </label>
        <input
          className={styles.input}
          placeholder="e.g. Production Listener"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Endpoint URL</label>
        <input
          className={styles.input}
          placeholder="https://api.yoursite.com/webhooks/nyra"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.eventsHeader}>
          <label className={styles.label}>Subscribe to Events</label>
          <Button type="button" variant="text" onClick={toggleAllEvents}>
            {allEventsSelected ? 'Unmark all' : 'Mark all'}
          </Button>
        </div>
        <div className={styles.eventsList}>
          {WEBHOOK_EVENTS.map(ev => (
            <label key={ev.value} className={styles.eventRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selectedEvents.includes(ev.value)}
                onChange={() => toggleEvent(ev.value)}
              />
              <div>
                <div className={styles.eventLabel}>{ev.label}</div>
                <div className={styles.eventCode}>{ev.value}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      {error && <p className={styles.hint} style={{ color: '#dc2626' }}>{error}</p>}
      <Button
        variant="inverted"
        fullWidth
        disabled={!url || selectedEvents.length === 0}
        loading={saving}
        onClick={createConfig}
      >
        Create Endpoint
      </Button>
    </div>
  )

  const successContent = (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div className={styles.successTitle}>Endpoint created</div>
      <p className={styles.successSub}>
        Save your signing secret now. It is used to verify webhook payloads and will not be shown again.
      </p>
      <div className={styles.secretBox}>
        <code className={styles.secretVal}>{createdSecret}</code>
        <Button variant="text" onClick={copySecret}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <Button variant="inverted" fullWidth onClick={finish}>Done</Button>
    </div>
  )

  const layers: SheetLayer[] =
    step === 'form'
      ? [{ key: 'form', title: 'New Webhook Endpoint', children: formContent }]
      : [
          { key: 'form', title: 'New Webhook Endpoint', children: formContent },
          { key: 'success', title: 'Save Signing Secret', children: successContent },
        ]

  return <SideSheetStack open={open} onClose={handleClose} layers={layers} />
}
