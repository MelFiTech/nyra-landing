import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '../components/ui/Button'
import EmptyState, { UsersEmptyIcon } from '../components/ui/EmptyState'
import AddWebhookEndpointSheet, { type WebhookConfig } from '../components/webhooks/AddWebhookEndpointSheet'
import AddTeamMemberSheet from '../components/team/AddTeamMemberSheet'
import { BRAND } from '../lib/brand'
import {
  session,
  webhooksApi,
  passwordApi,
  walletApi,
  apiClientApi,
  businessApi,
  teamApi,
  ApiError,
} from '../lib/api'
import { useBusiness, usePermissions } from '../context/BusinessContext'
import { useApiClient, useWebhookConfigs } from '../hooks/useAppData'
import { queryKeys } from '../lib/queryKeys'
import { useToast } from '../context/ToastContext'
import {
  ASSIGNABLE_TEAM_ROLES,
  type BusinessTeamRole,
} from '../lib/teamPermissions'
import styles from './SettingsPage.module.css'

type Tab = 'profile' | 'compliance' | 'api-keys' | 'webhooks' | 'team' | 'security' | 'notifications'

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'api-keys', label: 'API Keys' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'team', label: 'Team' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
]

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  BUSINESS_NAME: 'Business Name',
  REGISTERED_COMPANY: 'Registered Company',
  INCORPORATED_TRUSTEES: 'Incorporated Trustees',
  LIMITED_PARTNERSHIP: 'Limited Partnership',
  LIMITED_LIABILITY_PARTNERSHIP: 'Limited Liability Partnership',
}

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
      onClick={onChange}
      disabled={disabled}
      aria-pressed={on}
    >
      <span className={styles.toggleKnob} />
    </button>
  )
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="icon" onClick={copy} title="Copy">
      {copied
        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
    </Button>
  )
}

// --- API Keys Tab ---
function ApiKeysTab() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { businessId, business } = useBusiness()
  const { canManageApiKeys } = usePermissions()
  const queryClient = useQueryClient()
  const verificationStatus = business?.verification_status ?? 'NOT_STARTED'
  const isVerified = verificationStatus === 'VERIFIED'
  const { data: client, isLoading: loading } = useApiClient()
  const [newCredentials, setNewCredentials] = useState<{ client_id: string; client_secret: string } | null>(null)
  const [secretRevealed, setSecretRevealed] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [appName, setAppName] = useState('')
  const [creating, setCreating] = useState(false)

  const apiBaseUrl =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:2900/api/v1'

  function openCreate(prefillName?: string) {
    setCreateOpen(true)
    setAppName(prefillName ?? (business?.name ? `${business.name} API` : ''))
  }

  async function generate() {
    if (!businessId || !appName.trim()) return
    setCreating(true)
    try {
      const result = await apiClientApi.create(businessId, appName.trim())
      setNewCredentials({
        client_id: result.client_id,
        client_secret: result.client_secret,
      })
      setSecretRevealed(false)
      setCreateOpen(false)
      setAppName('')
      showToast(result.message ?? (client ? 'API secret rotated' : 'API key created'))
      await queryClient.invalidateQueries({ queryKey: queryKeys.apiClient(businessId) })
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not generate API key', 'error')
    } finally {
      setCreating(false)
    }
  }

  const verificationGate = (() => {
    if (isVerified) return null
    if (verificationStatus === 'PENDING') {
      return {
        title: 'Verification in progress',
        sub: 'API credentials are available after your business KYB is approved. This usually takes 24–48 hours.',
      }
    }
    if (verificationStatus === 'REJECTED') {
      return {
        title: 'Verification required',
        sub: 'Your business KYB was rejected. Contact support or resubmit compliance documents before creating API keys.',
      }
    }
    return {
      title: 'Complete verification first',
      sub: 'Generate API credentials after your business passes KYB verification.',
    }
  })()

  if (verificationGate) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionTitle}>API Credentials</div>
            <div className={styles.sectionSub}>
              Authenticate requests to the Nyra B2B API with client credentials. Keys are issued once your business is verified.
            </div>
          </div>
        </div>
        <div className={styles.keysEmpty}>
          <div className={styles.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>{verificationGate.title}</p>
          <p className={styles.emptySub}>{verificationGate.sub}</p>
          {verificationStatus !== 'PENDING' && (
            <Button variant="primary" size="sm" onClick={() => navigate('/app/compliance')}>
              {verificationStatus === 'REJECTED' ? 'Review compliance' : 'Complete verification'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>API Credentials</div>
          <div className={styles.sectionSub}>
            Authenticate requests to the Nyra B2B API with these credentials. Your secret is shown only once. Store it securely.
          </div>
        </div>
        {canManageApiKeys && client && !createOpen && (
          <Button variant="text" onClick={() => openCreate(client.app_name)}>Rotate Key</Button>
        )}
      </div>

      {!canManageApiKeys && (
        <p className={styles.roleHint}>
          Your role can view API credentials but cannot create or rotate keys. Ask the business owner or a developer.
        </p>
      )}

      {newCredentials && (
        <div className={styles.secretBanner}>
          <div className={styles.secretBannerIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.secretBannerTitle}>Save your credentials now</div>
            <div className={styles.secretBannerSub}>Your client secret is shown only once. Store both values securely.</div>
            <div className={styles.secretField}>
              <span className={styles.secretFieldLabel}>Client ID</span>
              <div className={styles.secretRow}>
                <span className={styles.secretVal}>{newCredentials.client_id}</span>
                <CopyBtn value={newCredentials.client_id} />
              </div>
            </div>
            <div className={styles.secretField}>
              <span className={styles.secretFieldLabel}>Client Secret</span>
              <div className={styles.secretRow}>
                <span className={styles.secretVal}>
                  {secretRevealed
                    ? newCredentials.client_secret
                    : newCredentials.client_secret.slice(0, 8) + '•'.repeat(28)}
                </span>
                <Button variant="text" onClick={() => setSecretRevealed(v => !v)}>{secretRevealed ? 'Hide' : 'Reveal'}</Button>
                <CopyBtn value={newCredentials.client_secret} />
              </div>
            </div>
          </div>
          <Button variant="icon" onClick={() => setNewCredentials(null)} aria-label="Dismiss">✕</Button>
        </div>
      )}

      {canManageApiKeys && createOpen && (
        <div className={styles.createCard}>
          <div className={styles.createCardTitle}>{client ? 'Rotate' : 'Generate'} API Key</div>
          {client && <div className={styles.sectionSub} style={{ marginBottom: 10 }}>Rotating replaces your existing secret. Update your integrations after rotating.</div>}
          <div className={styles.field}>
            <label className={styles.label}>App / Key Name</label>
            <input className={styles.input} placeholder="e.g. Production Server" value={appName} onChange={e => setAppName(e.target.value)} />
          </div>
          <div className={styles.rowBtns}>
            <Button variant="secondary" className={styles.formAction} onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" className={styles.formAction} disabled={!appName.trim()} loading={creating} onClick={generate}>
              {client ? 'Rotate' : 'Generate'}
            </Button>
          </div>
        </div>
      )}

      {loading && !client ? (
        <div className={styles.keysEmpty}><p className={styles.emptySub}>Loading…</p></div>
      ) : client ? (
        <div className={styles.credCard}>
          <div className={styles.credCardHeader}>
            <div>
              <div className={styles.credCardTitle}>{client.app_name}</div>
              <div className={styles.credCardEnv}>
                <span className={`${styles.statusDot} ${client.is_active ? styles.statusActive : styles.statusInactive}`} />
                {client.is_active ? 'Active' : 'Inactive'} · {client.environment}
              </div>
            </div>
          </div>
          <div className={styles.credRows}>
            <div className={styles.credRow}>
              <span className={styles.credLabel}>Client ID</span>
              <div className={styles.credValueRow}>
                <code className={styles.credValue}>{client.client_id}</code>
                <CopyBtn value={client.client_id} />
              </div>
            </div>
            <div className={styles.credRow}>
              <span className={styles.credLabel}>Client Secret</span>
              <div className={styles.credValueRow}>
                <code className={styles.credValue}>{'•'.repeat(32)}</code>
                <span className={styles.credHint}>Shown once at creation</span>
              </div>
            </div>
            <div className={styles.credRow}>
              <span className={styles.credLabel}>Last Used</span>
              <span className={styles.credValue}>
                {client.last_used_at ? new Date(client.last_used_at).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      ) : !createOpen && (
        <div className={styles.keysEmpty}>
          <div className={styles.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>No API key yet</p>
          <p className={styles.emptySub}>Generate credentials to start using the Nyra API</p>
          {canManageApiKeys && (
            <Button variant="primary" size="sm" onClick={() => openCreate()}>Generate Key</Button>
          )}
        </div>
      )}

      {client && (
        <div className={styles.usageCard}>
          <div className={styles.usageCardTitle}>How to authenticate</div>
          <p className={styles.usageCardSub}>
            Send your client ID and secret on every Business API request. The secret is shown once when you create credentials.
          </p>
          <code className={styles.usageCode}>
            {`GET ${apiBaseUrl}/business/wallets/float\nx-client-id: <client_id>\nAuthorization: Bearer <live_sk_…>`}
          </code>
        </div>
      )}
    </div>
  )
}

// --- Webhooks Tab ---
function WebhooksTab() {
  const { showToast } = useToast()
  const { businessId } = useBusiness()
  const { canManageWebhooks } = usePermissions()
  const queryClient = useQueryClient()
  const { data: rawConfigs = [], isLoading: loading } = useWebhookConfigs()
  const configs = useMemo<WebhookConfig[]>(
    () => rawConfigs.map(c => ({
      id: c.id,
      name: c.name ?? '',
      url: c.url,
      subscribed_events: c.subscribed_events ?? [],
      created_at: c.created_at,
    })),
    [rawConfigs]
  )
  const [sheetOpen, setSheetOpen] = useState(false)
  const [newSecret, setNewSecret] = useState<{ configId: string; secret: string } | null>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  async function refreshConfigs() {
    if (!businessId) return
    await queryClient.invalidateQueries({ queryKey: queryKeys.webhookConfigs(businessId) })
  }

  async function regenerateSecret(configId: string) {
    if (!businessId) return
    setBusy(configId)
    try {
      const { new_secret } = await webhooksApi.regenerateSecret(businessId, configId)
      setNewSecret({ configId, secret: new_secret })
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not regenerate secret', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function deleteConfig(configId: string) {
    if (!businessId) return
    setBusy(configId)
    try {
      await webhooksApi.deleteConfig(businessId, configId)
      if (newSecret?.configId === configId) setNewSecret(null)
      showToast('Endpoint deleted')
      await refreshConfigs()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not delete endpoint', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function sendTest() {
    if (!businessId) return
    setTesting('all')
    try {
      await webhooksApi.testWebhook(businessId)
      showToast('Test event dispatched')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not send test event', 'error')
    } finally {
      setTesting(null)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>Webhook Endpoints</div>
          <div className={styles.sectionSub}>Configure URLs to receive real-time event notifications from Nyra.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canManageWebhooks && configs.length > 0 && (
            <Button variant="secondary" size="sm" onClick={sendTest} loading={testing === 'all'}>Send test event</Button>
          )}
          {canManageWebhooks && (
            <Button variant="primary" size="sm" onClick={() => setSheetOpen(true)}>+ Add Endpoint</Button>
          )}
        </div>
      </div>

      {!canManageWebhooks && (
        <p className={styles.roleHint}>
          Your role can view webhooks but cannot add or change endpoints. Ask the business owner or a developer.
        </p>
      )}

      {newSecret && (
        <div className={styles.secretBanner}>
          <div className={styles.secretBannerIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.secretBannerTitle}>Save your signing secret</div>
            <div className={styles.secretBannerSub}>Used to verify webhook payloads. It won't be shown again.</div>
            <div className={styles.secretRow}>
              <code className={styles.secretVal}>{newSecret.secret}</code>
              <CopyBtn value={newSecret.secret} />
            </div>
          </div>
          <Button variant="icon" onClick={() => setNewSecret(null)} aria-label="Dismiss">✕</Button>
        </div>
      )}

      {loading && configs.length === 0 ? (
        <div className={styles.emptyBlock}><p className={styles.emptySub}>Loading…</p></div>
      ) : configs.length === 0 ? (
        <div className={styles.emptyBlock}>
          <div className={styles.emptyIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>No webhook endpoints</p>
          <p className={styles.emptySub}>Add an endpoint to receive real-time transaction events</p>
          {canManageWebhooks && (
            <Button variant="primary" size="sm" onClick={() => setSheetOpen(true)}>+ Add Endpoint</Button>
          )}
        </div>
      ) : (
        <div className={styles.webhookList}>
          {configs.map(cfg => (
            <div key={cfg.id} className={styles.webhookCard}>
              <div className={styles.webhookCardHeader}>
                <div>
                  <div className={styles.webhookCardTitle}>{cfg.name || 'Unnamed endpoint'}</div>
                  <div className={styles.webhookUrl}>{cfg.url}</div>
                </div>
                <div className={styles.webhookActions}>
                  {canManageWebhooks && (
                    <>
                      <Button variant="icon" title="Regenerate signing secret" onClick={() => regenerateSecret(cfg.id)} loading={busy === cfg.id}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                      </Button>
                      <Button variant="icon" style={{ color: '#dc2626' }} title="Delete" onClick={() => deleteConfig(cfg.id)} loading={busy === cfg.id}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.eventTags}>
                {cfg.subscribed_events.map(ev => (
                  <span key={ev} className={styles.eventTag}>{ev}</span>
                ))}
              </div>
              <div className={styles.webhookMeta}>
                Added {new Date(cfg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {businessId && (
        <AddWebhookEndpointSheet
          open={sheetOpen}
          businessId={businessId}
          onClose={() => setSheetOpen(false)}
          onCreated={() => { setSheetOpen(false); refreshConfigs() }}
        />
      )}
    </div>
  )
}

// --- Profile Tab ---
function ProfileTab() {
  const user = session.user
  return (
    <div className={`${styles.section} ${styles.sectionCol}`}>
      <div className={styles.sectionTitle}>Profile Information</div>
      <div className={styles.avatarRow}>
        <div className={styles.avatar}>
          {(user?.firstname?.[0] ?? '') + (user?.lastname?.[0] ?? '') || 'U'}
        </div>
        <div>
          <div className={styles.sectionSub}>{user?.firstname} {user?.lastname}</div>
          <p className={styles.avatarNote}>{user?.email}</p>
        </div>
      </div>
      <div className={styles.profileForm}>
        <div className={styles.field}>
          <label className={styles.label}>First Name</label>
          <input className={`${styles.input} ${styles.inputReadonly}`} value={user?.firstname ?? ''} readOnly />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Last Name</label>
          <input className={`${styles.input} ${styles.inputReadonly}`} value={user?.lastname ?? ''} readOnly />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input className={`${styles.input} ${styles.inputReadonly}`} value={user?.email ?? ''} readOnly />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Business</label>
          <input className={`${styles.input} ${styles.inputReadonly}`} value={session.business?.name ?? '—'} readOnly />
        </div>
      </div>
    </div>
  )
}

// --- Compliance Tab ---
function ComplianceTab() {
  const navigate = useNavigate()
  const { business } = useBusiness()
  const backendStatus = business?.verification_status ?? 'NOT_STARTED'
  const status = backendStatus === 'VERIFIED'
    ? 'verified'
    : backendStatus === 'PENDING'
      ? 'pending'
      : 'unverified'

  const badgeClass = status === 'verified'
    ? styles.complianceBadge
    : status === 'pending'
      ? styles.complianceBadgePending
      : styles.complianceBadgeUnverified

  const badgeLabel = status === 'verified'
    ? 'Verified'
    : status === 'pending'
      ? 'Under review'
      : 'Not verified'

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>Compliance</div>
          <div className={styles.sectionSub}>Business verification status and registered details.</div>
        </div>
        <span className={badgeClass}>{badgeLabel}</span>
      </div>

      {status === 'unverified' ? (
        <div className={styles.complianceEmpty}>
          <p className={styles.complianceEmptyText}>
            Your business has not completed KYB verification yet. Complete verification to unlock full transaction limits.
          </p>
          <Button variant="primary" size="sm" className={styles.formAction} type="button" onClick={() => navigate('/app/compliance')}>
            Complete verification
          </Button>
        </div>
      ) : (
        <div className={styles.complianceGrid}>
          <div className={styles.complianceCard}>
            <div className={styles.complianceCardTitle}>Business Details</div>
            <div className={styles.complianceRows}>
              <div className={styles.complianceRow}>
                <span className={styles.complianceLabel}>Legal Name</span>
                <span className={styles.complianceValue}>{business?.name ?? '—'}</span>
              </div>
              <div className={styles.complianceRow}>
                <span className={styles.complianceLabel}>Business Type</span>
                <span className={styles.complianceValue}>
                  {business?.business_type ? (BUSINESS_TYPE_LABELS[business.business_type] ?? business.business_type) : '—'}
                </span>
              </div>
              <div className={styles.complianceRow}>
                <span className={styles.complianceLabel}>Address</span>
                <span className={styles.complianceValue}>{(business?.address as string) ?? '—'}</span>
              </div>
              <div className={styles.complianceRow}>
                <span className={styles.complianceLabel}>Status</span>
                <span className={styles.complianceValue}>{badgeLabel}</span>
              </div>
            </div>
          </div>

          {status === 'pending' && (
            <div className={styles.complianceCard}>
              <div className={styles.complianceCardTitle}>Review in progress</div>
              <p className={styles.sectionSub}>
                Your documents have been submitted and are under review. This typically takes 24–48 hours.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Security Tab ---
function SecurityTab() {
  const { showToast } = useToast()
  const { businessId } = useBusiness()
  const { canManageSecurity } = usePermissions()

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  async function changePassword() {
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match'); return }
    if (newPwd.length < 8) { setPwdError('Password must be at least 8 characters'); return }
    setPwdError('')
    setPwdLoading(true)
    try {
      await passwordApi.update(currentPwd, newPwd)
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
      showToast('Password changed successfully')
    } catch (err) {
      setPwdError(err instanceof ApiError ? err.message : 'Could not change password')
    } finally {
      setPwdLoading(false)
    }
  }

  async function changePin() {
    if (!businessId) return
    if (!/^\d{4}$/.test(oldPin) || !/^\d{4}$/.test(newPin)) {
      setPinError('PINs must be 4 digits'); return
    }
    setPinError('')
    setPinLoading(true)
    try {
      await walletApi.updatePin(businessId, oldPin, newPin)
      setOldPin(''); setNewPin('')
      showToast('Transaction PIN updated')
    } catch (err) {
      setPinError(err instanceof ApiError ? err.message : 'Could not update PIN')
    } finally {
      setPinLoading(false)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Security Settings</div>
      <div className={styles.secGrid}>
        <div className={styles.secCard}>
          <div className={styles.secCardTitle}>Change Password</div>
          <div className={styles.secCardSub}>Update your account login password</div>
          <div className={styles.secCardForm}>
            <div className={styles.field}><label className={styles.label}>Current Password</label><input className={styles.input} type="password" placeholder="••••••••" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} /></div>
            <div className={styles.field}><label className={styles.label}>New Password</label><input className={styles.input} type="password" placeholder="••••••••" value={newPwd} onChange={e => setNewPwd(e.target.value)} /></div>
            <div className={styles.field}><label className={styles.label}>Confirm New Password</label><input className={styles.input} type="password" placeholder="••••••••" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} /></div>
            {pwdError && <p className={styles.errorText}>{pwdError}</p>}
            <Button variant="primary" size="sm" className={styles.formAction} disabled={!currentPwd || !newPwd || !confirmPwd} loading={pwdLoading} onClick={changePassword}>Update Password</Button>
          </div>
        </div>
        <div className={styles.secCard}>
          <div className={styles.secCardTitle}>Transaction PIN</div>
          <div className={styles.secCardSub}>4-digit PIN to authorize fund movements</div>
          {!canManageSecurity ? (
            <p className={styles.roleHint}>Only the business owner can change the transaction PIN.</p>
          ) : (
            <div className={styles.secCardForm}>
              <div className={styles.pinRow}>
                <div className={styles.field}><label className={styles.label}>Current PIN</label><input className={styles.input} type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={oldPin} onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))} /></div>
                <div className={styles.field}><label className={styles.label}>New PIN</label><input className={styles.input} type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} /></div>
              </div>
              {pinError && <p className={styles.errorText}>{pinError}</p>}
              <Button variant="primary" size="sm" className={styles.formAction} disabled={oldPin.length !== 4 || newPin.length !== 4} loading={pinLoading} onClick={changePin}>Change PIN</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Team Tab ---
function TeamTab() {
  const { showToast } = useToast()
  const { businessId } = useBusiness()
  const { canManageTeam } = usePermissions()
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [resendingId, setResendingId] = useState<string | null>(null)

  const { data: members = [], isLoading, isFetching } = useQuery({
    queryKey: queryKeys.team(businessId ?? ''),
    queryFn: () => teamApi.list(businessId!),
    enabled: !!businessId && canManageTeam,
  })

  const teamMembers = members.filter(
    m => !m.is_owner && m.role !== 'OWNER',
  )

  async function refresh() {
    if (!businessId) return
    await queryClient.invalidateQueries({ queryKey: queryKeys.team(businessId) })
  }

  async function handleRoleChange(memberId: string, nextRole: Exclude<BusinessTeamRole, 'OWNER'>) {
    if (!businessId) return
    try {
      await teamApi.updateRole(businessId, memberId, nextRole)
      showToast('Role updated')
      await refresh()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update role', 'error')
    }
  }

  async function handleResend(memberId: string) {
    if (!businessId) return
    setResendingId(memberId)
    try {
      await teamApi.resendInvite(businessId, memberId)
      showToast('Invite resent. It expires in 24 hours.')
      await refresh()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not resend invite', 'error')
    } finally {
      setResendingId(null)
    }
  }

  async function handleRemove(memberId: string) {
    if (!businessId) return
    try {
      await teamApi.remove(businessId, memberId)
      showToast('Member removed')
      await refresh()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not remove member', 'error')
    }
  }

  function memberStatusLabel(member: (typeof teamMembers)[number]) {
    if (member.status !== 'PENDING') return ''
    if (member.invite_expired) return ' · Expired'
    return ' · Pending'
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>Team</div>
        </div>
        {canManageTeam && (
          <Button variant="primary" size="sm" onClick={() => setSheetOpen(true)}>
            + Add team member
          </Button>
        )}
      </div>

      {!canManageTeam ? (
        <p className={styles.roleHint}>
          Only the business owner can invite or manage team members.
        </p>
      ) : (
        <>
          <div className={styles.teamRoleGuide}>
            {ASSIGNABLE_TEAM_ROLES.map(r => (
              <div key={r.value} className={styles.teamRoleGuideItem}>
                <strong>{r.label}</strong>
                <span>{r.description}</span>
              </div>
            ))}
          </div>

          <div className={styles.teamList}>
            {isLoading || (isFetching && teamMembers.length === 0) ? (
              <div className={styles.teamSkeletons} aria-busy="true" aria-label="Loading team members">
                {[0, 1, 2].map(i => (
                  <div key={i} className={styles.teamSkeletonRow}>
                    <div className={styles.teamSkeletonAvatar} />
                    <div className={styles.teamSkeletonInfo}>
                      <div className={styles.teamSkeletonLine} style={{ width: '42%' }} />
                      <div className={styles.teamSkeletonLine} style={{ width: '58%' }} />
                    </div>
                    <div className={styles.teamSkeletonAction} />
                  </div>
                ))}
              </div>
            ) : teamMembers.length === 0 ? (
              <EmptyState
                icon={<UsersEmptyIcon />}
                title="No team members yet"
                description="Add people to give them access to this business"
              />
            ) : (
              teamMembers.map(member => (
                <div key={member.id} className={styles.teamRow}>
                  <div className={styles.teamAvatar}>
                    {(member.name || member.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.teamInfo}>
                    <div className={styles.teamName}>{member.name || member.email}</div>
                    <div className={styles.teamMeta}>
                      {member.email}
                      {memberStatusLabel(member)}
                    </div>
                  </div>
                  <div className={styles.teamActions}>
                    {member.status === 'PENDING' ? (
                      <Button
                        variant="text"
                        size="sm"
                        loading={resendingId === member.id}
                        onClick={() => handleResend(member.id)}
                      >
                        Resend invite
                      </Button>
                    ) : (
                      <select
                        className={styles.teamRoleSelect}
                        value={member.role}
                        onChange={e =>
                          handleRoleChange(
                            member.id,
                            e.target.value as Exclude<BusinessTeamRole, 'OWNER'>,
                          )
                        }
                      >
                        {ASSIGNABLE_TEAM_ROLES.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    )}
                    <Button variant="text" size="sm" onClick={() => handleRemove(member.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {businessId && (
            <AddTeamMemberSheet
              open={sheetOpen}
              onClose={() => setSheetOpen(false)}
              businessId={businessId}
              onCreated={() => {
                showToast('Team member invited. Invite expires in 24 hours.')
                void refresh()
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

// --- Notifications Tab ---
function NotificationsTab() {
  const { showToast } = useToast()
  const { businessId } = useBusiness()
  const { canManageNotifications } = usePermissions()
  const [prefs, setPrefs] = useState({
    email_float_topups: true,
    email_customer_collection_credits: false,
  })
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  useEffect(() => {
    if (!businessId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    businessApi
      .getNotificationPreferences(businessId)
      .then(next => {
        if (cancelled) return
        setPrefs(next)
      })
      .catch(err => {
        if (cancelled) return
        showToast(err instanceof ApiError ? err.message : 'Could not load notification preferences', 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [businessId, showToast])

  async function togglePref(key: keyof typeof prefs, labelOn: string, labelOff: string) {
    if (!businessId || loading || savingKey || !canManageNotifications) return
    const next = !prefs[key]
    setPrefs(prev => ({ ...prev, [key]: next }))
    setSavingKey(key)
    try {
      const updated = await businessApi.updateNotificationPreferences(businessId, { [key]: next })
      setPrefs(updated)
      showToast(updated[key] ? labelOn : labelOff)
    } catch (err) {
      setPrefs(prev => ({ ...prev, [key]: !next }))
      showToast(err instanceof ApiError ? err.message : 'Could not update preference', 'error')
    } finally {
      setSavingKey(null)
    }
  }

  const rows: {
    key: keyof typeof prefs
    label: string
    desc: string
    labelOn: string
    labelOff: string
  }[] = [
    {
      key: 'email_float_topups',
      label: 'Email me for float top-ups',
      desc: 'Get an email when your float wallet is credited.',
      labelOn: 'Float top-up emails enabled',
      labelOff: 'Float top-up emails disabled',
    },
    {
      key: 'email_customer_collection_credits',
      label: 'Email me for every customer collection',
      desc: 'Get an email when a customer account receives a collection credit.',
      labelOn: 'Customer collection emails enabled',
      labelOff: 'Customer collection emails disabled',
    },
  ]

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Notification Preferences</div>
      {!canManageNotifications && (
        <p className={styles.roleHint}>Only the business owner can change notification preferences.</p>
      )}
      <div className={styles.notifList}>
        {loading ? (
          <div className={styles.notifSkeletons} aria-busy="true" aria-label="Loading notification preferences">
            {[0, 1].map(i => (
              <div key={i} className={styles.notifSkeletonRow}>
                <div className={styles.notifSkeletonInfo}>
                  <div className={styles.notifSkeletonLine} style={{ width: '48%' }} />
                  <div className={styles.notifSkeletonLine} style={{ width: '72%' }} />
                </div>
                <div className={styles.notifSkeletonToggle} />
              </div>
            ))}
          </div>
        ) : (
          rows.map(row => (
            <div key={row.key} className={styles.notifRow}>
              <div>
                <div className={styles.notifLabel}>{row.label}</div>
                <div className={styles.notifDesc}>{row.desc}</div>
              </div>
              <Toggle
                on={prefs[row.key]}
                onChange={() => togglePref(row.key, row.labelOn, row.labelOff)}
                disabled={!canManageNotifications || !!savingKey || !businessId}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
      </div>
      <div className={styles.tabsBar}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        <div className={styles.contentPanel}>
          <div className={tab === 'profile' ? styles.tabPane : styles.tabPaneHidden}>
            <ProfileTab />
          </div>
          <div className={tab === 'compliance' ? styles.tabPane : styles.tabPaneHidden}>
            <ComplianceTab />
          </div>
          <div className={tab === 'api-keys' ? styles.tabPane : styles.tabPaneHidden}>
            <ApiKeysTab />
          </div>
          <div className={tab === 'webhooks' ? styles.tabPane : styles.tabPaneHidden}>
            <WebhooksTab />
          </div>
          <div className={tab === 'team' ? styles.tabPane : styles.tabPaneHidden}>
            <TeamTab />
          </div>
          <div className={tab === 'security' ? styles.tabPane : styles.tabPaneHidden}>
            <SecurityTab />
          </div>
          <div className={tab === 'notifications' ? styles.tabPane : styles.tabPaneHidden}>
            <NotificationsTab />
          </div>
        </div>
      </div>
    </div>
  )
}
