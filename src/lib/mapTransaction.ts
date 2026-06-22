import { type Transaction as ApiTransaction } from './api'
import { type Transaction } from '../components/treasury/TransactionDrawer'

function titleCase(value: string | undefined) {
  if (!value) return '—'
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function formatNgn(value: number | string | undefined | null) {
  return `NGN ${Number(value ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatTxDate(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })
}

function normalizeStatus(status: string | undefined): Transaction['status'] {
  const s = (status ?? '').toLowerCase()
  if (['success', 'successful', 'completed'].includes(s)) return 'successful'
  if (['failed', 'reversed', 'cancelled'].includes(s)) return 'failed'
  return 'pending'
}

function extractCounterparty(t: ApiTransaction): string {
  const data = t.meta?.data
  if (!data || typeof data !== 'object') return '—'
  const sender = data.sender as { name?: string } | undefined
  const recipient = data.recipient as { name?: string } | undefined
  const beneficiary = data.beneficiary as { account_name?: string } | undefined
  return (
    sender?.name ||
    recipient?.name ||
    beneficiary?.account_name ||
    (typeof data.customer_name === 'string' ? data.customer_name : '') ||
    '—'
  )
}

function extractMethod(t: ApiTransaction): string {
  const source = t.meta?.data?.source
  if (typeof source === 'string' && source) return titleCase(source)
  return titleCase((t.transaction_category as string) ?? (t.channel as string))
}

export function mapApiTransaction(t: ApiTransaction): Transaction {
  const status = normalizeStatus(t.transaction_status)
  const credit = t.transaction_type === 'CREDIT'
  const amountRaw = formatNgn(t.amount)
  const date = formatTxDate(t.created_at)
  const counterparty = extractCounterparty(t)
  const fromTo = t.description || (counterparty !== '—' ? counterparty : credit ? 'Incoming transfer' : 'Outgoing transfer')
  return {
    id: t.transaction_id,
    dot: status === 'successful' ? 'green' : 'red',
    fromTo,
    method: extractMethod(t),
    amount: `${credit ? '+' : '-'} ${amountRaw}`,
    amountRaw,
    amountType: credit ? 'credit' : 'debit',
    date,
    status,
    reference: t.transaction_reference || t.transaction_id,
    counterparty,
    fee: formatNgn(t.charge),
    summary: t.description || t.transaction_reference || t.transaction_id,
    wallet: `${t.currency ?? 'NGN'} Wallet`,
    timeline: [
      { label: 'Transaction Initiated.', date, type: 'neutral' },
      {
        label: status === 'successful' ? 'Transfer Successful' : status === 'failed' ? 'Transfer Failed' : 'Processing',
        date,
        type: status === 'successful' ? 'success' : status === 'failed' ? 'fail' : 'neutral',
      },
    ],
    prevBalance: formatNgn(t.balance_before),
    currBalance: formatNgn(t.balance_after),
  }
}
