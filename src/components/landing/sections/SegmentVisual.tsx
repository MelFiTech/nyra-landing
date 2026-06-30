import { useRef } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import type { SegmentKey } from './data'
import styles from './SegmentVisual.module.css'

const SEGMENT_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4'

const GRAPHIC_COPY: Record<SegmentKey, { label: string; metric: string; sub: string }> = {
  financial: {
    label: 'Treasury flow',
    metric: '₦ 48.2M',
    sub: 'Processed this week',
  },
  marketplaces: {
    label: 'Vendor payouts',
    metric: '2,840',
    sub: 'Settlements today',
  },
  smes: {
    label: 'Cash position',
    metric: '₦ 12.6M',
    sub: 'Available balance',
  },
}

const ORBS = [
  { size: 120, top: '12%', left: '8%', delay: 0 },
  { size: 80, top: '58%', left: '72%', delay: 0.4 },
  { size: 56, top: '70%', left: '18%', delay: 0.8 },
]

type Props = {
  segment: SegmentKey
}

export default function SegmentVisual({ segment }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const graphic = GRAPHIC_COPY[segment]

  return (
    <div ref={ref} className={styles.root} aria-hidden>
      <video
        className={styles.video}
        src={SEGMENT_VIDEO}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className={styles.scrim} />

      {ORBS.map((orb) => (
        <motion.span
          key={`${orb.top}-${orb.left}`}
          className={styles.orb}
          style={{ width: orb.size, height: orb.size, top: orb.top, left: orb.left }}
          animate={
            inView
              ? {
                  y: [0, -12, 0],
                  opacity: [0.35, 0.65, 0.35],
                  scale: [1, 1.06, 1],
                }
              : { y: 0, opacity: 0.2, scale: 1 }
          }
          transition={{
            duration: 4.5,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        className={styles.pulseRing}
        animate={inView ? { scale: [1, 1.12, 1], opacity: [0.25, 0.5, 0.25] } : undefined}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={segment}
          className={styles.card}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.cardLabel}>{graphic.label}</span>
          <span className={styles.cardMetric}>{graphic.metric}</span>
          <span className={styles.cardSub}>{graphic.sub}</span>
          <div className={styles.sparkRow}>
            {[42, 58, 48, 72, 64, 88, 52].map((height, index) => (
              <motion.span
                key={`${segment}-${index}`}
                className={styles.spark}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.45,
                  delay: 0.08 * index,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
