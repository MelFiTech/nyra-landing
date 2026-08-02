import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import NyraLogo from '../components/ui/NyraLogo'
import { useBusiness } from '../context/BusinessContext'
import { identityApi, ApiError } from '../lib/api'
import { useToast } from '../context/ToastContext'
import styles from './CompliancePage.module.css'

type VerifyStep = 'bvn' | 'cac' | 'documents' | 'done'

const STEPS: { key: VerifyStep; label: string; sub: string }[] = [
  { key: 'bvn', label: 'BVN & NIN', sub: 'Director identity' },
  { key: 'cac', label: 'CAC Verification', sub: 'Business registration' },
  { key: 'documents', label: 'Document Upload', sub: 'Supporting docs' },
]

// Maps UI doc slots to the backend's accepted multipart field names.
const DOC_FIELDS = [
  { key: 'certificate_of_incorporation', label: 'Certificate of Incorporation', required: true },
  { key: 'memorandum_of_association', label: 'Memorandum of Association', required: true },
  { key: 'proof_of_address', label: 'Utility Payment Receipt', sub: 'Electricity, water or waste bill for address verification', required: true },
  { key: 'application_for_registration', label: 'Application for Registration', required: false },
] as const

const REQUIRED_DOCS = DOC_FIELDS.filter(d => d.required).map(d => d.key)

type DocFieldKey = (typeof DOC_FIELDS)[number]['key']

type DocUploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error'

function initialDocUploadState(): Record<DocFieldKey, DocUploadStatus> {
  return {
    certificate_of_incorporation: 'idle',
    memorandum_of_association: 'idle',
    proof_of_address: 'idle',
    application_for_registration: 'idle',
  }
}

function initialDocFileNames(): Record<DocFieldKey, string | null> {
  return {
    certificate_of_incorporation: null,
    memorandum_of_association: null,
    proof_of_address: null,
    application_for_registration: null,
  }
}

function StepNav({
  current,
  done,
  onStepClick,
}: {
  current: VerifyStep
  done: VerifyStep[]
  onStepClick: (step: VerifyStep) => void
}) {
  return (
    <nav className={styles.stepNav}>
      {STEPS.map((s, i) => {
        const isDone = done.includes(s.key)
        const isActive = s.key === current
        const isClickable = isDone && !isActive
        return (
          <div
            key={s.key}
            className={[
              styles.stepNavItem,
              isActive ? styles.stepNavActive : '',
              isDone ? styles.stepNavDone : '',
              isClickable ? styles.stepNavClickable : '',
            ].filter(Boolean).join(' ')}
            onClick={isClickable ? () => onStepClick(s.key) : undefined}
            onKeyDown={isClickable ? e => { if (e.key === 'Enter' || e.key === ' ') onStepClick(s.key) } : undefined}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
          >
            <div className={styles.stepNavDot}>
              {isDone ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            {i < STEPS.length - 1 && <div className={styles.stepNavLine} />}
            <div className={styles.stepNavText}>
              <span className={styles.stepNavLabel}>{s.label}</span>
              <span className={styles.stepNavSub}>{s.sub}</span>
            </div>
          </div>
        )
      })}
    </nav>
  )
}

export default function CompliancePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { business, refreshBusinesses } = useBusiness()

  const verificationStatus = business?.verification_status ?? 'NOT_STARTED'
  const alreadySubmitted =
    verificationStatus === 'PENDING' || verificationStatus === 'VERIFIED'

  const [step, setStep] = useState<VerifyStep>('bvn')
  const [done, setDone] = useState<VerifyStep[]>([])

  useEffect(() => {
    void refreshBusinesses()
  }, [refreshBusinesses])

  useEffect(() => {
    if (verificationStatus === 'PENDING' || verificationStatus === 'VERIFIED') {
      setStep('done')
      setDone(['bvn', 'cac', 'documents'])
    }
  }, [verificationStatus])

  const [bvn, setBvn] = useState('')
  const [nin, setNin] = useState('')
  const [dob, setDob] = useState('')
  const [bvnLoading, setBvnLoading] = useState(false)
  const [identityVerified, setIdentityVerified] = useState(false)

  const [rcNumber, setRcNumber] = useState('')
  const [cacLoading, setCacLoading] = useState(false)
  const [cacVerified, setCacVerified] = useState(false)

  const [docUploadStatus, setDocUploadStatus] = useState(initialDocUploadState)
  const [docFileNames, setDocFileNames] = useState(initialDocFileNames)
  const [docsLoading, setDocsLoading] = useState(false)

  function fail(err: unknown) {
    showToast(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.', 'error')
  }

  function advance(from: VerifyStep, to: VerifyStep) {
    setDone(d => (d.includes(from) ? d : [...d, from]))
    setStep(to)
  }

  function goToStep(target: VerifyStep) {
    if (done.includes(target)) setStep(target)
  }

  async function handleBvn(e: React.FormEvent) {
    e.preventDefault()
    if (bvn.length !== 11 || nin.length !== 11 || !dob) return
    setBvnLoading(true)
    try {
      await identityApi.verifyBvn(bvn, dob)
      await identityApi.verifyNin(nin)
      setBvnLoading(false)
      setIdentityVerified(true)
    } catch (err) {
      setBvnLoading(false)
      fail(err)
    }
  }

  async function handleCac(e: React.FormEvent) {
    e.preventDefault()
    if (!business) {
      showToast('No business found for your account. Please sign in again.', 'error')
      return
    }
    setCacLoading(true)
    try {
      await identityApi.verifyCac(rcNumber.trim(), business.id)
      setCacLoading(false)
      setCacVerified(true)
    } catch (err) {
      setCacLoading(false)
      fail(err)
    }
  }

  async function handleDocSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmitForReview) return
    if (!business) {
      showToast('No business found for your account. Please sign in again.', 'error')
      return
    }
    setDocsLoading(true)
    try {
      await identityApi.submitDocsForReview(business.id)
      setDocsLoading(false)
      setDone(d => (d.includes('documents') ? d : [...d, 'documents']))
      await refreshBusinesses()
      setStep('done')
    } catch (err) {
      setDocsLoading(false)
      fail(err)
    }
  }

  async function handleFileChange(field: DocFieldKey, file: File | null) {
    if (!file) return
    if (!business) {
      showToast('No business found for your account. Please sign in again.', 'error')
      return
    }

    setDocUploadStatus(prev => ({ ...prev, [field]: 'uploading' }))
    setDocFileNames(prev => ({ ...prev, [field]: file.name }))

    try {
      await identityApi.uploadDoc(business.id, field, file)
      setDocUploadStatus(prev => ({ ...prev, [field]: 'uploaded' }))
    } catch (err) {
      setDocUploadStatus(prev => ({ ...prev, [field]: 'error' }))
      setDocFileNames(prev => ({ ...prev, [field]: null }))
      fail(err)
    }
  }

  const anyDocUploading = DOC_FIELDS.some(d => docUploadStatus[d.key] === 'uploading')
  const requiredDocsUploaded = REQUIRED_DOCS.every(
    key => docUploadStatus[key] === 'uploaded',
  )
  const optionalDocPending =
    docUploadStatus.application_for_registration === 'uploading' ||
    (docFileNames.application_for_registration &&
      docUploadStatus.application_for_registration !== 'uploaded' &&
      docUploadStatus.application_for_registration !== 'idle')

  const canSubmitForReview =
    requiredDocsUploaded && !anyDocUploading && !optionalDocPending

  if (step === 'done') {
    return (
      <div className={styles.fullScreen}>
        <div className={styles.topbar}>
          <Link to="/" className={styles.logoLink} aria-label="Nyra home">
            <NyraLogo />
          </Link>
        </div>
        <div className={styles.doneWrap}>
          <div className={styles.doneBlock}>
            <div className={styles.doneIcon}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className={styles.doneTitle}>Verification submitted</h2>
            <p className={styles.doneSub}>
              Your compliance documents have been submitted for review.<br />
              You'll be notified once verification is complete (typically 24–48 hours).
            </p>
            <span className={styles.pendingBadge}>Under review</span>
            <Button variant="primary" style={{ maxWidth: 280 }} onClick={() => navigate('/app/dashboard')}>
              Go to dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.fullScreen}>
      <div className={styles.topbar}>
        <Link to="/" className={styles.logoLink} aria-label="Nyra home">
          <NyraLogo />
        </Link>
        <Button variant="outline" size="sm" onClick={() => navigate('/app/dashboard')} type="button">
          Skip for now
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </Button>
      </div>

      <div className={styles.body}>
        <aside className={styles.leftPanel}>
          <div className={styles.leftPanelInner}>
            <h1 className={styles.pageTitle}>Business Verification</h1>
            <p className={styles.pageSub}>Complete KYB to unlock full transaction limits</p>
            <StepNav current={step} done={done} onStepClick={goToStep} />
          </div>
        </aside>

        <main className={styles.rightPanel}>
          <div className={styles.card}>
            {step === 'bvn' && (
              <>
                <div className={styles.cardTitleBlock}>
                  <h2 className={styles.cardTitle}>Director Identity Verification</h2>
                  <p className={styles.cardSub}>Enter the BVN and NIN of the business director</p>
                </div>

                {!identityVerified ? (
                  <form className={styles.form} onSubmit={handleBvn}>
                    <div className={styles.field}>
                      <label className={styles.label}>Bank Verification Number (BVN)</label>
                      <input
                        className={styles.input}
                        type="text"
                        inputMode="numeric"
                        placeholder="11-digit BVN"
                        maxLength={11}
                        value={bvn}
                        onChange={e => setBvn(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Date of birth</label>
                      <input
                        className={styles.input}
                        type="date"
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        required
                      />
                      <span className={styles.fieldHint}>Must match the date of birth on your BVN record.</span>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>National Identification Number (NIN)</label>
                      <input
                        className={styles.input}
                        type="text"
                        inputMode="numeric"
                        placeholder="11-digit NIN"
                        maxLength={11}
                        value={nin}
                        onChange={e => setNin(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                    <span className={styles.fieldHint}>Your details are encrypted and used only for identity verification.</span>
                    <Button variant="primary" fullWidth type="submit" loading={bvnLoading} disabled={bvn.length !== 11 || nin.length !== 11 || !dob}>
                      Verify identity
                    </Button>
                  </form>
                ) : (
                  <div className={styles.resultSection}>
                    <div className={styles.resultBlock}>
                      <div className={styles.resultRow}>
                        <span>BVN</span>
                        <span className={styles.verifiedBadge}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Verified
                        </span>
                      </div>
                      <div className={styles.resultRow}>
                        <span>NIN</span>
                        <span className={styles.verifiedBadge}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Verified
                        </span>
                      </div>
                    </div>
                    <Button variant="primary" fullWidth type="button" onClick={() => advance('bvn', 'cac')}>
                      Continue to CAC verification
                    </Button>
                  </div>
                )}
              </>
            )}

            {step === 'cac' && (
              <>
                <div className={styles.cardTitleBlock}>
                  {done.includes('bvn') && (
                    <Button variant="ghost" type="button" onClick={() => goToStep('bvn')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                      </svg>
                      Back
                    </Button>
                  )}
                  <h2 className={styles.cardTitle}>CAC Verification</h2>
                  <p className={styles.cardSub}>Verify your business registration with the Corporate Affairs Commission</p>
                </div>

                {!cacVerified ? (
                  <form className={styles.form} onSubmit={handleCac}>
                    {business && (
                      <div className={styles.field}>
                        <label className={styles.label}>Business</label>
                        <input className={styles.input} type="text" value={business.name} disabled />
                      </div>
                    )}
                    <div className={styles.field}>
                      <label className={styles.label}>RC Number (Registration Number)</label>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="e.g. RC1234567"
                        value={rcNumber}
                        onChange={e => setRcNumber(e.target.value)}
                        required
                      />
                    </div>
                    <Button variant="primary" fullWidth type="submit" loading={cacLoading} disabled={!rcNumber}>
                      Verify with CAC
                    </Button>
                  </form>
                ) : (
                  <div className={styles.resultSection}>
                    <div className={styles.resultBlock}>
                      {business && (
                        <div className={styles.resultRow}><span>Company name</span><strong>{business.name}</strong></div>
                      )}
                      <div className={styles.resultRow}><span>RC Number</span><strong>{rcNumber}</strong></div>
                      <div className={styles.resultRow}>
                        <span>Status</span>
                        <span className={styles.verifiedBadge}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Verified
                        </span>
                      </div>
                    </div>
                    <Button variant="primary" fullWidth type="button" onClick={() => advance('cac', 'documents')}>
                      Continue to document upload
                    </Button>
                  </div>
                )}
              </>
            )}

            {step === 'documents' && (
              <>
                <div className={styles.cardTitleBlock}>
                  {done.includes('cac') && (
                    <Button variant="ghost" type="button" onClick={() => goToStep('cac')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                      </svg>
                      Back
                    </Button>
                  )}
                  <h2 className={styles.cardTitle}>Upload Documents</h2>
                  <p className={styles.cardSub}>Upload your business documents for final verification</p>
                </div>

                <form className={styles.form} onSubmit={handleDocSubmit}>
                  {DOC_FIELDS.map(doc => {
                    const status = docUploadStatus[doc.key]
                    const fileName = docFileNames[doc.key]
                    const fileInputClass = [
                      styles.fileInput,
                      status === 'uploaded' ? styles.fileInputFilled : '',
                      status === 'uploading' ? styles.fileInputUploading : '',
                      status === 'error' ? styles.fileInputError : '',
                    ]
                      .filter(Boolean)
                      .join(' ')

                    return (
                    <div key={doc.key} className={styles.field}>
                      <label className={styles.label}>
                        {doc.label}
                        {!doc.required && <span className={styles.optionalTag}>Optional</span>}
                      </label>
                      {'sub' in doc && doc.sub && <span className={styles.fieldHint}>{doc.sub}</span>}
                      <label className={fileInputClass}>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,application/pdf"
                          style={{ display: 'none' }}
                          disabled={status === 'uploading'}
                          onChange={e => {
                            const picked = e.target.files?.[0] ?? null
                            e.target.value = ''
                            void handleFileChange(doc.key, picked)
                          }}
                        />
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>
                          {status === 'uploading'
                            ? `Uploading ${fileName ?? 'file'}…`
                            : status === 'uploaded'
                              ? fileName ?? 'Uploaded'
                              : status === 'error'
                                ? 'Upload failed — click to try again'
                                : 'Click to upload (PDF, JPG, or PNG)'}
                        </span>
                        {status === 'uploaded' && (
                          <span className={styles.fileInputCheck} aria-hidden>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </span>
                        )}
                      </label>
                    </div>
                  )})}

                  <div className={styles.notice}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Documents are encrypted and stored securely. Review typically takes 24–48 hours.
                  </div>

                  <Button variant="primary" fullWidth type="submit" loading={docsLoading} disabled={!canSubmitForReview}>
                    Submit for review
                  </Button>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
