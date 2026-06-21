import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../../landing.css'
import BackgroundVideo from './BackgroundVideo'
import LandingNav from './LandingNav'
import AudienceSwitch from './AudienceSwitch'
import styles from './LandingShell.module.css'

const ease = [0.22, 1, 0.36, 1] as const

type Audience = 'personal' | 'business'

type Props = {
  audience: Audience
  children?: ReactNode
  preview?: ReactNode
  previewVariant?: 'default' | 'phone'
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
  /** Renders instead of the default CTA button when provided. */
  ctaSlot?: ReactNode
  /** @deprecated badge pill removed from the hero; kept optional for callers */
  badge?: string
  title: ReactNode
  subtitle: string
}

export default function LandingShell({
  audience,
  children,
  preview,
  previewVariant = 'default',
  ctaLabel,
  ctaHref,
  onCtaClick,
  ctaSlot,
  title,
  subtitle,
}: Props) {
  const navigate = useNavigate()

  function handleCta() {
    if (onCtaClick) {
      onCtaClick()
      return
    }
    navigate(ctaHref ?? '/app/signup')
  }

  return (
    <div className={styles.page} style={{ fontFamily: 'var(--font-body-var)' }}>
      <BackgroundVideo />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <motion.div
          className={styles.navSlot}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LandingNav />
        </motion.div>

        <div className={styles.heroSection}>
          <div className={styles.heroCopy}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.15 }}
              className={styles.audienceRow}
            >
              <AudienceSwitch active={audience} />
            </motion.div>

            <div className={styles.hero}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.2 }}
              className={styles.title}
              style={{ fontFamily: 'var(--font-display-var)' }}
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.3 }}
              className={styles.subtitle}
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.4 }}
            >
              {ctaSlot ?? (
                <button type="button" className={styles.cta} onClick={handleCta}>
                  {ctaLabel}
                </button>
              )}
            </motion.div>

            {children}
            </div>
          </div>

          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.5 }}
              className={styles.previewWrap}
            >
              <div
                className={
                  previewVariant === 'phone' ? styles.previewInnerPhone : styles.previewInner
                }
              >
                {preview}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
