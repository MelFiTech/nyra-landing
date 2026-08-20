import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../ui/Button'
import SideSheetStack, { type SheetLayer } from '../treasury/SideSheetStack'
import { useBusiness } from '../../context/BusinessContext'
import { useToast } from '../../context/ToastContext'
import { useCustomers } from '../../hooks/useAppData'
import { ApiError, cardsApi, type CardReadiness } from '../../lib/api'
import styles from './CreateCardSheet.module.css'

type Step = 'form' | 'success'
type CardNetwork = 'VISA' | 'MASTERCARD'
type MissingField = CardReadiness['missing'][number]

type PlatformCustomerOption = {
  walletId: string
  customerId?: string
  name: string
  accountNumber: string
}

type Props = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const MISSING_LABELS: Record<MissingField, string> = {
  state: 'State',
  id_number: 'BVN / NIN',
}

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const SuccessIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

function networkLogoSrc(network: CardNetwork) {
  return network === 'MASTERCARD' ? '/card-networks/mastercard.svg' : '/card-networks/visa.svg'
}

function usd(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function CreateCardSheet({ open, onClose, onCreated }: Props) {
  const { businessId } = useBusiness()
  const { showToast } = useToast()
  const { data: platformCustomers = [], isLoading: platformLoading } = useCustomers()
  const customerFieldRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('form')
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [readiness, setReadiness] = useState<CardReadiness | null>(null)
  const [readinessLoading, setReadinessLoading] = useState(false)
  const [extras, setExtras] = useState<{ state: string; id_number: string; id_type: 'bvn' | 'nin' }>({
    state: '',
    id_number: '',
    id_type: 'bvn',
  })
  const [cardNetwork, setCardNetwork] = useState<CardNetwork | null>(null)
  const [amount, setAmount] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdName, setCreatedName] = useState('')

  const customerOptions = useMemo<PlatformCustomerOption[]>(() =>
    platformCustomers
      .filter(customer => !customer.isFloat)
      .map(customer => ({
        walletId: customer.wallet_id,
        customerId: customer.external_reference?.trim() || undefined,
        name: customer.owners_fullname?.trim() || customer.wallet_id,
        accountNumber: customer.account_number,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  [platformCustomers])

  const selectedCustomer = useMemo(
    () => customerOptions.find(c => c.walletId === selectedWalletId) ?? null,
    [customerOptions, selectedWalletId],
  )

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase()
    if (!q) return customerOptions
    const compactQ = q.replace(/[\s-_]/g, '')
    return customerOptions.filter(c => {
      const tokens = [c.name, c.accountNumber, c.walletId, c.customerId]
        .map(v => String(v ?? '').toLowerCase())
        .filter(Boolean)
      if (tokens.some(token => token.includes(q))) return true
      if (compactQ.length < 4) return false
      return tokens.some(token => token.replace(/[\s-_]/g, '').includes(compactQ))
    })
  }, [customerOptions, customerSearch])

  const missingFields = readiness?.missing ?? []
  const extrasComplete = missingFields.every(field => {
    if (field === 'id_number') return /^\d{11}$/.test(extras.id_number)
    if (field === 'state') return extras.state.trim().length > 0
    return true
  })

  const parsedAmount = amount === '' ? 0 : Number(amount)
  const amountValid = amount === '' || (!Number.isNaN(parsedAmount) && parsedAmount >= 0)
  const canSubmit =
    Boolean(
      selectedWalletId &&
      cardNetwork &&
      amountValid &&
      !creating &&
      businessId &&
      readiness &&
      (readiness.ready || extrasComplete),
    )

  useEffect(() => {
    if (open) {
      setStep('form')
      setCustomerMenuOpen(false)
      setCustomerSearch('')
      setSelectedWalletId(null)
      setReadiness(null)
      setReadinessLoading(false)
      setExtras({ state: '', id_number: '', id_type: 'bvn' })
      setCardNetwork(null)
      setAmount('')
      setCreating(false)
      setCreatedName('')
    }
  }, [open])

  useEffect(() => {
    if (!customerMenuOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (!customerFieldRef.current?.contains(e.target as Node)) {
        setCustomerMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [customerMenuOpen])

  useEffect(() => {
    if (!open || !businessId || !selectedWalletId) {
      setReadiness(null)
      return
    }

    let cancelled = false
    setReadinessLoading(true)

    void cardsApi
      .getPlatformCustomerCardReadiness(businessId, selectedWalletId)
      .then(next => {
        if (!cancelled) setReadiness(next)
      })
      .catch(error => {
        if (!cancelled) {
          showToast(error instanceof ApiError ? error.message : 'Could not check customer readiness', 'error')
          setSelectedWalletId(null)
        }
      })
      .finally(() => {
        if (!cancelled) setReadinessLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, businessId, selectedWalletId, showToast])

  function handleClose() {
    onClose()
  }

  function selectCustomer(customer: PlatformCustomerOption) {
    setSelectedWalletId(customer.walletId)
    setCustomerSearch('')
    setCustomerMenuOpen(false)
    setExtras({ state: '', id_number: '', id_type: 'bvn' })
  }

  async function handleCreate() {
    if (!selectedCustomer || !cardNetwork || !amountValid || !businessId || !readiness) return
    setCreating(true)
    try {
      await cardsApi.issueCardForPlatformCustomer(businessId, selectedCustomer.walletId, {
        currency: 'USD',
        amount: parsedAmount,
        type: cardNetwork,
        description: `Virtual card for ${selectedCustomer.name}`,
        ...(readiness.ready
          ? {}
          : {
              state: extras.state.trim() || undefined,
              id_type: extras.id_type,
              id_number: extras.id_number || undefined,
            }),
      })
      setCreatedName(selectedCustomer.name)
      onCreated()
      setStep('success')
    } catch (error) {
      if (error instanceof ApiError && error.missing?.length) {
        setReadiness(prev => ({
          ready: false,
          has_card_customer: prev?.has_card_customer ?? false,
          missing: error.missing as MissingField[],
        }))
      }
      showToast(error instanceof ApiError ? error.message : 'Could not create card', 'error')
    } finally {
      setCreating(false)
    }
  }

  const formContent = (
    <div className={styles.form}>
      <p className={styles.fieldHint}>
        Pick a customer you already created on Nyra. We reuse their KYC automatically — you only choose
        the card details.
      </p>

      <div className={styles.field} ref={customerFieldRef}>
        <label className={styles.label} htmlFor="create-card-customer">
          Customer
        </label>
        <button
          id="create-card-customer"
          type="button"
          className={styles.selectTrigger}
          onClick={() => setCustomerMenuOpen(v => !v)}
          aria-haspopup="listbox"
          aria-expanded={customerMenuOpen}
        >
          {selectedCustomer ? (
            <span className={styles.selectValue}>
              <span className={styles.selectValueName}>{selectedCustomer.name}</span>
              <span className={styles.selectValueSub}>{selectedCustomer.accountNumber}</span>
            </span>
          ) : (
            <span className={styles.selectPlaceholder}>Select customer</span>
          )}
          <span className={styles.selectChevron} aria-hidden>
            <ChevronDownIcon />
          </span>
        </button>

        {customerMenuOpen && (
          <div className={styles.selectMenu} role="listbox" aria-label="Customers">
            <input
              className={styles.menuSearch}
              placeholder="Search by name, wallet ID, or customer ID..."
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
              autoFocus
              onClick={e => e.stopPropagation()}
            />
            <div className={styles.menuList}>
              {platformLoading ? (
                <p className={styles.menuEmpty}>Loading customers…</p>
              ) : filteredCustomers.length === 0 ? (
                <p className={styles.menuEmpty}>
                  {customerOptions.length === 0
                    ? 'No customers yet. Create one from the Customers page first.'
                    : 'No matching customers found.'}
                </p>
              ) : (
                filteredCustomers.map(customer => (
                  <button
                    key={customer.walletId}
                    type="button"
                    role="option"
                    aria-selected={selectedWalletId === customer.walletId}
                    className={`${styles.menuItem} ${selectedWalletId === customer.walletId ? styles.menuItemSelected : ''}`}
                    onClick={() => selectCustomer(customer)}
                  >
                    <div className={styles.menuItemText}>
                      <span className={styles.menuItemName}>{customer.name}</span>
                      <span className={styles.menuItemSub}>{customer.accountNumber}</span>
                    </div>
                    {selectedWalletId === customer.walletId && (
                      <span className={styles.menuCheck} aria-hidden><CheckIcon /></span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {readinessLoading && selectedWalletId && (
        <p className={styles.fieldHint}>Checking customer details…</p>
      )}

      {readiness && !readinessLoading && readiness.ready && (
        <p className={styles.readyNote}>
          Customer details are ready. Choose a card type and optional starting balance below.
        </p>
      )}

      {readiness && !readinessLoading && !readiness.ready && missingFields.length > 0 && (
        <div className={styles.supplementalBlock}>
          <span className={styles.prefilledTitle}>One-time details</span>
          <p className={styles.fieldHint}>
            We already have this customer&apos;s identity from onboarding. Confirm the items below once
            for older records.
          </p>
          {missingFields.includes('state') && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="card-extra-state">{MISSING_LABELS.state}</label>
              <div className={styles.amountInputWrap}>
                <input
                  id="card-extra-state"
                  className={styles.amountInput}
                  placeholder="Lagos"
                  value={extras.state}
                  onChange={e => setExtras(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
          )}
          {missingFields.includes('id_number') && (
            <>
              <div className={styles.field}>
                <span className={styles.label}>ID type</span>
                <div className={styles.typeList}>
                  {(['bvn', 'nin'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`${styles.typeOption} ${extras.id_type === type ? styles.typeOptionSelected : ''}`}
                      onClick={() => setExtras(prev => ({ ...prev, id_type: type }))}
                    >
                      <div className={styles.typeLabel}>{type.toUpperCase()}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="card-extra-id">{MISSING_LABELS.id_number}</label>
                <div className={styles.amountInputWrap}>
                  <input
                    id="card-extra-id"
                    className={styles.amountInput}
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="11-digit number"
                    value={extras.id_number}
                    onChange={e => setExtras(prev => ({ ...prev, id_number: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className={styles.field}>
        <span className={styles.label}>Card type</span>
        <div className={styles.typeList}>
          {(['VISA', 'MASTERCARD'] as const).map(network => (
            <button
              key={network}
              type="button"
              className={`${styles.typeOption} ${cardNetwork === network ? styles.typeOptionSelected : ''}`}
              onClick={() => setCardNetwork(network)}
            >
              <div className={styles.typeOptionTop}>
                <img src={networkLogoSrc(network)} alt={network} className={styles.typeLogo} />
                <span className={styles.checkMark} aria-hidden><CheckIcon /></span>
              </div>
              <div>
                <div className={styles.typeLabel}>{network === 'VISA' ? 'Visa' : 'Mastercard'}</div>
                <div className={styles.typeSub}>USD virtual card</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="create-card-amount">
          Amount <span className={styles.optional}>(optional)</span>
        </label>
        <div className={styles.amountInputWrap}>
          <span className={styles.amountPrefix}>$</span>
          <input
            id="create-card-amount"
            className={styles.amountInput}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        <p className={styles.fieldHint}>Funded from your USD virtual card balance. Leave blank for $0.00.</p>
      </div>

      <Button
        variant="primary"
        fullWidth
        loading={creating}
        disabled={!canSubmit}
        onClick={handleCreate}
      >
        Create card
      </Button>
    </div>
  )

  const successContent = (
    <div className={styles.success}>
      <div className={styles.successIcon} aria-hidden>
        <SuccessIcon />
      </div>
      <div className={styles.successTitle}>Card created</div>
      <p className={styles.successSub}>
        A {cardNetwork === 'MASTERCARD' ? 'Mastercard' : 'Visa'} virtual card
        {parsedAmount > 0 ? ` with ${usd(parsedAmount)}` : ''} has been issued to {createdName}.
      </p>
      <Button variant="primary" fullWidth onClick={handleClose}>
        Done
      </Button>
    </div>
  )

  const layers: SheetLayer[] = [
    {
      key: 'create-card',
      title: step === 'success' ? 'Card created' : 'Create card',
      children: (
        <div key={step} className={styles.morphContent}>
          {step === 'success' ? successContent : formContent}
        </div>
      ),
    },
  ]

  return <SideSheetStack open={open} onClose={handleClose} layers={layers} />
}
