import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../../landing.css'
import CloudSky from './CloudSky'
import LandingNav from './LandingNav'
import AudienceSwitch from './AudienceSwitch'
import { lineWipe } from '../../lib/motion'
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
  /** When set, the headline renders as clip-masked lines that wipe up (Veeza). */
  titleLines?: ReactNode[]
  subtitle: string
  /** Allow scrolling with sections below the hero (business landing). */
  scrollable?: boolean
  /** Content rendered below the hero when scrollable. */
  sections?: ReactNode
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
  titleLines,
  subtitle,
  scrollable = false,
  sections,
}: Props) {
  const navigate = useNavigate()

  function handleCta() {
    if (onCtaClick) {
      onCtaClick()
      return
    }
    navigate(ctaHref ?? '/app/signup')
  }

  const isPersonal = audience === 'personal'

  // Nav lives at the page root (not inside the hero's stacking context) so the
  // fixed pill always paints above the sections that scroll under it.
  const nav = (
    <motion.div
      className={styles.navSlot}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <LandingNav audience={audience} />
    </motion.div>
  )

  const hero = (
    <>
      <CloudSky />
      <div className={styles.overlayLight} />

      <div className={styles.content}>
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

            <div className={`${styles.hero} ${isPersonal ? '' : styles.heroWide}`}>
              {titleLines ? (
                <motion.h1
                  className={styles.title}
                  style={{ fontFamily: 'var(--font-display-var)' }}
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
                >
                  {titleLines.map((line, i) => (
                    <span className={styles.titleLine} key={i}>
                      <motion.span style={{ display: 'block' }} variants={lineWipe}>
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </motion.h1>
              ) : (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease, delay: 0.2 }}
                  className={styles.title}
                  style={{ fontFamily: 'var(--font-display-var)' }}
                >
                  {title}
                </motion.h1>
              )}

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
                  previewVariant === 'phone'
                    ? styles.previewInnerPhone
                    : scrollable
                      ? styles.previewInnerRaised
                      : styles.previewInner
                }
              >
                {preview}
              </div>
            </motion.div>
          )}

          {isPersonal && (
            <motion.div
              className={styles.heroHandsWrap}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.6 }}
            >
              <img
                className={styles.heroHands}
                src="/assets/hands-nyra-straight.png"
                alt=""
                aria-hidden
              />
            </motion.div>
          )}
        </div>
      </div>

      {isPersonal && <div className={styles.heroFade} aria-hidden />}
    </>
  )

  if (scrollable) {
    return (
      <div
        className={styles.pageScroll}
        style={{ fontFamily: 'var(--font-body-var)' }}
      >
        {nav}
        <div className={`${styles.heroBlock} ${isPersonal ? styles.heroBlockPersonal : ''}`}>
          {hero}
        </div>
        {sections}
      </div>
    )
  }

  return (
    <div className={styles.page} style={{ fontFamily: 'var(--font-body-var)' }}>
      {nav}
      {hero}
    </div>
  )
}
