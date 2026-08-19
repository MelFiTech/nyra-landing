import { useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import EmptyState, { WebhookEmptyIcon } from '../components/ui/EmptyState'
import { TableRowsSkeleton } from '../components/ui/Skeletons'
import FilterMenu, {
  FilterCheckboxOption,
  FilterDateFields,
  FilterRadioOption,
  FilterSection,
} from '../components/ui/FilterMenu'
import WebhookDeliveryDrawer, { type DeliveryLog } from '../components/webhooks/WebhookDeliveryDrawer'
import { useWebhookDeliveries } from '../hooks/useAppData'
import { webhooksApi, ApiError } from '../lib/api'
import { useBusiness } from '../context/BusinessContext'
import { useToast } from '../context/ToastContext'
import styles from './WebhooksPage.module.css'

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)

const ExportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const RetryIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

type Outcome = DeliveryLog['outcome']
type StatusFilter = 'all' | Outcome
type HttpFilter = 'all' | '2xx' | 'error' | 'none'

type WebhookFilters = {
  events: string[]
  httpFilter: HttpFilter
  startDate: string
  endDate: string
}

const EMPTY_FILTERS: WebhookFilters = {
  events: [],
  httpFilter: 'all',
  startDate: '',
  endDate: '',
}

const PAGE_SIZE = 50

function countActiveFilters(filters: WebhookFilters) {
  let count = 0
  if (filters.events.length > 0) count++
  if (filters.httpFilter !== 'all') count++
  if (filters.startDate) count++
  if (filters.endDate) count++
  return count
}

function matchesHttpFilter(status: number | null, filter: HttpFilter) {
  if (filter === 'all') return true
  if (filter === 'none') return status === null
  if (filter === '2xx') return status !== null && status >= 200 && status < 300
  return status !== null && status >= 400
}

function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  if (outcome === 'delivered') {
    return (
      <span className={styles.badgeSuccess}>
        <span className={styles.badgeIcon}><CheckIcon /></span>
        Delivered
      </span>
    )
  }
  if (outcome === 'failed_retrying') {
    return (
      <span className={styles.badgeRetrying}>
        <span className={styles.badgeIcon}><RetryIcon /></span>
        Retrying
      </span>
    )
  }
  return (
    <span className={styles.badgeFailed}>
      <span className={styles.badgeIcon}><XIcon /></span>
      Failed
    </span>
  )
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function WebhooksPage() {
  const { showToast } = useToast()
  const { businessId, businessesLoading } = useBusiness()
  const { data: logs = [], isLoading: loading, isFetching, isError, error, refetch } = useWebhookDeliveries()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<WebhookFilters>(EMPTY_FILTERS)
  const [draftFilters, setDraftFilters] = useState<WebhookFilters>(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<DeliveryLog | null>(null)
  const [resending, setResending] = useState<string | null>(null)
  const [resent, setResent] = useState<string | null>(null)

  const webhookEvents = useMemo(
    () => [...new Set(logs.map(l => l.event))].sort(),
    [logs]
  )

  const statusCounts = useMemo(() => {
    let delivered = 0
    let failed_retrying = 0
    let failed_final = 0
    for (const log of logs) {
      if (log.outcome === 'delivered') delivered += 1
      else if (log.outcome === 'failed_retrying') failed_retrying += 1
      else if (log.outcome === 'failed_final') failed_final += 1
    }
    return {
      all: logs.length,
      delivered,
      failed_retrying,
      failed_final,
    }
  }, [logs])

  const activeFilterCount = countActiveFilters(filters)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return logs.filter(log => {
      if (statusFilter !== 'all' && log.outcome !== statusFilter) return false
      if (filters.events.length > 0 && !filters.events.includes(log.event)) return false
      if (!matchesHttpFilter(log.http_status, filters.httpFilter)) return false
      if (filters.startDate) {
        const start = new Date(filters.startDate)
        if (new Date(log.created_at) < start) return false
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate)
        end.setHours(23, 59, 59, 999)
        if (new Date(log.created_at) > end) return false
      }
      if (q) {
        const haystack = `${log.id} ${log.event} ${log.target_url} ${log.error_message ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [logs, search, statusFilter, filters])

  function toggleFilters() {
    if (filterOpen) {
      setFilterOpen(false)
      return
    }
    setDraftFilters(filters)
    setFilterOpen(true)
  }

  function applyFilters() {
    setFilters(draftFilters)
    setPage(1)
  }

  function clearFilters() {
    setDraftFilters(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  function toggleEvent(event: string, checked: boolean) {
    setDraftFilters(prev => ({
      ...prev,
      events: checked
        ? [...prev.events, event]
        : prev.events.filter(e => e !== event),
    }))
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    activeFilterCount > 0

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  async function resend(id: string) {
    if (!businessId) return
    setResending(id)
    try {
      await webhooksApi.replayDelivery(businessId, id)
      setResent(id)
      showToast('Webhook replay dispatched')
      setTimeout(() => setResent(null), 3000)
      refetch()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not replay webhook', 'error')
    } finally {
      setResending(null)
    }
  }

  return (
    <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Webhooks</h1>
            <p className={styles.pageSub}>View and export webhook delivery logs</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarActions}>
            <div className={styles.statusFilters}>
              {([
                { key: 'all', label: 'All' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'failed_retrying', label: 'Retrying' },
                { key: 'failed_final', label: 'Failed' },
              ] as const).map(f => (
                <Button
                  key={f.key}
                  variant="segment"
                  active={statusFilter === f.key}
                  onClick={() => { setStatusFilter(f.key); setPage(1) }}
                >
                  {f.label} <span className={styles.tabCount}>{statusCounts[f.key]}</span>
                </Button>
              ))}
            </div>

            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}><SearchIcon /></span>
              <input
                className={styles.searchInput}
                placeholder="Search by event, endpoint, or delivery ID"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>

            <FilterMenu
              open={filterOpen}
              onOpenChange={setFilterOpen}
              onApply={applyFilters}
              onClear={clearFilters}
              canClear={activeFilterCount > 0 || countActiveFilters(draftFilters) > 0}
              trigger={
                <Button
                  variant="filter"
                  size="sm"
                  type="button"
                  active={activeFilterCount > 0}
                  onClick={toggleFilters}
                >
                  <FilterIcon />
                  Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </Button>
              }
            >
              <FilterSection title="Date range" stacked={false}>
                <FilterDateFields
                  startDate={draftFilters.startDate}
                  endDate={draftFilters.endDate}
                  onStartChange={value => setDraftFilters(prev => ({ ...prev, startDate: value }))}
                  onEndChange={value => setDraftFilters(prev => ({ ...prev, endDate: value }))}
                />
              </FilterSection>

              <FilterSection title="Event">
                {webhookEvents.map(event => (
                  <FilterCheckboxOption
                    key={event}
                    label={event}
                    checked={draftFilters.events.includes(event)}
                    onChange={checked => toggleEvent(event, checked)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="HTTP response">
                {([
                  { value: 'all', label: 'All' },
                  { value: '2xx', label: 'Success (2xx)' },
                  { value: 'error', label: 'Error (4xx/5xx)' },
                  { value: 'none', label: 'No response' },
                ] as const).map(option => (
                  <FilterRadioOption
                    key={option.value}
                    name="webhook-http"
                    label={option.label}
                    checked={draftFilters.httpFilter === option.value}
                    onChange={() => setDraftFilters(prev => ({ ...prev, httpFilter: option.value }))}
                  />
                ))}
              </FilterSection>
            </FilterMenu>

            <div className={styles.toolbarEnd}>
              <button
                type="button"
                className={styles.refreshBtn}
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh deliveries"
                aria-label="Refresh deliveries"
              >
                <span className={isFetching ? styles.refreshSpinning : undefined}>
                  <RefreshIcon />
                </span>
              </button>
              <Button variant="outline" size="sm" type="button">
                <ExportIcon />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          {businessesLoading || (loading && logs.length === 0 && !isError) ? (
            <TableRowsSkeleton rows={8} />
          ) : isError && logs.length === 0 ? (
            <EmptyState
              icon={<WebhookEmptyIcon />}
              title="Could not load deliveries"
              description={(error as Error)?.message || 'Check your connection and try again'}
              action={
                <Button variant="outline" size="sm" onClick={() => void refetch()}>
                  Retry
                </Button>
              }
            />
          ) : pageItems.length === 0 ? (
            <EmptyState
              icon={<WebhookEmptyIcon />}
              title={logs.length === 0 ? 'No deliveries yet' : 'No matching deliveries'}
              description={
                logs.length === 0
                  ? 'Webhook deliveries will appear here once events fire'
                  : hasActiveFilters
                    ? 'Try adjusting your search or filters'
                    : 'No deliveries match the current view'
              }
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Endpoint</th>
                  <th>HTTP</th>
                  <th>Attempt</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(log => (
                  <tr
                    key={log.id}
                    className={styles.row}
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className={styles.eventCell}>{log.event}</td>
                    <td className={styles.endpointCell}>{log.target_url}</td>
                    <td>
                      {log.http_status ? (
                        <span className={`${styles.httpStatus} ${log.http_status >= 200 && log.http_status < 300 ? styles.httpOk : styles.httpFail}`}>
                          {log.http_status}
                        </span>
                      ) : (
                        <span className={styles.httpNull}>—</span>
                      )}
                    </td>
                    <td className={styles.attemptCell}>
                      {log.attempt_number}{log.attempt_number === 5 ? ' (max)' : ''}
                    </td>
                    <td className={styles.timeCell}>{timeAgo(log.created_at)}</td>
                    <td><OutcomeBadge outcome={log.outcome} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerMeta}>
            Showing {pageItems.length} of {filtered.length} deliveries
          </span>
          <div className={styles.pagination}>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className={styles.footerPage}>Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>

      <WebhookDeliveryDrawer
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onResend={resend}
        resending={resending === selectedLog?.id}
        resent={resent === selectedLog?.id}
      />
    </div>
  )
}
