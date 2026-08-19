import { type Transaction as ApiTransaction } from './api'
import {
  type Transaction,
  type TransactionDetailField,
  type TransactionParty,
} from '../components/treasury/TransactionDrawer'

type MetaParty = {
  name?: string
  account_name?: string
  account_number?: string
  account_no?: string
  bank_name?: string
  bank_code?: string
}

function titleCase(value: string | undefined) {
  if (!value) return '—'
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function formatMoney(value: number | string | undefined | null, currency = 'NGN') {
  const n = Number(value ?? 0)
  if (currency.toUpperCase() === 'USD') {
    return `USD ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `NGN ${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Date + time in 12-hour format for business-facing views. */
export function formatTxDateTime(iso: unknown): string {
  if (!iso || typeof iso === 'object') return '—'
  const d = new Date(String(iso))
  if (isNaN(d.getTime())) return '—'
  const date = d.toLocaleDateString('en-NG', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const time = d.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${date}, ${time}`
}

export function formatTxDateShort(iso: unknown) {
  if (iso == null || typeof iso === 'object') return ''
  const d = new Date(String(iso))
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

function normalizeStatus(status: string | undefined): Transaction['status'] {
  const s = (status ?? '').toLowerCase()
  if (['success', 'successful', 'completed'].includes(s)) return 'successful'
  if (['failed', 'reversed', 'cancelled'].includes(s)) return 'failed'
  return 'pending'
}

function str(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return undefined
}

function firstStr(...values: unknown[]): string | undefined {
  for (const value of values) {
    const s = str(value)
    if (s) return s
  }
  return undefined
}

function readParty(raw: unknown): MetaParty | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  return raw as MetaParty
}

function partyName(p?: MetaParty): string | undefined {
  if (!p) return undefined
  return p.account_name || p.name
}

function partyAccount(p?: MetaParty): string | undefined {
  if (!p) return undefined
  return p.account_number || p.account_no
}

function metaData(t: ApiTransaction): Record<string, unknown> | undefined {
  const data = t.meta?.data
  if (!data || typeof data !== 'object') return undefined
  return data as Record<string, unknown>
}

function categoryKey(t: ApiTransaction): string {
  return String(t.transaction_category ?? '').toLowerCase()
}

function extractParty(t: ApiTransaction): TransactionParty | undefined {
  const data = metaData(t)
  if (!data) return undefined

  const sender = readParty(data.sender)
  const recipient = readParty(data.recipient)
  const beneficiary = readParty(data.beneficiary)
  const credit = String(t.transaction_type ?? '').toUpperCase() === 'CREDIT'

  if (credit) {
    const name =
      partyName(sender) ||
      partyName(beneficiary) ||
      str(data.customer_name)
    const accountNumber = partyAccount(sender) || partyAccount(beneficiary)
    const bankName = sender?.bank_name || beneficiary?.bank_name
    const bankCode = sender?.bank_code || beneficiary?.bank_code

    if (!name && !accountNumber && !bankName) return undefined

    return {
      label: 'Received from',
      name: name || '—',
      bankName,
      bankCode,
      accountNumber,
    }
  }

  const name =
    partyName(beneficiary) ||
    partyName(recipient)
  const accountNumber = partyAccount(beneficiary) || partyAccount(recipient)
  const bankName = beneficiary?.bank_name || recipient?.bank_name
  const bankCode = beneficiary?.bank_code || recipient?.bank_code

  if (!name && !accountNumber && !bankName) return undefined

  return {
    label: 'Sent to',
    name: name || '—',
    bankName,
    bankCode,
    accountNumber,
  }
}

/**
 * Pull every bill / debit identifier the backend stored in meta.data
 * (airtime, data, electricity, TV, betting, and anything similar).
 */
function extractDetailFields(t: ApiTransaction): TransactionDetailField[] {
  const data = metaData(t)
  if (!data) return []

  const fields: TransactionDetailField[] = []
  const seen = new Set<string>()

  const add = (label: string, value: unknown, copyable = false) => {
    const v = str(value)
    if (!v) return
    const key = `${label}:${v}`
    if (seen.has(key)) return
    seen.add(key)
    fields.push({ label, value: v, copyable })
  }

  // Prefer canonical keys; accept camelCase aliases from older / personal shapes.
  add('Phone number', firstStr(data.phone_number, data.phone, data.phoneNumber), true)
  add('Network', firstStr(data.network))
  add('Provider', firstStr(data.provider, data.biller_name, data.billerName))
  add('Meter number', firstStr(data.meter_number, data.meterNumber), true)
  add('Meter type', firstStr(data.meter_type, data.meterType))
  add(
    'Smartcard number',
    firstStr(data.smart_card_number, data.smartcard_number, data.smartCardNumber),
    true,
  )
  add('Package', firstStr(data.package_name, data.packageName))
  add('Package type', firstStr(data.package_type, data.packageType))
  add('Plan', firstStr(data.plan_type, data.planType, data.plan_name, data.planName))
  add('Data size', firstStr(data.data_size, data.dataSize))
  add('Validity', firstStr(data.validity, data.validity_period, data.validityPeriod))
  add('Customer name', firstStr(data.customer_name, data.customerName))
  add('Address', firstStr(data.address, data.customer_info))
  add('Token', firstStr(data.token), true)
  add('Units', firstStr(data.number_of_units, data.units))
  add('Betting user ID', firstStr(data.user_id, data.userId), true)
  add('Debit account', firstStr(data.debit_account, data.debitAccount), true)

  // Show package/bundle ids only when a human label was not available.
  if (!fields.some(f => f.label === 'Package')) {
    add('Package ID', firstStr(data.package_id, data.packageId, data.bundle_id, data.bundleId), true)
  }

  return fields
}

function extractCounterparty(t: ApiTransaction, party?: TransactionParty, fields?: TransactionDetailField[]): string {
  if (isVasCashback(t)) {
    return t.description || 'Cashback'
  }

  if (party?.name && party.name !== '—') return party.name

  const data = metaData(t)
  const cat = categoryKey(t)

  if (cat.includes('airtime') || cat === 'data') {
    return firstStr(data?.phone_number, data?.phone) || '—'
  }
  if (cat.includes('electricity')) {
    return firstStr(data?.customer_name, data?.meter_number) || '—'
  }
  if (cat.includes('cable') || cat.includes('tv')) {
    return firstStr(data?.smart_card_number, data?.package_name) || '—'
  }
  if (cat.includes('betting')) {
    return firstStr(data?.user_id, data?.phone_number) || '—'
  }

  if (fields?.length) {
    const phone = fields.find(f => f.label === 'Phone number')
    if (phone) return phone.value
    const meter = fields.find(f => f.label === 'Meter number')
    if (meter) return meter.value
    const smart = fields.find(f => f.label === 'Smartcard number')
    if (smart) return smart.value
  }

  if (str(data?.customer_name)) return String(data!.customer_name)
  return '—'
}

function isVasCashback(t: ApiTransaction): boolean {
  const data = metaData(t)
  return str(data?.kind) === 'vas_cashback'
}

/** Direct credit into the business float account (bank transfer to account number). */
function isFloatWalletFunding(t: ApiTransaction): boolean {
  if (String(t.transaction_type ?? '').toUpperCase() !== 'CREDIT') return false
  if (isVasCashback(t)) return false
  const cat = categoryKey(t)
  if (!cat.includes('wallet funding') && !cat.includes('funding')) return false
  // Customer collection VAs carry customer identity — treat those separately.
  const data = metaData(t)
  const va = data?.virtual_account
  if (va && typeof va === 'object') {
    const customer = firstStr(
      (va as Record<string, unknown>).customer_name,
      (va as Record<string, unknown>).customer_email,
    )
    if (customer) return false
  }
  return true
}

function extractMethod(t: ApiTransaction): string {
  if (isVasCashback(t)) return 'Cashback'
  if (isFloatWalletFunding(t)) return 'Bank transfer'

  const source = t.meta?.data?.source
  if (typeof source === 'string' && source) return titleCase(source)
  if (typeof t.channel === 'string' && t.channel) return titleCase(t.channel)
  return titleCase(t.transaction_category as string)
}

function extractCustomerName(t: ApiTransaction): string | undefined {
  const data = metaData(t)
  return firstStr(data?.customer_name, data?.customerName)
}

function resolveTitle(t: ApiTransaction, credit: boolean): string {
  const cat = categoryKey(t)

  if (cat.includes('airtime') && !cat.includes('cash')) return 'Airtime purchase'
  if (cat === 'data') return 'Data Purchase'
  if (cat.includes('electricity')) return 'Electricity Payment'
  if (cat.includes('cable') || cat.includes('tv')) return 'TV Subscription'
  if (cat.includes('betting')) return 'Betting'
  if (isVasCashback(t)) return 'Cashback'
  if (isFloatWalletFunding(t)) return 'Float wallet funding'

  return credit ? 'Money Received' : 'Money Sent'
}

function resolveFromTo(
  t: ApiTransaction,
  credit: boolean,
  party: TransactionParty | undefined,
  counterparty: string,
  fields: TransactionDetailField[],
): string {
  if (isVasCashback(t)) {
    return t.description || 'VAS cashback'
  }

  if (party?.name && party.name !== '—') return party.name
  if (counterparty !== '—') return counterparty

  const network = fields.find(f => f.label === 'Network' || f.label === 'Provider')
  const phone = fields.find(f => f.label === 'Phone number')
  if (phone && network) return `${network.value} · ${phone.value}`
  if (phone) return phone.value

  if (isFloatWalletFunding(t)) {
    const data = metaData(t)
    const sender = readParty(data?.sender)
    return partyName(sender) || 'Business account credit'
  }

  if (t.description) return t.description
  return credit ? 'Incoming transfer' : 'Outgoing transfer'
}

function timelineLabel(status: Transaction['status'], category: string): string {
  const isBill = /airtime|data|electricity|cable|tv|betting|bill/.test(category)
  if (status === 'successful') return isBill ? 'Payment successful' : 'Transfer successful'
  if (status === 'failed') return isBill ? 'Payment failed' : 'Transfer failed'
  return 'Processing'
}

function buildTimeline(t: ApiTransaction, status: Transaction['status']): Transaction['timeline'] {
  const initiatedAt = formatTxDateTime(t.created_at)
  const completedAt = formatTxDateTime(t.updated_at)
  const showCompleted = t.updated_at && t.updated_at !== t.created_at
  const cat = categoryKey(t)

  return [
    { label: 'Transaction initiated', date: initiatedAt, type: 'neutral' },
    {
      label: timelineLabel(status, cat),
      date: showCompleted ? completedAt : initiatedAt,
      type: status === 'successful' ? 'success' : status === 'failed' ? 'fail' : 'neutral',
    },
  ]
}

export function mapApiTransaction(t: ApiTransaction): Transaction {
  const status = normalizeStatus(str(t.transaction_status) ?? String(t.transaction_status ?? ''))
  const credit = String(t.transaction_type ?? '').toUpperCase() === 'CREDIT'
  const currency = (str(t.currency) ?? 'NGN').toUpperCase()
  const amountRaw = formatMoney(Math.abs(Number(t.amount)), currency)
  const processedAt = formatTxDateTime(t.created_at)
  const date = formatTxDateShort(t.created_at)
  const party = extractParty(t)
  const detailFields = extractDetailFields(t)
  const counterparty = extractCounterparty(t, party, detailFields)
  const fromTo = resolveFromTo(t, credit, party, counterparty, detailFields)
  const title = resolveTitle(t, credit)
  const customerName = extractCustomerName(t)

  // Avoid duplicating fields already shown via party / top-level helpers.
  const paymentFields = detailFields.filter(field => {
    if (field.label === 'Customer name' && customerName) return false
    if (field.label === 'Debit account' && party?.accountNumber === field.value) return false
    return true
  })

  return {
    id: t.transaction_id,
    title,
    dot: status === 'successful' ? 'green' : 'red',
    fromTo,
    method: extractMethod(t),
    amount: `${credit ? '+' : '-'} ${amountRaw}`,
    amountRaw,
    amountType: credit ? 'credit' : 'debit',
    currency: currency === 'USD' ? 'USD' : 'NGN',
    date,
    processedAt,
    status,
    reference: t.transaction_reference || t.transaction_id,
    counterparty,
    fee: formatMoney(t.charge, currency),
    summary: t.description || t.transaction_reference || t.transaction_id,
    wallet: `${currency} Wallet`,
    category: titleCase(t.transaction_category as string),
    channel: typeof t.channel === 'string' ? titleCase(t.channel) : undefined,
    transactionType: credit ? 'credit' : 'debit',
    party,
    detailFields: paymentFields,
    customerName,
    timeline: buildTimeline(t, status),
    prevBalance: formatMoney(t.balance_before, currency),
    currBalance: formatMoney(t.balance_after, currency),
  }
}
