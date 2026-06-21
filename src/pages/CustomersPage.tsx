import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Button from '../components/ui/Button'
import CreateCustomerModal from '../components/customers/CreateCustomerModal'
import CustomerRowMenu from '../components/customers/CustomerRowMenu'
import { useBusiness } from '../context/BusinessContext'
import { useCustomers } from '../hooks/useAppData'
import { queryKeys } from '../lib/queryKeys'
import {
  customerNameKey,
  getEarliestCreatedAt,
  getGroupStatus,
  sortCustomerAccounts,
  type GroupStatus,
} from '../lib/customers'
import type { CustomerWallet } from '../lib/api'
import { useToast } from '../context/ToastContext'
import styles from './CustomersPage.module.css'

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

type StatusFilter = 'all' | 'active' | 'frozen'

type GroupedCustomer = {
  key: string
  name: string
  accounts: CustomerWallet[]
  primaryWalletId: string
  primaryAccount: CustomerWallet
  createdAt?: string
  status: GroupStatus
}

const PAGE_SIZE = 50

function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function groupCustomers(wallets: CustomerWallet[]): GroupedCustomer[] {
  const map = new Map<string, CustomerWallet[]>()

  for (const wallet of wallets) {
    const key = customerNameKey(wallet.owners_fullname)
    const list = map.get(key) ?? []
    list.push(wallet)
    map.set(key, list)
  }

  return Array.from(map.entries()).map(([key, accounts]) => {
    const sorted = sortCustomerAccounts(accounts)
    const primaryAccount = sorted[0]

    return {
      key,
      name: primaryAccount.owners_fullname,
      accounts: sorted,
      primaryWalletId: primaryAccount.wallet_id,
      primaryAccount,
      createdAt: getEarliestCreatedAt(sorted),
      status: getGroupStatus(sorted),
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
}

export default function CustomersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { businessId } = useBusiness()
  const { showToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data: customers = [], isLoading: loading } = useCustomers()
  const [copied, setCopied] = useState<string | null>(null)

  function copyText(text: string, hint = 'Copied') {
    navigator.clipboard.writeText(text)
    setCopied(text)
    showToast(hint)
    setTimeout(() => setCopied(null), 1500)
  }

  const grouped = useMemo(() => groupCustomers(customers), [customers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return grouped.filter(group => {
      if (statusFilter === 'active' && group.status !== 'active') return false
      if (statusFilter === 'frozen' && group.status === 'active') return false
      if (q) {
        const hay = [
          group.name,
          ...group.accounts.flatMap(a => [a.account_number, a.bank_name, a.wallet_id]),
        ].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [grouped, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      {modalOpen && (
        <CreateCustomerModal
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false)
            showToast('Customer wallet created')
            if (businessId) {
              queryClient.invalidateQueries({ queryKey: queryKeys.customers(businessId) })
            }
          }}
        />
      )}

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Customers</h1>
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            Add Customer +
          </Button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <Button variant="segment" active={statusFilter === 'all'} onClick={() => { setStatusFilter('all'); setPage(1) }}>All</Button>
            <Button variant="segment" active={statusFilter === 'active'} onClick={() => { setStatusFilter('active'); setPage(1) }}>Active</Button>
            <Button variant="segment" active={statusFilter === 'frozen'} onClick={() => { setStatusFilter('frozen'); setPage(1) }}>Frozen</Button>
          </div>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><SearchIcon /></span>
            <input
              className={styles.searchInput}
              placeholder="Search by name, account number, or bank..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Account Number</th>
                <th>Date Added</th>
                <th>Status</th>
                <th className={styles.actionsHead} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    {loading && customers.length === 0
                      ? 'Loading customers…'
                      : filtered.length === 0 && customers.length === 0
                        ? 'No customers yet. Add your first customer to get started.'
                        : 'No customers match your filters.'}
                  </td>
                </tr>
              ) : pageItems.map(group => (
                <tr key={group.key}>
                  <td>
                    <button
                      className={styles.nameLink}
                      onClick={() => navigate(`/app/customers/${group.primaryWalletId}`)}
                    >
                      <div className={styles.customerName}>{group.name}</div>
                      {group.accounts.length > 1 && (
                        <div className={styles.accountCount}>{group.accounts.length} accounts</div>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className={styles.accountCell}>
                      <span className={styles.accountNumber}>{group.primaryAccount.account_number}</span>
                      <span className={styles.accountBank}>{group.primaryAccount.bank_name}</span>
                      <Button
                        variant="icon"
                        iconSm
                        title="Copy account number"
                        onClick={() => copyText(group.primaryAccount.account_number, 'Account number copied')}
                      >
                        <CopyIcon />
                      </Button>
                      {copied === group.primaryAccount.account_number && (
                        <span className={styles.copiedHint}>Copied</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.dateCell}>{formatDate(group.createdAt)}</td>
                  <td>
                    {group.status === 'active' ? (
                      <span className={styles.statusActive}>
                        <span className={styles.dotActive} />
                        Active
                      </span>
                    ) : group.status === 'frozen' ? (
                      <span className={styles.statusPending}>
                        <span className={styles.dot} />
                        Frozen
                      </span>
                    ) : (
                      <span className={styles.statusMixed}>
                        <span className={styles.dotMixed} />
                        Mixed
                      </span>
                    )}
                  </td>
                  <td className={styles.actionsCell}>
                    <CustomerRowMenu
                      items={[
                        {
                          label: 'View details',
                          onClick: () => navigate(`/app/customers/${group.primaryWalletId}`),
                        },
                        {
                          label: 'Copy wallet ID',
                          onClick: () => copyText(group.primaryWalletId, 'Wallet ID copied'),
                        },
                        {
                          label: 'Copy account number',
                          onClick: () => copyText(group.primaryAccount.account_number, 'Account number copied'),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <span className={styles.footerCount}>
            {filtered.length} Customer{filtered.length === 1 ? '' : 's'}
          </span>
          <span className={styles.footerShowing}>
            Showing {pageItems.length} of {filtered.length} results
          </span>
          <div className={styles.pagination}>
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>&#8249; Previous</Button>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next &#8250;</Button>
          </div>
        </div>
      </div>
    </>
  )
}
