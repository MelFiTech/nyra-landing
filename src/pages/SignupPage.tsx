import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import NyraLogo from '../components/ui/NyraLogo'
import AuthGoBack from '../components/auth/AuthGoBack'
import AuthLayout from '../components/auth/AuthLayout'
import AuthVisualPanel from '../components/auth/AuthVisualPanel'
import { authApi, businessApi, ApiError } from '../lib/api'
import { useToast } from '../context/ToastContext'
import styles from './LoginPage.module.css'

type Step = 'personal' | 'otp' | 'business' | 'success'

const BUSINESS_TYPES = [
  { value: 'BUSINESS_NAME', label: 'Business Name' },
  { value: 'REGISTERED_COMPANY', label: 'Registered Company' },
  { value: 'INCORPORATED_TRUSTEES', label: 'Incorporated Trustees' },
  { value: 'LIMITED_PARTNERSHIP', label: 'Limited Partnership' },
  { value: 'LIMITED_LIABILITY_PARTNERSHIP', label: 'Limited Liability Partnership' },
]

const STEP_COUNT = 3 // personal, otp, business

function stepIndex(step: Step) {
  return { personal: 1, otp: 2, business: 3, success: 3 }[step]
}

// Backend rules: firstname/lastname single word, 3-20 chars
const NAME_RE = /^\w{3,20}$/

export default function SignupPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('personal')
  const [loading, setLoading] = useState(false)

  // personal
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // otp
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpToken, setOtpToken] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // business
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (step === 'otp') otpRefs.current[0]?.focus()
  }, [step])

  function fail(err: unknown) {
    setLoading(false)
    showToast(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.', 'error')
  }

  async function handlePersonal(e: React.FormEvent) {
    e.preventDefault()
    if (!NAME_RE.test(firstname.trim()) || !NAME_RE.test(lastname.trim())) {
      showToast('First and last name must be a single word, 3–20 characters.', 'error')
      return
    }
    setLoading(true)
    try {
      const token = await authApi.signupVerify(email.trim())
      setOtpToken(token)
      setLoading(false)
      setStep('otp')
    } catch (err) {
      fail(err)
    }
  }

  async function handleResend() {
    try {
      const token = await authApi.signupVerify(email.trim())
      setOtpToken(token)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
      showToast('A new code has been sent to your email.')
    } catch (err) {
      fail(err)
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return
    setLoading(true)
    try {
      await authApi.verifyEmail(email.trim().toLowerCase(), code, otpToken)
      await authApi.signup({
        email: email.trim().toLowerCase(),
        password,
        firstname: firstname.trim(),
        lastname: lastname.trim(),
      })
      setLoading(false)
      setStep('business')
    } catch (err) {
      fail(err)
    }
  }

  function handleOtpInput(i: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus()
    }
  }

  async function handleBusiness(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await businessApi.register({
        business_name: businessName.trim(),
        business_type: businessType,
        address: address.trim(),
      })
      setLoading(false)
      setStep('success')
    } catch (err) {
      fail(err)
    }
  }

  function handleSuccess() {
    navigate('/app/compliance')
  }

  const filled = stepIndex(step)

  return (
    <AuthLayout sidePanel={<AuthVisualPanel variant="signup" />}>
        <AuthGoBack
          onGoBack={
            step === 'otp'
              ? () => {
                  setOtp(['', '', '', '', '', ''])
                  setStep('personal')
                }
              : undefined
          }
        />
        <Link to="/" className={styles.logo} aria-label="Go to home">
          <NyraLogo className={styles.logoImg} />
        </Link>

        {step !== 'success' && (
          <div className={styles.stepIndicator} aria-label={`Step ${filled} of ${STEP_COUNT}`}>
            {Array.from({ length: STEP_COUNT }).map((_, i) => {
              const stepNum = i + 1
              const isCurrent = stepNum === filled
              const isDone = stepNum < filled
              return (
                <span
                  key={i}
                  className={
                    isCurrent
                      ? styles.stepDotActive
                      : isDone
                        ? styles.stepDotDone
                        : styles.stepDot
                  }
                />
              )
            })}
          </div>
        )}

        {/* Step 1: Personal info */}
        {step === 'personal' && (
          <>
            <h1 className={styles.heading}>Create your account</h1>
            <p className={styles.subheading}>Step 1 of 3: Personal details</p>
            <form className={styles.form} onSubmit={handlePersonal}>
              <div className={styles.nameRow}>
                <div className={styles.field}>
                  <label className={styles.label}>First name</label>
                  <input className={styles.input} type="text" placeholder="John" value={firstname} onChange={e => setFirstname(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Last name</label>
                  <input className={styles.input} type="text" placeholder="Doe" value={lastname} onChange={e => setLastname(e.target.value)} required />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input className={styles.input} type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    className={styles.input}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8+ chars, upper, number & symbol"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <Button type="button" variant="icon" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" variant="primary" fullWidth loading={loading}>Continue</Button>
            </form>
            <p className={styles.footer}>
              Already have an account? <Link to="/app/login" className={styles.link}>Sign in</Link>
            </p>
          </>
        )}

        {/* Step 2: Email OTP */}
        {step === 'otp' && (
          <>
            <h1 className={styles.heading}>Verify your email</h1>
            <p className={styles.subheading}>Step 2 of 3: We sent a 6-digit code to <strong>{email}</strong></p>
            <form className={styles.form} onSubmit={handleOtp}>
              <div className={styles.otpRow}>
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    className={styles.otpBox}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={v}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                  />
                ))}
              </div>
              <Button type="submit" variant="primary" fullWidth loading={loading} disabled={otp.join('').length < 6}>Verify email</Button>
              <p className={styles.otpHint}>
                Didn't receive it?{' '}
                <Button type="button" variant="text" onClick={handleResend}>Resend code</Button>
              </p>
            </form>
          </>
        )}

        {/* Step 3: Business info */}
        {step === 'business' && (
          <>
            <h1 className={styles.heading}>Business details</h1>
            <p className={styles.subheading}>Step 3 of 3: Tell us about your business</p>
            <form className={styles.form} onSubmit={handleBusiness}>
              <div className={styles.field}>
                <label className={styles.label}>Business name</label>
                <input className={styles.input} type="text" placeholder="Acme Technologies Ltd." value={businessName} onChange={e => setBusinessName(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Business type</label>
                <select className={styles.businessTypeSelect} value={businessType} onChange={e => setBusinessType(e.target.value)} required>
                  <option value="">Select business type</option>
                  {BUSINESS_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Business address</label>
                <input className={styles.input} type="text" placeholder="123 Main Street, Lagos" value={address} onChange={e => setAddress(e.target.value)} required />
              </div>
              <Button type="submit" variant="primary" fullWidth loading={loading}>Create business</Button>
            </form>
          </>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className={styles.successBlock}>
            <div className={styles.successCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className={styles.successTitle}>You're all set!</h1>
            <p className={styles.successSub}>
              Your account and business have been created.<br />
              Let's verify your business to unlock full access.
            </p>
            <Button variant="primary" fullWidth style={{ marginTop: 8 }} onClick={handleSuccess}>
              Complete verification
            </Button>
          </div>
        )}
    </AuthLayout>
  )
}
