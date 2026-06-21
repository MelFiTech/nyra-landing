import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useCustomer, useCustomers, useCustomerTransactions } from '../hooks/useAppData'
import {
  findCustomerByWalletId,
  getAccountsForCustomer,
  getEarliestCreatedAt,
  getGroupStatus,
  type GroupStatus,
} from '../lib/customers'
import type { CustomerDetails } from '../lib/api'
import { useToast } from '../context/ToastContext'
import styles from './CustomerDetailPage.module.css'

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

type Tab = 'accounts' | 'transactions' | 'cards'

function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

function formatNaira(value: number | string | undefined | null) {
  const n = Number(value ?? 0)
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fullName(d: CustomerDetails) {
  return [d.first_name, d.middlename, d.last_name].filter(Boolean).join(' ')
}

function addressLine(d: CustomerDetails) {
  return [d.address_line_1, d.address_line_2, d.city, d.country].filter(Boolean).join(', ')
}

function txStatusClass(status: string) {
  if (['successful', 'success', 'completed'].includes(status)) return styles.statusActive
  if (['failed', 'reversed'].includes(status)) return styles.statusFrozen
  return styles.statusMixed
}

function txDotClass(status: string) {
  if (['successful', 'success', 'completed'].includes(status)) return styles.dotActive
  if (['failed', 'reversed'].includes(status)) return styles.dotFrozen
  return styles.dotMixed
}

function StatusBadge({ status }: { status: GroupStatus }) {
  if (status === 'active') {
    return (
      <span className={styles.statusActive}>
        <span className={styles.dotActive} />
        Active
      </span>
    )
  }
  if (status === 'frozen') {
    return (
      <span className={styles.statusFrozen}>
        <span className={styles.dotFrozen} />
        Frozen
      </span>
    )
  }
  return (
    <span className={styles.statusMixed}>
      <span className={styles.dotMixed} />
      Mixed
    </span>
  )
}

export default function CustomerDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('accounts')
  const { data: customerFromApi, isLoading: loadingCustomer } = useCustomer(id)
  const { data: allCustomers = [], isLoading: loadingList } = useCustomers()

  const customer = useMemo(() => {
    if (customerFromApi) return customerFromApi
    if (id) return findCustomerByWalletId(allCustomers, id)
    return null
  }, [customerFromApi, allCustomers, id])

  const accounts = useMemo(() => {
    if (!customer) return []
    return getAccountsForCustomer(allCustomers, customer)
  }, [customer, allCustomers])

  const groupStatus = useMemo(() => getGroupStatus(accounts), [accounts])
  const addedOn = useMemo(() => getEarliestCreatedAt(accounts), [accounts])
  const loading = (loadingCustomer || loadingList) && !customer

  const details = customerFromApi?.customer_details ?? null
  const { data: transactions = [], isLoading: loadingTxns } = useCustomerTransactions(id)

  function copy(text: string, hint = 'Copied to clipboard') {
    navigator.clipboard.writeText(text)
    showToast(hint)
  }

  const displayName = customer?.owners_fullname ?? 'Customer'
  const initial = displayName.trim()[0]?.toUpperCase() ?? '?'

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <button type="button" className={styles.breadcrumbLink} onClick={() => navigate('/app/customers')}>
          Customers
        </button>
        <ChevronRight />
        <span className={styles.breadcrumbCurrent}>{loading ? '…' : displayName}</span>
      </div>

      {loading ? (
        <div className={styles.centerState}>Loading customer…</div>
      ) : !customer ? (
        <div className={styles.centerState}>
          <p className={styles.centerTitle}>Customer not found</p>
          <p className={styles.centerSub}>This customer may have been removed or the link is invalid.</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/app/customers')}>
            Back to customers
          </Button>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.leftPanel}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>{initial}</div>
              <div className={styles.customerName}>{displayName}</div>
              <div className={styles.customerSince}>Added on {formatDate(addedOn)}</div>
              <StatusBadge status={groupStatus} />
            </div>

            <div className={styles.infoList}>
              <InfoRow label="Total accounts" value={String(accounts.length)} />
              <InfoRow
                label="Primary wallet"
                value={accounts[0]?.wallet_id ?? customer.wallet_id}
                copyable
                truncate
                onCopy={copy}
              />
            </div>

            <div className={styles.detailsSection}>
              <div className={styles.detailsHeading}>Submitted details</div>
              {details ? (
                <div className={styles.infoList}>
                  {fullName(details) && <InfoRow label="Full name" value={fullName(details)} />}
                  {details.email && <InfoRow label="Email" value={details.email} copyable onCopy={copy} />}
                  {details.phone_number && <InfoRow label="Phone" value={details.phone_number} copyable onCopy={copy} />}
                  {details.dob && <InfoRow label="Date of birth" value={formatDate(details.dob)} />}
                  {details.gender && <InfoRow label="Gender" value={capitalize(details.gender)} />}
                  {details.title && <InfoRow label="Title" value={details.title} />}
                  {details.bvn && <InfoRow label="BVN" value={details.bvn} />}
                  {addressLine(details) && <InfoRow label="Address" value={addressLine(details)} />}
                </div>
              ) : (
                <p className={styles.detailsEmpty}>
                  No submitted details on record for this customer.
                </p>
              )}
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.tabs}>
              {([
                { id: 'accounts' as Tab, label: accounts.length > 1 ? `Accounts (${accounts.length})` : 'Accounts' },
                { id: 'transactions' as Tab, label: 'Transactions' },
                { id: 'cards' as Tab, label: 'Cards' },
              ]).map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className={styles.tabContent}>
              {tab === 'accounts' && (
                accounts.length === 0 ? (
                  <div className={styles.emptyTab}>No accounts found for this customer.</div>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Account name</th>
                          <th>Account number</th>
                          <th>Bank</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Date added</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map(account => (
                          <tr
                            key={account.wallet_id}
                            className={account.wallet_id === id ? styles.rowHighlight : undefined}
                          >
                            <td className={styles.nameCell}>{account.owners_fullname}</td>
                            <td>
                              <span className={styles.accountNumberCell}>
                                <span className={styles.accountNumber}>{account.account_number}</span>
                                <Button
                                  variant="icon"
                                  iconSm
                                  title="Copy account number"
                                  onClick={() => copy(account.account_number, 'Account number copied')}
                                >
                                  <CopyIcon />
                                </Button>
                              </span>
                            </td>
                            <td>{account.bank_name}</td>
                            <td>{account.is_dva_polaris ? 'Dedicated (Polaris)' : 'Standard'}</td>
                            <td>
                              {account.frozen ? (
                                <span className={styles.statusFrozen}>
                                  <span className={styles.dotFrozen} />
                                  Frozen
                                </span>
                              ) : (
                                <span className={styles.statusActive}>
                                  <span className={styles.dotActive} />
                                  Active
                                </span>
                              )}
                            </td>
                            <td className={styles.dateCell}>{formatDateTime(account.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
              {tab === 'transactions' && (
                loadingTxns ? (
                  <div className={styles.emptyTab}>Loading transactions…</div>
                ) : transactions.length === 0 ? (
                  <div className={styles.emptyTab}>No transactions found for this customer.</div>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(tx => {
                          const credit = tx.transaction_type === 'CREDIT'
                          const status = (tx.transaction_status ?? '').toLowerCase()
                          return (
                            <tr key={tx.transaction_id}>
                              <td className={styles.nameCell}>{tx.description || tx.transaction_reference || '—'}</td>
                              <td>{credit ? 'Credit' : 'Debit'}</td>
                              <td className={credit ? styles.amountCredit : styles.amountDebit}>
                                {credit ? '+' : '-'}{formatNaira(tx.amount)}
                              </td>
                              <td>
                                <span className={txStatusClass(status)}>
                                  <span className={txDotClass(status)} />
                                  {capitalize(status || 'pending')}
                                </span>
                              </td>
                              <td className={styles.dateCell}>{formatDateTime(tx.created_at)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}
              {tab === 'cards' && (
                <div className={styles.emptyTab}>Card issuing is coming soon.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({
  label, value, copyable, truncate, onCopy,
}: {
  label: string
  value: string
  copyable?: boolean
  truncate?: boolean
  onCopy?: (v: string) => void
}) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <div className={styles.infoValueWrap}>
        <span className={`${styles.infoValue} ${truncate ? styles.truncate : ''}`} title={value}>
          {truncate && value.length > 22 ? value.slice(0, 22) + '…' : value}
        </span>
        {copyable && (
          <Button variant="icon" iconSm title="Copy" onClick={() => onCopy?.(value)}>
            <CopyIcon />
          </Button>
        )}
      </div>
    </div>
  )
}
