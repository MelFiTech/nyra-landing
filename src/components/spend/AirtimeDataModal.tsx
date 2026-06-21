import { useState, useEffect } from 'react'
import { getDataPlans, purchaseAirtime, purchaseData, detectNetwork, type DataPlan } from '../../services/mockApi'
import Button from '../ui/Button'
import PinModal from '../treasury/PinModal'
import { BRAND } from '../../lib/brand'
import styles from './AirtimeDataModal.module.css'

type Props = { open: boolean; onClose: () => void }
type Tab = 'airtime' | 'data'
type Step = 'input' | 'review' | 'success'

const AMOUNTS = [50, 100, 200, 500, 1000, 2000]

export default function AirtimeDataModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('airtime')
  const [step, setStep] = useState<Step>('input')
  const [phone, setPhone] = useState('')
  const [network, setNetwork] = useState('')
  const [amount, setAmount] = useState('')
  const [plans, setPlans] = useState<DataPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null)
  const [plansLoading, setPlansLoading] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const [reference, setReference] = useState('')

  useEffect(() => {
    if (open) { setStep('input'); setPhone(''); setNetwork(''); setAmount(''); setSelectedPlan(null); setReference('') }
  }, [open])

  useEffect(() => {
    const n = detectNetwork(phone)
    setNetwork(n)
    if (n && tab === 'data') {
      setPlansLoading(true)
      setSelectedPlan(null)
      getDataPlans(n).then(p => { setPlans(p); setPlansLoading(false) })
    }
  }, [phone, tab])

  const networkColors: Record<string, string> = {
    MTN: '#FFC107', Airtel: '#E53935', Glo: '#2E7D32', '9mobile': '#1B5E20'
  }

  async function handlePin(pin: string) {
    setPinLoading(true)
    const result = tab === 'airtime'
      ? await purchaseAirtime({ phone, network, amount, pin })
      : await purchaseData({ phone, network, plan_id: selectedPlan?.plan_id, pin })
    setPinLoading(false)
    setPinOpen(false)
    setReference(result.reference)
    setStep('success')
  }

  const canContinueAirtime = phone.length >= 10 && network && amount && Number(amount) > 0
  const canContinueData = phone.length >= 10 && network && selectedPlan

  if (!open) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.header}>
            {step !== 'input' && step !== 'success' && (
              <Button variant="icon" onClick={() => setStep('input')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </Button>
            )}
            <span className={styles.title}>{step === 'success' ? 'Purchase Successful' : tab === 'airtime' ? 'Buy Airtime' : 'Buy Data'}</span>
            <Button variant="icon" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </Button>
          </div>

          <div className={styles.body}>
            {step === 'input' && (
              <>
                <div className={styles.tabs}>
                  <button className={`${styles.tab} ${tab === 'airtime' ? styles.tabActive : ''}`} onClick={() => setTab('airtime')}>Airtime</button>
                  <button className={`${styles.tab} ${tab === 'data' ? styles.tabActive : ''}`} onClick={() => setTab('data')}>Data</button>
                </div>

                <div className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Phone Number</label>
                    <div className={styles.phoneRow}>
                      <input
                        className={styles.input}
                        placeholder="080XXXXXXXX"
                        value={phone}
                        maxLength={11}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      />
                      {network && (
                        <span className={styles.networkBadge} style={{ background: networkColors[network] || BRAND }}>
                          {network}
                        </span>
                      )}
                    </div>
                  </div>

                  {tab === 'airtime' && (
                    <>
                      <div className={styles.field}>
                        <label className={styles.label}>Amount (₦)</label>
                        <input className={styles.input} type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                        <div className={styles.presets}>
                          {AMOUNTS.map(a => (
                            <button key={a} className={`${styles.preset} ${amount === String(a) ? styles.presetActive : ''}`} onClick={() => setAmount(String(a))}>
                              ₦{a}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Button variant="inverted" fullWidth disabled={!canContinueAirtime} onClick={() => setStep('review')}>Continue</Button>
                    </>
                  )}

                  {tab === 'data' && (
                    <>
                      {plansLoading && (
                        <div className={styles.plansGrid}>
                          {[1,2,3,4].map(i => <div key={i} className={styles.planSkeleton} />)}
                        </div>
                      )}
                      {!plansLoading && network && plans.length > 0 && (
                        <div className={styles.field}>
                          <label className={styles.label}>Select Plan</label>
                          <div className={styles.plansGrid}>
                            {plans.map(p => (
                              <button
                                key={p.plan_id}
                                className={`${styles.planCard} ${selectedPlan?.plan_id === p.plan_id ? styles.planCardActive : ''}`}
                                onClick={() => setSelectedPlan(p)}
                              >
                                <span className={styles.planVolume}>{p.data_volume}</span>
                                <span className={styles.planValidity}>{p.validity}</span>
                                <span className={styles.planPrice}>₦{p.amount.toLocaleString()}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {!plansLoading && !network && phone.length > 0 && (
                        <p className={styles.networkError}>Could not detect network. Check the number.</p>
                      )}
                      <Button variant="inverted" fullWidth disabled={!canContinueData} onClick={() => setStep('review')}>Continue</Button>
                    </>
                  )}
                </div>
              </>
            )}

            {step === 'review' && (
              <div className={styles.review}>
                <div className={styles.reviewAmount}>
                  {tab === 'airtime' ? `₦${Number(amount).toLocaleString()}` : selectedPlan?.data_volume}
                </div>
                <div className={styles.reviewRows}>
                  <div className={styles.reviewRow}><span>Phone</span><span>{phone}</span></div>
                  <div className={styles.reviewRow}><span>Network</span><span>{network}</span></div>
                  {tab === 'airtime' && <div className={styles.reviewRow}><span>Amount</span><span>₦{Number(amount).toLocaleString()}</span></div>}
                  {tab === 'data' && selectedPlan && (
                    <>
                      <div className={styles.reviewRow}><span>Plan</span><span>{selectedPlan.plan_name}</span></div>
                      <div className={styles.reviewRow}><span>Validity</span><span>{selectedPlan.validity}</span></div>
                      <div className={styles.reviewRow}><span>Amount</span><span>₦{selectedPlan.amount.toLocaleString()}</span></div>
                    </>
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
                <div className={styles.successTitle}>Purchase Successful!</div>
                <div className={styles.successSub}>{tab === 'airtime' ? `₦${Number(amount).toLocaleString()} airtime` : selectedPlan?.data_volume + ' data'} sent to {phone}</div>
                <div className={styles.refPill}><span className={styles.refText}>{reference}</span></div>
                <Button variant="inverted" fullWidth onClick={onClose}>Done</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} onConfirm={handlePin} loading={pinLoading} />
    </>
  )
}
