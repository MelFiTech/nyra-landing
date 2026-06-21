import { useState, useEffect } from 'react'
import { bankApi, transferApi, ApiError, type Bank, type AccountEnquiry } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import Button from '../ui/Button'
import PinEntry from './PinEntry'
import SideSheetStack, { type SheetLayer } from './SideSheetStack'
import styles from './TransferModal.module.css'

type Props = {
  open: boolean
  onClose: () => void
  /** The business float account the transfer is debited from. */
  sourceAccountNumber: string
}

type DetailView = 'form' | 'review' | 'pin'

const MIN_AMOUNT = 100

let banksCache: Bank[] | null = null

export default function TransferModal({ open, onClose, sourceAccountNumber }: Props) {
  const { showToast } = useToast()
  const [detailView, setDetailView] = useState<DetailView>('form')
  const [banks, setBanks] = useState<Bank[]>(() => banksCache ?? [])
  const [bankSearch, setBankSearch] = useState('')
  const [showBankList, setShowBankList] = useState(false)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [enquiry, setEnquiry] = useState<AccountEnquiry | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setDetailView('form')
      setSelectedBank(null)
      setAccountNumber('')
      setEnquiry(null)
      setVerifyError('')
      setAmount('')
      setDescription('')
      setBankSearch('')
      setShowBankList(false)
      setPinLoading(false)
      if (!banksCache) {
        bankApi
          .listBanks()
          .then(b => { banksCache = b; setBanks(b) })
          .catch(() => setVerifyError('Could not load bank list. Check your connection.'))
      }
    }
  }, [open])

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      setVerifying(true)
      setEnquiry(null)
      setVerifyError('')
      bankApi
        .enquireAccount(selectedBank.bank_code, accountNumber)
        .then(result => { setEnquiry(result); setVerifying(false) })
        .catch(err => {
          setVerifying(false)
          setVerifyError(err instanceof ApiError ? err.message : 'Could not verify this account.')
        })
    } else {
      setEnquiry(null)
    }
  }, [accountNumber, selectedBank])

  const filteredBanks = banks.filter(b => b.bank_name.toLowerCase().includes(bankSearch.toLowerCase()))

  async function handleConfirm(pin: string) {
    if (!selectedBank || !enquiry) return
    setPinLoading(true)
    try {
      await transferApi.send({
        beneficiary: {
          bank_code: selectedBank.bank_code,
          account_number: accountNumber,
          account_name: enquiry.account_name,
          bank_name: selectedBank.bank_name,
          enquiry_session_id: enquiry.enquiry_session_id,
        },
        source_account_number: sourceAccountNumber,
        amount: Number(amount),
        description: description || undefined,
        wallet_pin: pin,
      })
      setPinLoading(false)
      onClose()
      showToast(`₦${Number(amount).toLocaleString()} sent to ${enquiry.account_name}`)
    } catch (err) {
      setPinLoading(false)
      setDetailView('review')
      showToast(err instanceof ApiError ? err.message : 'Transfer failed. Please try again.', 'error')
    }
  }

  function canContinue() {
    return selectedBank && accountNumber.length === 10 && enquiry && amount && Number(amount) >= MIN_AMOUNT
  }

  function handleDetailBack() {
    if (detailView === 'pin') setDetailView('review')
    else if (detailView === 'review') setDetailView('form')
    else onClose()
  }

  const detailTitles: Record<DetailView, string> = {
    form: 'Send to Bank Account',
    review: 'Review Transfer',
    pin: 'Confirm Transfer',
  }

  const form = (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Bank</label>
        <div className={styles.bankSelect} onClick={() => setShowBankList(v => !v)}>
          <span className={selectedBank ? styles.bankSelected : styles.bankPlaceholder}>
            {selectedBank ? selectedBank.bank_name : 'Select bank'}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        {showBankList && (
          <div className={styles.bankDropdown}>
            <input
              className={styles.bankSearch}
              placeholder="Search bank..."
              value={bankSearch}
              onChange={e => setBankSearch(e.target.value)}
              autoFocus
              onClick={e => e.stopPropagation()}
            />
            <div className={styles.bankList}>
              {filteredBanks.map(b => (
                <button key={b.bank_code} className={styles.bankOption} onClick={() => { setSelectedBank(b); setBankSearch(''); setShowBankList(false) }}>
                  {b.bank_name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Account Number</label>
        <input
          className={styles.input}
          placeholder="10-digit account number"
          maxLength={10}
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
        />
        {verifying && <span className={styles.verifying}>Verifying account...</span>}
        {enquiry && !verifying && <span className={styles.verifiedName}>{enquiry.account_name}</span>}
        {verifyError && !verifying && <span className={styles.verifying}>{verifyError}</span>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Amount (₦)</label>
        <input className={styles.input} type="number" placeholder="0.00" min={MIN_AMOUNT} value={amount} onChange={e => setAmount(e.target.value)} />
        {amount && Number(amount) < MIN_AMOUNT && (
          <span className={styles.verifying}>Minimum transfer is ₦{MIN_AMOUNT}</span>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Description (optional)</label>
        <input className={styles.input} placeholder="What's this for?" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <Button variant="inverted" fullWidth disabled={!canContinue()} onClick={() => setDetailView('review')}>Continue</Button>
    </div>
  )

  const reviewContent = (
    <div className={styles.review}>
      <div className={styles.reviewAmount}>₦{Number(amount).toLocaleString()}</div>
      <div className={styles.reviewRows}>
        <div className={styles.reviewRow}><span>To</span><span>{enquiry?.account_name}</span></div>
        <div className={styles.reviewRow}><span>Bank</span><span>{selectedBank?.bank_name}</span></div>
        <div className={styles.reviewRow}><span>Account</span><span>{accountNumber}</span></div>
        {description && <div className={styles.reviewRow}><span>Note</span><span>{description}</span></div>}
        <div className={styles.reviewRow}><span>From</span><span>{sourceAccountNumber}</span></div>
      </div>
      <Button variant="inverted" fullWidth onClick={() => setDetailView('pin')}>Confirm & Send</Button>
    </div>
  )

  const pinContent = (
    <PinEntry
      key={detailView}
      onConfirm={handleConfirm}
      loading={pinLoading}
      length={4}
      subtitle={`Confirm transfer of ₦${Number(amount).toLocaleString()}`}
    />
  )

  function getDetailContent() {
    if (detailView === 'review') return reviewContent
    if (detailView === 'pin') return pinContent
    return form
  }

  const layers: SheetLayer[] = [
    {
      key: 'transfer',
      title: detailTitles[detailView],
      showBack: detailView !== 'form',
      onBack: handleDetailBack,
      children: (
        <div key={detailView} className={styles.morphContent}>
          {getDetailContent()}
        </div>
      ),
    },
  ]

  return <SideSheetStack open={open} onClose={onClose} layers={layers} />
}
