import { useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import EmptyState, { DocumentEmptyIcon } from '../components/ui/EmptyState'
import FilterMenu, {
  FilterCheckboxOption,
  FilterDateFields,
  FilterRadioOption,
  FilterSection,
} from '../components/ui/FilterMenu'
import TransactionDrawer, { type Transaction } from '../components/treasury/TransactionDrawer'
import { useBalance } from '../context/BalanceContext'
import { useTransactions } from '../hooks/useAppData'
import { mapApiTransaction } from '../lib/mapTransaction'
import styles from './TransactionsPage.module.css'

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

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

function exportTransactions(rows: Transaction[]) {
  const headers = ['Reference', 'From / To', 'Method', 'Amount', 'Date', 'Status']
  const escape = (value: string) => `"${String(value).replace(/"/g, '""')}"`
  const lines = rows.map(tx =>
    [tx.reference, tx.fromTo, tx.method, tx.amountRaw, tx.date, tx.status].map(escape).join(',')
  )
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}


type StatusFilter = 'all' | 'successful' | 'failed'
type TypeFilter = 'all' | 'credit' | 'debit'

type TxFilters = {
  methods: string[]
  type: TypeFilter
  startDate: string
  endDate: string
}

const EMPTY_FILTERS: TxFilters = {
  methods: [],
  type: 'all',
  startDate: '',
  endDate: '',
}

const PAGE_SIZE = 50

function parseTxDate(date: string) {
  return new Date(date)
}

function countActiveFilters(filters: TxFilters) {
  let count = 0
  if (filters.methods.length > 0) count++
  if (filters.type !== 'all') count++
  if (filters.startDate) count++
  if (filters.endDate) count++
  return count
}

export default function TransactionsPage() {
  const { visible } = useBalance()
  const maskAmt = (val: string) => visible ? val : '••••••'
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<TxFilters>(EMPTY_FILTERS)
  const [draftFilters, setDraftFilters] = useState<TxFilters>(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const listParams = useMemo(
    () => ({
      page_size: 200,
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(filters.startDate ? { from: filters.startDate } : {}),
      ...(filters.endDate ? { to: filters.endDate } : {}),
    }),
    [statusFilter, filters.startDate, filters.endDate],
  )

  const { data: apiTransactions = [], isLoading: loading, isError } = useTransactions(listParams)

  const transactions = useMemo(
    () => apiTransactions.map(mapApiTransaction),
    [apiTransactions]
  )

  const txMethods = useMemo(
    () => [...new Set(transactions.map(tx => tx.method))].filter(m => m !== '—'),
    [transactions]
  )

  const activeFilterCount = countActiveFilters(filters)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return transactions.filter(tx => {
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false
      if (filters.methods.length > 0 && !filters.methods.includes(tx.method)) return false
      if (filters.type !== 'all' && tx.amountType !== filters.type) return false
      if (filters.startDate) {
        const start = new Date(filters.startDate)
        if (parseTxDate(tx.date) < start) return false
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate)
        end.setHours(23, 59, 59, 999)
        if (parseTxDate(tx.date) > end) return false
      }
      if (q) {
        const haystack = `${tx.reference} ${tx.fromTo} ${tx.method} ${tx.summary}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [transactions, search, statusFilter, filters])

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

  function toggleMethod(method: string, checked: boolean) {
    setDraftFilters(prev => ({
      ...prev,
      methods: checked
        ? [...prev.methods, method]
        : prev.methods.filter(m => m !== method),
    }))
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    countActiveFilters(filters) > 0

  const emptyTitle = loading
    ? 'Loading transactions…'
    : isError
      ? 'Could not load transactions'
      : transactions.length === 0
        ? 'No transactions yet'
        : 'No matching transactions'

  const emptySub = loading
    ? 'Please wait while we fetch your wallet activity'
    : isError
      ? 'Check your connection and try again'
      : hasActiveFilters
        ? 'Try adjusting your search or filters'
        : 'Wallet activity will appear here once you start transacting'

  return (
    <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Transactions</h1>
            <p className={styles.pageSub}>View and export all wallet activity</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarActions}>
            <div className={styles.statusFilters}>
              {([
                { key: 'all', label: 'All' },
                { key: 'successful', label: 'Successful' },
                { key: 'failed', label: 'Failed' },
              ] as const).map(f => (
                <Button
                  key={f.key}
                  variant="segment"
                  active={statusFilter === f.key}
                  onClick={() => { setStatusFilter(f.key); setPage(1) }}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}><SearchIcon /></span>
              <input
                className={styles.searchInput}
                placeholder="Search by reference, counterparty, or method"
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

              <FilterSection title="Method">
                {txMethods.map(method => (
                  <FilterCheckboxOption
                    key={method}
                    label={method}
                    checked={draftFilters.methods.includes(method)}
                    onChange={checked => toggleMethod(method, checked)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Type">
                {([
                  { value: 'all', label: 'All' },
                  { value: 'credit', label: 'Credit' },
                  { value: 'debit', label: 'Debit' },
                ] as const).map(option => (
                  <FilterRadioOption
                    key={option.value}
                    name="tx-type"
                    label={option.label}
                    checked={draftFilters.type === option.value}
                    onChange={() => setDraftFilters(prev => ({ ...prev, type: option.value }))}
                  />
                ))}
              </FilterSection>
            </FilterMenu>

            <Button
              variant="outline"
              size="sm"
              type="button"
              className={styles.exportBtn}
              disabled={filtered.length === 0}
              onClick={() => exportTransactions(filtered)}
            >
              <ExportIcon />
              Export
            </Button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          {pageItems.length === 0 ? (
            <EmptyState
              icon={<DocumentEmptyIcon />}
              title={emptyTitle}
              description={emptySub}
            />
          ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 28 }}></th>
                <th>From / To</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(tx => (
                <tr key={tx.id} className={styles.txRow} onClick={() => setSelectedTx(tx)}>
                  <td>
                    <span className={`${styles.dot} ${tx.dot === 'green' ? styles.dotGreen : styles.dotRed}`} />
                  </td>
                  <td className={styles.fromTo}>{tx.fromTo}</td>
                  <td className={styles.method}>{tx.method}</td>
                  <td className={`${styles.amount} ${tx.amountType === 'credit' ? styles.amountCredit : styles.amountDebit}`}>
                    {maskAmt(tx.amount)}
                  </td>
                  <td className={styles.date}>{tx.date}</td>
                  <td>
                    {tx.status === 'successful' ? (
                      <span className={styles.badgeSuccess}>
                        <span className={styles.badgeIcon}><CheckIcon /></span>
                        Successful
                      </span>
                    ) : tx.status === 'failed' ? (
                      <span className={styles.badgeFailed}>
                        <span className={styles.badgeIcon}><XIcon /></span>
                        Failed
                      </span>
                    ) : (
                      <span className={styles.badgeFailed} style={{ background: '#fffbeb', color: '#d97706' }}>
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerMeta}>
            Showing {pageItems.length} of {filtered.length} transactions
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

      <TransactionDrawer tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  )
}
