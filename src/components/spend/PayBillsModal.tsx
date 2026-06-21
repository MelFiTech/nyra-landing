import { useState } from 'react'
import { payBill } from '../../services/mockApi'
import Button from '../ui/Button'
import PinModal from '../treasury/PinModal'
import styles from './PayBillsModal.module.css'

type Props = { open: boolean; onClose: () => void; onOpenAirtime?: () => void }
type Category = 'electricity' | 'cable' | 'betting'
type Step = 'category' | 'provider' | 'details' | 'review' | 'success'

const ELECTRICITY = [
  { id: 'ikeja', name: 'Ikeja Electric', code: 'IKEDC' },
  { id: 'eko', name: 'Eko Electric', code: 'EKEDC' },
  { id: 'abuja', name: 'Abuja Disco', code: 'AEDC' },
  { id: 'ibadan', name: 'Ibadan Disco', code: 'IBEDC' },
  { id: 'portharcourt', name: 'Port Harcourt Disco', code: 'PHEDC' },
]
const CABLE = [
  { id: 'dstv', name: 'DStv', packages: ['Compact ₦15,800/mo', 'Compact+ ₦24,500/mo', 'Premium ₦29,500/mo', 'Confam ₦10,000/mo'] },
  { id: 'gotv', name: 'GOtv', packages: ['Jolli ₦4,850/mo', 'Max ₦7,200/mo', 'Smallie ₦1,850/mo', 'Lite ₦900/mo'] },
  { id: 'startimes', name: 'StarTimes', packages: ['Nova ₦1,200/mo', 'Basic ₦2,000/mo', 'Smart ₦4,200/mo', 'Classic ₦5,000/mo'] },
]
const BETTING = [
  { id: 'bet9ja', name: 'Bet9ja' },
  { id: 'sportybet', name: 'SportyBet' },
  { id: '1xbet', name: '1xBet' },
  { id: 'betking', name: 'BetKing' },
  { id: 'nairabet', name: 'NairaBet' },
]

export default function PayBillsModal({ open, onClose, onOpenAirtime }: Props) {
  const [category, setCategory] = useState<Category | null>(null)
  const [step, setStep] = useState<Step>('category')
  const [provider, setProvider] = useState<{ id: string; name: string } | null>(null)
  const [meterNumber, setMeterNumber] = useState('')
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid')
  const [smartCard, setSmartCard] = useState('')
  const [selectedPackage, setSelectedPackage] = useState('')
  const [bettingId, setBettingId] = useState('')
  const [amount, setAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const [reference, setReference] = useState('')

  function reset() {
    setCategory(null); setStep('category'); setProvider(null)
    setMeterNumber(''); setSmartCard(''); setSelectedPackage('')
    setBettingId(''); setAmount(''); setCustomerName(''); setReference('')
  }

  function goBack() {
    if (step === 'provider') setStep('category')
    else if (step === 'details') setStep('provider')
    else if (step === 'review') setStep('details')
  }

  function verifyMeter() {
    setVerifying(true)
    setTimeout(() => { setCustomerName('ADEBAYO JAMES OLUWASEUN'); setVerifying(false) }, 1000)
  }

  async function handlePin(pin: string) {
    setPinLoading(true)
    const result = await payBill({ category, provider: provider?.id, amount, pin })
    setPinLoading(false)
    setPinOpen(false)
    setReference(result.reference)
    setStep('success')
  }

  if (!open) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.header}>
            {step !== 'category' && step !== 'success' && (
              <Button variant="icon" onClick={goBack}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </Button>
            )}
            <span className={styles.title}>
              {step === 'category' ? 'Pay Bills' : step === 'success' ? 'Payment Successful' : provider?.name || category}
            </span>
            <Button variant="icon" onClick={() => { reset(); onClose() }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </Button>
          </div>

          <div className={styles.body}>
            {step === 'category' && (
              <div className={styles.catGrid}>
                <button className={styles.catCard} onClick={() => { setCategory('electricity'); setStep('provider') }}>
                  <span className={styles.catIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </span>
                  <span className={styles.catLabel}>Electricity</span>
                </button>
                <button className={styles.catCard} onClick={() => { setCategory('cable'); setStep('provider') }}>
                  <span className={styles.catIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M17 2l-5 5-5-5"/>
                    </svg>
                  </span>
                  <span className={styles.catLabel}>Cable TV</span>
                </button>
                <button className={styles.catCard} onClick={() => { setCategory('betting'); setStep('provider') }}>
                  <span className={styles.catIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                      <line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/>
                      <line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/>
                    </svg>
                  </span>
                  <span className={styles.catLabel}>Betting</span>
                </button>
                <button className={styles.catCard} onClick={() => { onClose(); onOpenAirtime?.() }}>
                  <span className={styles.catIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                  </span>
                  <span className={styles.catLabel}>Airtime & Data</span>
                </button>
              </div>
            )}

            {step === 'provider' && category === 'electricity' && (
              <div className={styles.providerList}>
                {ELECTRICITY.map(p => (
                  <button key={p.id} className={styles.providerItem} onClick={() => { setProvider(p); setStep('details') }}>
                    <div className={styles.providerBadge}>{p.code[0]}</div>
                    <span className={styles.providerName}>{p.name}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {step === 'provider' && category === 'cable' && (
              <div className={styles.providerList}>
                {CABLE.map(p => (
                  <button key={p.id} className={styles.providerItem} onClick={() => { setProvider(p); setStep('details') }}>
                    <div className={styles.providerBadge}>{p.name[0]}</div>
                    <span className={styles.providerName}>{p.name}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {step === 'provider' && category === 'betting' && (
              <div className={styles.providerList}>
                {BETTING.map(p => (
                  <button key={p.id} className={styles.providerItem} onClick={() => { setProvider(p); setStep('details') }}>
                    <div className={styles.providerBadge}>{p.name[0]}</div>
                    <span className={styles.providerName}>{p.name}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {step === 'details' && category === 'electricity' && (
              <div className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Meter Number</label>
                  <div className={styles.inputRow}>
                    <input className={styles.input} placeholder="Enter meter number" value={meterNumber} onChange={e => setMeterNumber(e.target.value)} />
                    <Button variant="text" onClick={verifyMeter} disabled={!meterNumber} loading={verifying}>Verify</Button>
                  </div>
                  {customerName && <span className={styles.verifiedName}>{customerName}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Meter Type</label>
                  <div className={styles.toggleRow}>
                    <button className={`${styles.toggleOpt} ${meterType === 'prepaid' ? styles.toggleOptActive : ''}`} onClick={() => setMeterType('prepaid')}>Prepaid</button>
                    <button className={`${styles.toggleOpt} ${meterType === 'postpaid' ? styles.toggleOptActive : ''}`} onClick={() => setMeterType('postpaid')}>Postpaid</button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Amount (₦)</label>
                  <input className={styles.input} type="number" placeholder="Min ₦1,000" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <Button variant="inverted" fullWidth disabled={!customerName || !amount} onClick={() => setStep('review')}>Continue</Button>
              </div>
            )}

            {step === 'details' && category === 'cable' && (
              <div className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Smart Card / IUC Number</label>
                  <input className={styles.input} placeholder="Enter card number" value={smartCard} onChange={e => setSmartCard(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Select Package</label>
                  <div className={styles.packageList}>
                    {(CABLE.find(c => c.id === provider?.id)?.packages || []).map(pkg => (
                      <button key={pkg} className={`${styles.packageItem} ${selectedPackage === pkg ? styles.packageActive : ''}`} onClick={() => setSelectedPackage(pkg)}>
                        {pkg}
                      </button>
                    ))}
                  </div>
                </div>
                <Button variant="inverted" fullWidth disabled={!smartCard || !selectedPackage} onClick={() => setStep('review')}>Continue</Button>
              </div>
            )}

            {step === 'details' && category === 'betting' && (
              <div className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>{provider?.name} User ID</label>
                  <input className={styles.input} placeholder="Enter your user ID" value={bettingId} onChange={e => setBettingId(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Amount (₦)</label>
                  <input className={styles.input} type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <Button variant="inverted" fullWidth disabled={!bettingId || !amount} onClick={() => setStep('review')}>Continue</Button>
              </div>
            )}

            {step === 'review' && (
              <div className={styles.review}>
                <div className={styles.reviewAmount}>
                  {category === 'cable' ? selectedPackage.split('₦')[1]?.split('/')[0]
                    ? '₦' + selectedPackage.split('₦')[1]?.split('/')[0]
                    : selectedPackage
                  : `₦${Number(amount).toLocaleString()}`}
                </div>
                <div className={styles.reviewRows}>
                  <div className={styles.reviewRow}><span>Provider</span><span>{provider?.name}</span></div>
                  {category === 'electricity' && (
                    <>
                      <div className={styles.reviewRow}><span>Customer</span><span>{customerName}</span></div>
                      <div className={styles.reviewRow}><span>Meter</span><span>{meterNumber}</span></div>
                      <div className={styles.reviewRow}><span>Type</span><span style={{ textTransform: 'capitalize' }}>{meterType}</span></div>
                    </>
                  )}
                  {category === 'cable' && (
                    <>
                      <div className={styles.reviewRow}><span>Smart Card</span><span>{smartCard}</span></div>
                      <div className={styles.reviewRow}><span>Package</span><span>{selectedPackage}</span></div>
                    </>
                  )}
                  {category === 'betting' && (
                    <div className={styles.reviewRow}><span>User ID</span><span>{bettingId}</span></div>
                  )}
                </div>
                <Button variant="inverted" fullWidth onClick={() => setPinOpen(true)}>Confirm & Pay</Button>
              </div>
            )}

            {step === 'success' && (
              <div className={styles.success}>
                <div className={styles.successIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className={styles.successTitle}>Payment Successful!</div>
                <div className={styles.successSub}>{provider?.name} bill paid successfully</div>
                <div className={styles.refPill}><span className={styles.refText}>{reference}</span></div>
                <Button variant="inverted" fullWidth onClick={() => { reset(); onClose() }}>Done</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} onConfirm={handlePin} loading={pinLoading} />
    </>
  )
}
