import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import styles from './LandingCtaSection.module.css'

const CTA_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4'

export default function LandingCtaSection() {
  const navigate = useNavigate()

  return (
    <section className={styles.shell} aria-label="Get started with Nyra">
      <video
        className={styles.video}
        src={CTA_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      />
      <div className={styles.overlay} aria-hidden />

      <div className={styles.content}>
        <div className={`liquid-glass-strong ${styles.panel}`}>
          <div className={styles.heroCenter}>
            <h2 className={styles.title}>
              Ready to grow with <em>smarter</em> business banking
            </h2>
            <p className={styles.lead}>
              Open a business account and start collecting, paying out, and scaling in minutes.
            </p>
            <button
              type="button"
              className={`liquid-glass-strong ${styles.ctaBtn}`}
              onClick={() => navigate('/app/signup')}
            >
              Open an account
              <span className={styles.ctaIconWrap}>
                <Download size={14} strokeWidth={2} />
              </span>
            </button>
            <div className={styles.pillRow}>
              {['Accounts', 'Payouts', 'Identity'].map((label) => (
                <span key={label} className={`liquid-glass ${styles.pill}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
