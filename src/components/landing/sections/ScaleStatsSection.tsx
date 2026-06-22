import { useRef, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import AnimatedStatValue, { type StatConfig } from '../AnimatedStatValue'
import { STATS } from './data'
import styles from './ScaleStatsSection.module.css'

const CARD_STYLES = [styles.card1, styles.card2, styles.card3] as const
const RING_CIRCUMFERENCE = 2 * Math.PI * 44
const RING_OFFSET = RING_CIRCUMFERENCE * 0.001

const VOLUME_BARS = [36, 52, 44, 68, 58, 76]

type CardProps = {
  index: number
  cardClass: string
  stat: StatConfig
  visual: (active: boolean) => ReactNode
}

function ScaleStatCard({ index, cardClass, stat, visual }: CardProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.article
      ref={ref}
      className={`${styles.card} ${cardClass}`}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {visual(inView)}
      <AnimatedStatValue
        stat={stat}
        index={index}
        className={styles.statBlock}
        valueClassName={styles.statValue}
        labelClassName={styles.statLabel}
      />
    </motion.article>
  )
}

function BusinessesVisual({ active }: { active: boolean }) {
  return (
    <motion.div
      className={styles.promptBox}
      initial={{ opacity: 0, y: 16 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      Trusted by <span className={styles.blurText}>growing businesses</span> across{' '}
      <span className={styles.blurText}>Nigeria</span> for{' '}
      <span className={styles.blurText}>everyday payments</span>
    </motion.div>
  )
}

function UptimeVisual({ active }: { active: boolean }) {
  return (
    <div className={styles.uptimeVisual} aria-hidden>
      <svg className={styles.uptimeSvg} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="uptimeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e5a1f5" />
            <stop offset="100%" stopColor="#f8aca0" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="52" fill="rgba(255,255,255,0.92)" />
        <circle
          cx="60"
          cy="60"
          r="44"
          fill="none"
          stroke="rgba(15,23,42,0.08)"
          strokeWidth="8"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="44"
          fill="none"
          stroke="url(#uptimeGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
          animate={{ strokeDashoffset: active ? RING_OFFSET : RING_CIRCUMFERENCE }}
          transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          transform="rotate(-90 60 60)"
        />
        <motion.path
          d="M42 62 L54 74 L78 48"
          fill="none"
          stroke="#1e293b"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.45, delay: 1.35, ease: 'easeOut' }}
        />
      </svg>
      <motion.span
        className={styles.uptimeCaption}
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 1.5 }}
      >
        Always on
      </motion.span>
    </div>
  )
}

function VolumeVisual({ active }: { active: boolean }) {
  return (
    <>
      <motion.div
        className={styles.mesh}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
      <div className={styles.barChart} aria-hidden>
        {VOLUME_BARS.map((height, barIndex) => (
          <motion.div
            key={barIndex}
            className={styles.bar}
            initial={{ scaleY: 0 }}
            animate={active ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.2 + barIndex * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </>
  )
}

export default function ScaleStatsSection() {
  return (
    <section className={styles.shell}>
      <div className={styles.container}>
        <p className={styles.badge}>Platform scale</p>
        <h2 className={styles.title}>Scale with ease</h2>
        <p className={styles.subtitle}>
          Infrastructure that handles payments, compliance,
          <br />
          and operations — so you can focus on growth
        </p>

        <div className={styles.grid}>
          <ScaleStatCard
            index={0}
            cardClass={CARD_STYLES[0]}
            stat={STATS[0]}
            visual={(active) => <BusinessesVisual active={active} />}
          />
          <ScaleStatCard
            index={1}
            cardClass={CARD_STYLES[1]}
            stat={STATS[1]}
            visual={(active) => <UptimeVisual active={active} />}
          />
          <ScaleStatCard
            index={2}
            cardClass={CARD_STYLES[2]}
            stat={STATS[2]}
            visual={(active) => <VolumeVisual active={active} />}
          />
        </div>
      </div>
    </section>
  )
}
