import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import NyraLogo from '../components/ui/NyraLogo'
import AuthGoBack from '../components/auth/AuthGoBack'
import AuthLayout from '../components/auth/AuthLayout'
import AuthVisualPanel from '../components/auth/AuthVisualPanel'
import { authApi, businessApi, session, ApiError } from '../lib/api'
import { useToast } from '../context/ToastContext'
import styles from './LoginPage.module.css'

type Step = 'email' | 'password' | 'set_password' | 'invite_expired' | 'otp'

const DEFAULT_OTP_TTL_SEC = 600

function formatCountdown(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function isExpiredOtpError(err: unknown) {
  if (!(err instanceof ApiError)) return false
  const msg = err.message.toLowerCase()
  return msg.includes('expir') || msg.includes('invalid otp') || msg.includes('otp')
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const inviteBootstrapped = useRef(false)

  useEffect(() => {
    if (session.token) navigate('/app/dashboard', { replace: true })
  }, [navigate])

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteName, setInviteName] = useState<string | null>(null)
  const [inviteBusiness, setInviteBusiness] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const [otpToken, setOtpToken] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const otpExpired = step === 'otp' && expiresAt !== null && secondsLeft <= 0

  useEffect(() => {
    if (step === 'otp') otpRefs.current[0]?.focus()
  }, [step])

  useEffect(() => {
    if (step !== 'otp' || expiresAt === null) return

    function tick() {
      const left = Math.max(0, Math.ceil((expiresAt! - Date.now()) / 1000))
      setSecondsLeft(left)
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [step, expiresAt])

  function fail(err: unknown) {
    showToast(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.', 'error')
  }

  function startOtpSession(data: { otpToken: string; email: string; expiresIn?: number }) {
    const ttl = data.expiresIn && data.expiresIn > 0 ? data.expiresIn : DEFAULT_OTP_TTL_SEC
    setOtpToken(data.otpToken)
    setMaskedEmail(data.email)
    setOtp(['', '', '', '', '', ''])
    setExpiresAt(Date.now() + ttl * 1000)
    setSecondsLeft(ttl)
  }

  function applyLookup(lookup: {
    next: 'password' | 'set_password' | 'invite_expired'
    email: string
    name?: string | null
    businessName?: string | null
  }) {
    setMaskedEmail(lookup.email)
    setPassword('')
    setConfirmPassword('')
    if (lookup.next === 'invite_expired') {
      setInviteName(lookup.name ?? null)
      setInviteBusiness(lookup.businessName ?? null)
      setStep('invite_expired')
    } else if (lookup.next === 'set_password') {
      setInviteName(lookup.name ?? null)
      setInviteBusiness(lookup.businessName ?? null)
      setStep('set_password')
    } else {
      setInviteName(null)
      setInviteBusiness(null)
      setStep('password')
    }
  }

  useEffect(() => {
    if (inviteBootstrapped.current || session.token) return
    const inviteFlag = searchParams.get('invite')
    const emailParam = searchParams.get('email')?.trim().toLowerCase()
    if (inviteFlag !== '1' || !emailParam) return

    inviteBootstrapped.current = true
    setEmail(emailParam)
    setSearchParams({}, { replace: true })

    let cancelled = false
    setLoading(true)
    authApi
      .businessSigninLookup(emailParam)
      .then(lookup => {
        if (cancelled) return
        applyLookup(lookup)
      })
      .catch(err => {
        if (cancelled) return
        fail(err)
        setStep('email')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // Bootstrap once from the invite deep link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams])

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const lookup = await authApi.businessSigninLookup(email.trim().toLowerCase())
      applyLookup(lookup)
    } catch (err) {
      fail(err)
    } finally {
      setLoading(false)
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const challenge = await authApi.businessSignin(email.trim().toLowerCase(), password)
      startOtpSession(challenge)
      setStep('otp')
    } catch (err) {
      if (err instanceof ApiError && err.message.toLowerCase().includes('invite expired')) {
        setStep('invite_expired')
      } else if (err instanceof ApiError && err.message.toLowerCase().includes('set a password')) {
        setStep('set_password')
      } else {
        fail(err)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    setLoading(true)
    try {
      const challenge = await authApi.businessSetPassword(email.trim().toLowerCase(), password)
      startOtpSession(challenge)
      setStep('otp')
      showToast('Password saved. Enter the code we sent to your email.')
    } catch (err) {
      if (err instanceof ApiError && err.message.toLowerCase().includes('invite expired')) {
        setStep('invite_expired')
      } else {
        fail(err)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      const data = await authApi.businessResendOtp(email.trim().toLowerCase())
      startOtpSession(data)
      otpRefs.current[0]?.focus()
      showToast('A new code has been sent. It expires in 10 minutes.')
    } catch (err) {
      fail(err)
    } finally {
      setResending(false)
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otpExpired) {
      showToast('This code has expired. Request a new one.', 'error')
      return
    }
    const code = otp.join('')
    if (code.length < 6) return
    setLoading(true)
    try {
      await authApi.businessSigninOtp(email.trim().toLowerCase(), otpToken, code)
      await businessApi.getAll()
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      if (isExpiredOtpError(err)) {
        setSecondsLeft(0)
        setExpiresAt(Date.now())
        setOtp(['', '', '', '', '', ''])
        showToast(
          err instanceof ApiError && err.message
            ? err.message
            : 'This code has expired or is invalid. Request a new one.',
          'error',
        )
      } else {
        fail(err)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleOtpInput(i: number, val: string) {
    if (otpExpired) return
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (otpExpired) return
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus()
    }
  }

  function goBackFromAuthStep() {
    setPassword('')
    setConfirmPassword('')
    setStep('email')
  }

  const passwordField = (
    <div className={styles.passwordWrapper}>
      <input
        className={styles.input}
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <Button
        type="button"
        variant="icon"
        className={styles.eyeBtn}
        onClick={() => setShowPassword(v => !v)}
      >
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
  )

  return (
    <AuthLayout sidePanel={<AuthVisualPanel variant="login" />}>
        <AuthGoBack />
        <Link to="/" className={styles.logo} aria-label="Go to home">
          <NyraLogo className={styles.logoImg} />
        </Link>

        {step === 'email' && (
          <>
            <h1 className={styles.heading}>Welcome back</h1>
            <p className={styles.subheading}>Sign in to your business account</p>

            <form className={styles.form} onSubmit={handleEmail}>
              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" fullWidth loading={loading}>Continue</Button>
            </form>

            <p className={styles.footer}>
              Don't have an account? <Link to="/app/signup" className={styles.link}>Get started</Link>
            </p>
          </>
        )}

        {step === 'password' && (
          <>
            <h1 className={styles.heading}>Enter your password</h1>
            <p className={styles.subheading}>
              Signing in as <strong>{maskedEmail || email}</strong>
            </p>

            <form className={styles.form} onSubmit={handlePassword}>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Password</label>
                  <a href="#" className={styles.forgot}>Forgot password?</a>
                </div>
                {passwordField}
              </div>

              <Button type="submit" fullWidth loading={loading}>Continue</Button>
              <Button type="button" variant="text" onClick={goBackFromAuthStep}>
                Use a different email
              </Button>
            </form>
          </>
        )}

        {step === 'set_password' && (
          <>
            <h1 className={styles.heading}>Set your password</h1>
            <p className={styles.subheading}>
              {inviteName
                ? `Welcome${inviteBusiness ? ` to ${inviteBusiness}` : ''}, ${inviteName}. Create a password to join the team.`
                : 'You were invited to a business. Create a password to continue.'}
            </p>

            <form className={styles.form} onSubmit={handleSetPassword}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" value={email} disabled readOnly />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>New password</label>
                {passwordField}
                <p className={styles.passwordHint}>
                  6–20 characters with upper, lower, number, and special character.
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Confirm password</label>
                <input
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" fullWidth loading={loading}>Set password & continue</Button>
              <Button type="button" variant="text" onClick={goBackFromAuthStep}>
                Use a different email
              </Button>
            </form>
          </>
        )}

        {step === 'invite_expired' && (
          <>
            <h1 className={styles.heading}>Invite expired</h1>
            <p className={styles.subheading}>
              {inviteBusiness
                ? `Your invite to join ${inviteBusiness} has expired. Ask the business owner to resend it.`
                : 'Your team invite has expired. Ask the business owner to resend it.'}
            </p>
            <div className={styles.form}>
              <Button type="button" fullWidth onClick={goBackFromAuthStep}>
                Back to sign in
              </Button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 className={styles.heading}>Check your email</h1>
            <p className={styles.subheading}>
              We sent a 6-digit code to <strong>{maskedEmail || email}</strong>
            </p>
            <form className={styles.form} onSubmit={handleOtp}>
              <div className={styles.otpRow}>
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    className={`${styles.otpBox} ${otpExpired ? styles.otpBoxDisabled : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={v}
                    disabled={otpExpired || loading}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    aria-invalid={otpExpired}
                  />
                ))}
              </div>

              <p className={`${styles.otpExpiry} ${otpExpired ? styles.otpExpiryExpired : ''}`} role="status">
                {otpExpired
                  ? 'Code expired. Request a new one to continue.'
                  : `Code expires in ${formatCountdown(secondsLeft)}`}
              </p>

              <p className={styles.otpHint}>
                {otpExpired ? (
                  <>
                    Need a new code?{' '}
                    <Button type="button" variant="text" loading={resending} onClick={handleResend}>
                      Resend code
                    </Button>
                  </>
                ) : (
                  <>
                    Didn't receive it?{' '}
                    <Button type="button" variant="text" loading={resending} onClick={handleResend}>
                      Resend code
                    </Button>
                  </>
                )}
              </p>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={otpExpired || otp.join('').length < 6}
              >
                Sign in
              </Button>
            </form>
          </>
        )}
    </AuthLayout>
  )
}
