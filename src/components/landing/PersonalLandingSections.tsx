import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { Eye, Fingerprint, ShieldCheck, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import AppStoreButtons from './AppStoreButtons'
import AnimatedStatValue, { type StatConfig } from './AnimatedStatValue'
import LandingFooter from './sections/LandingFooter'
import { ease, enter, lineWipe, rise, stagger } from '../../lib/motion'
import styles from './PersonalLandingSections.module.css'

const STATS: StatConfig[] = [
  { target: 120, suffix: 'K+', label: 'Couples banking together' },
  { target: 9.4, prefix: '₦', suffix: 'B+', decimals: 1, label: 'Saved and spent together' },
  { target: 4.9, suffix: '/5', decimals: 1, label: 'Average app rating' },
]

const cardReveal = {
  hidden: { opacity: 0, y: 44, rotate: -8, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.85, ease, staggerChildren: 0.1, delayChildren: 0.28 },
  },
}

const cardItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

const chipReveal = {
  // opacity only, the chips' idle `floaty` CSS animation owns their transform.
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease } },
}

/** A small circular avatar with an eye that blinks and glances, to liven the
 *  floating expense chips. */
function EyeAvatar({ tone }: { tone: 'mint' | 'indigo' }) {
  return (
    <span className={`${styles.eyeAvatar} ${styles[`eyeAvatar_${tone}`]}`} aria-hidden>
      <span className={styles.eye}>
        <span className={styles.pupil} />
      </span>
    </span>
  )
}

const SHARED_TAGS = [
  'Rent',
  'Groceries',
  'Date nights',
  'Utilities',
  'Savings goals',
  'Trips',
  'Subscriptions',
  'School fees',
  'Emergencies',
]

type Tone = 'indigo' | 'green' | 'ink'
const TONES: Record<Tone, string> = {
  indigo: '#4b46e5',
  green: '#0a3f30',
  ink: '#0d1117',
}

const STEPS: { n: string; tone: Tone; title: string[]; body: string; note: string }[] = [
  {
    n: '01',
    tone: 'indigo',
    title: ['Create', 'your account'],
    body: 'Sign up in minutes with just your phone number and BVN. No paperwork, no branch queues, no waiting for approval.',
    note: 'Takes about 3 minutes',
  },
  {
    n: '02',
    tone: 'green',
    title: ['Invite', 'your partner'],
    body: 'Add the person you share life with. They get their own secure login and full visibility, nothing is ever hidden from either of you.',
    note: 'They keep their own login',
  },
  {
    n: '03',
    tone: 'ink',
    title: ['Spend & save', 'together'],
    body: 'Move money, set shared goals, and watch every transaction land in real time. One balance, one source of truth, for both of you.',
    note: 'Real-time for both partners',
  },
]

const TRUST: { icon: LucideIcon; tone: string; title: string; body: string }[] = [
  {
    icon: Eye,
    tone: 'mint',
    title: 'See everything',
    body: 'Both partners see every transaction the moment it happens, so there are never any end-of-month surprises.',
  },
  {
    icon: Fingerprint,
    tone: 'indigo',
    title: 'Your own login',
    body: 'Each of you gets a personal, secure login. Shared money but separate access, exactly the way it should be.',
  },
  {
    icon: SlidersHorizontal,
    tone: 'green',
    title: 'Agree on limits',
    body: 'Set spending limits and savings goals together, then adjust them any time the two of you decide to change.',
  },
  {
    icon: ShieldCheck,
    tone: 'ink',
    title: 'Fully protected',
    body: 'Bank-grade encryption and regulated banking partners hold your funds, keeping your money and your data safe.',
  },
]

const FEATURES = [
  {
    title: 'Shared goals',
    body: 'Save together for rent, a trip, or a rainy day, and track every naira of progress in real time.',
  },
  {
    title: 'Joint cards',
    body: 'Spend from one shared balance and always know exactly who spent what, and where.',
  },
  {
    title: 'Bills on autopilot',
    body: 'Split the rent and automate the recurring bills you both rely on, so nothing slips.',
  },
  {
    title: 'Instant transfers',
    body: 'Send money to each other, and to anyone else, free and instant, day or night.',
  },
]

const FAQS = [
  {
    q: 'Who can open a joint account with Nyra?',
    a: 'Anyone you share money with, a partner, a spouse, a sibling, or a close friend. You each need a valid Nigerian ID and BVN to get started.',
  },
  {
    q: 'Do we each get our own login?',
    a: 'Yes. Every person on a joint account has their own secure login and app, with full visibility into the shared balance and history.',
  },
  {
    q: 'Is our money safe?',
    a: 'Your money is held with Nyra’s licensed banking partners, and every account is protected with bank-grade encryption and round-the-clock monitoring.',
  },
  {
    q: 'What does it cost?',
    a: 'Opening a joint account is completely free. You only ever pay standard, transparent fees on a few transaction types, no hidden charges.',
  },
]

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

const DEAL_WIDE = 210
const DEAL_NARROW = 96
const NARROW = '(max-width: 860px)'

function useDealDistance() {
  const [d, setD] = useState(DEAL_WIDE)
  useEffect(() => {
    const mq = window.matchMedia(NARROW)
    const sync = () => setD(mq.matches ? DEAL_NARROW : DEAL_WIDE)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return d
}

/** Scroll progress (0..1) through a tall section, measured live each frame. */
function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const progress = useMotionValue(0)
  useEffect(() => {
    const update = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const travel = r.height - window.innerHeight
      progress.set(travel > 0 ? clamp(-r.top / travel, 0, 1) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [progress, ref])
  return progress
}

/**
 * The fanned deck behind the lead card, the tapered wedges from Veeza's comp,
 * recoloured to Nyra's card tones. The two dark wedges are card edges; the two
 * coloured slivers follow the pile as it deals, so they read correctly going
 * back up as well.
 */
function Fan({ progress, count, tones }: { progress: MotionValue<number>; count: number; tones: string[] }) {
  const [inputs, near, far] = useMemo(() => {
    const span = 1 / (count - 1)
    const tone = (i: number) => tones[i % count]
    const ins = [0]
    const a = [tone(1)]
    const b = [tone(2)]
    for (let i = 1; i < count; i += 1) {
      const at = (i - 1) * span + 0.27
      ins.push(at - 0.04, at + 0.04)
      a.push(tone(i), tone(i + 1))
      b.push(tone(i + 1), tone(i + 2))
    }
    ins.push(1)
    a.push(tone(count))
    b.push(tone(count + 1))
    return [ins, a, b] as const
  }, [count, tones])

  const nearFill = useTransform(progress, inputs, near)
  const farFill = useTransform(progress, inputs, far)

  return (
    <svg
      viewBox="0 0 115.916 514.728"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden
    >
      <path d="M115.916 52.0856H51.0643L113.554 497.877H115.916V52.0856Z" fill="#161a22" />
      <motion.path d="M51.0643 52.0856V497.877H113.554L51.0643 52.0856Z" style={{ fill: nearFill }} />
      <path d="M51.0643 125.618H0L51.0643 472.345V125.618Z" fill="#161a22" />
      <motion.path d="M0 125.618V472.345H51.0643L0 125.618Z" style={{ fill: farFill }} />
    </svg>
  )
}

function StackCard({
  step,
  index,
  count,
  progress,
  deal,
  reduced,
}: {
  step: (typeof STEPS)[number]
  index: number
  count: number
  progress: MotionValue<number>
  deal: number
  reduced: boolean
}) {
  const isLast = index === count - 1
  const span = 1 / (count - 1)
  const from = index * span + 0.08
  const to = index * span + span * 0.68

  const x = useTransform(progress, [from, to], isLast ? [0, 0] : [0, -deal])
  const scale = useTransform(progress, [from, to], isLast ? [1, 1] : [1, 0.86])
  const rotate = useTransform(progress, [from, to], isLast ? [0, 0] : [0, -4])
  const opacity = useTransform(
    progress,
    [from, from + (to - from) * 0.45, to],
    isLast ? [1, 1, 1] : [1, 1, 0],
  )

  return (
    <motion.article
      className={`${styles.stackCard} ${styles[`tone_${step.tone}`]}`}
      style={reduced ? { zIndex: count - index } : { x, scale, rotate, opacity, zIndex: count - index }}
    >
      <div className={styles.stackCardCopy}>
        <span className={styles.stepNumber}>{step.n}</span>
        <h3 className={styles.stackCardTitle}>
          {step.title.map((line) => (
            <span key={line} className={styles.stackTitleLine}>
              {line}
            </span>
          ))}
        </h3>
        <p className={styles.stackCardBody}>{step.body}</p>
        <span className={styles.stepNote}>{step.note}</span>
      </div>
      <div className={styles.stackCardGlyph} aria-hidden>
        {step.n}
      </div>
    </motion.article>
  )
}

function StackSection() {
  const ref = useRef<HTMLDivElement>(null)
  const progress = useSectionProgress(ref)
  const deal = useDealDistance()
  const reduced = useReducedMotion() ?? false
  const tones = STEPS.map((s) => TONES[s.tone])

  return (
    <section className={styles.stackSection} id="how">
      <div className={styles.container}>
        <motion.p className="mkt-eyebrow" {...enter()}>
          How it works
        </motion.p>
        <motion.h2 className={`mkt-display ${styles.stackTitle}`} {...enter()}>
          Open a joint account <em>in minutes</em>
        </motion.h2>
      </div>

      <div ref={ref} className={styles.stackTrack} style={{ '--cards': STEPS.length } as CSSProperties}>
        <div className={`${styles.container} ${styles.stackSticky}`}>
          <div className={styles.stackRel}>
            <div className={styles.stackFan} aria-hidden>
              <Fan progress={progress} count={STEPS.length} tones={tones} />
            </div>
            <div className={styles.stackStage}>
              {STEPS.map((step, i) => (
                <StackCard
                  key={step.n}
                  step={step}
                  index={i}
                  count={STEPS.length}
                  progress={progress}
                  deal={deal}
                  reduced={reduced}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-5%', '6%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16])

  return (
    <section className={styles.ctaSection} ref={ref}>
      <motion.img
        className={styles.ctaBg}
        src="/assets/cta-bg.png"
        alt=""
        aria-hidden
        style={{ y: bgY, scale: bgScale }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.4, ease }}
      />
      <div className={styles.ctaGrain} aria-hidden />
      <div className={styles.ctaVignette} aria-hidden />
      <div className={styles.ctaInner}>
        <motion.h2
          className={styles.ctaTitle}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          <span className={styles.ctaTitleLine}>
            <motion.span style={{ display: 'block' }} variants={lineWipe}>
              Banking for two,
            </motion.span>
          </span>
          <span className={styles.ctaTitleLine}>
            <motion.span style={{ display: 'block' }} variants={lineWipe}>
              <em>built for life</em>
            </motion.span>
          </span>
        </motion.h2>
        <motion.p
          className={styles.ctaLead}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={rise}
        >
          Open a joint account with the person you share everything with. Free to start, in minutes,
          on iOS and Android.
        </motion.p>
        <motion.div
          className={styles.ctaActions}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={rise}
        >
          <AppStoreButtons />
        </motion.div>
      </div>
    </section>
  )
}

export default function PersonalLandingSections() {
  return (
    <div className={styles.root}>
      {/* Growth stats, animated counters */}
      <section className={styles.stats}>
        <motion.div
          className={`${styles.container} ${styles.statsGrid}`}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger(0.12)}
        >
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} className={styles.stat} variants={rise}>
              <AnimatedStatValue
                stat={stat}
                index={i}
                valueClassName={styles.statValue}
                labelClassName={styles.statLabel}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Shared-expense band */}
      <section className={styles.band}>
        <motion.div className={`${styles.container} ${styles.bandGrid}`} {...enter(stagger(0.08))}>
          <div className={styles.bandCopy}>
            <motion.p className="mkt-eyebrow" variants={rise}>
              One account, everything shared
            </motion.p>
            <motion.h2 className={`mkt-display ${styles.bandTitle}`} variants={rise}>
              Everything you share,
              <br />
              <em>in one place</em>
            </motion.h2>
            <motion.p className={styles.bandLead} variants={rise}>
              Rent, groceries, the big trip you’re both saving for. Pool it, track it, and settle up
              without the spreadsheet.
            </motion.p>
            <motion.ul className={styles.tagRow} variants={stagger(0.04)}>
              {SHARED_TAGS.map((tag) => (
                <motion.li key={tag} className={styles.tag} variants={rise}>
                  {tag}
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <motion.div className={styles.bandVisual} variants={stagger(0.14, 0.05)}>
            <motion.div
              className={`mkt-panel mkt-panel--indigo ${styles.jointCard}`}
              variants={cardReveal}
            >
              <motion.div className={styles.jointCardTop} variants={cardItem}>
                <span className={styles.jointCardBrand}>Nyra</span>
                <span className={styles.jointCardTag}>Joint account</span>
              </motion.div>
              <motion.div className={styles.jointCardBalance} variants={cardItem}>
                <span className={styles.jointCardLabel}>Shared balance</span>
                <span className={styles.jointCardAmount}>₦248,500.00</span>
              </motion.div>
              <motion.div className={styles.jointCardBottom} variants={cardItem}>
                <div className={styles.avatars}>
                  <span className={styles.avatar}>GO</span>
                  <span className={`${styles.avatar} ${styles.avatarAlt}`}>AD</span>
                </div>
                <span className={styles.jointCardNames}>Goodness &amp; Ada</span>
              </motion.div>
            </motion.div>

            <motion.div className={`${styles.floatChip} ${styles.floatChipA}`} variants={chipReveal}>
              <EyeAvatar tone="mint" />
              Rent · split 50 / 50
            </motion.div>
            <motion.div className={`${styles.floatChip} ${styles.floatChipB}`} variants={chipReveal}>
              <EyeAvatar tone="indigo" />
              Ada added ₦20,000
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stack-scroll: how it works */}
      <StackSection />

      {/* Trust / visibility */}
      <section className={styles.trustSection}>
        <motion.div className={styles.container} {...enter(stagger(0.08))}>
          <motion.p className="mkt-eyebrow" variants={rise}>
            Full visibility
          </motion.p>
          <motion.h2 className={`mkt-display ${styles.sectionTitle}`} variants={rise}>
            Shared money, <em>zero surprises</em>
          </motion.h2>
          <motion.p className={styles.sectionLead} variants={rise}>
            The hardest part of sharing money is not knowing. Nyra makes everything visible to both
            of you, all the time.
          </motion.p>
          <motion.div className={styles.trustGrid} variants={stagger(0.08)}>
            {TRUST.map((item) => {
              const Icon = item.icon
              return (
                <motion.article key={item.title} className={styles.trustCard} variants={rise}>
                  <span className={`${styles.trustIcon} ${styles[`trustIcon_${item.tone}`]}`}>
                    <Icon size={26} strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className={styles.trustCardBody}>
                    <h3 className={styles.trustTitle}>{item.title}</h3>
                    <p className={styles.trustBody}>{item.body}</p>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className={styles.featureSection}>
        <motion.div className={styles.container} {...enter(stagger(0.08))}>
          <motion.p className="mkt-eyebrow" variants={rise}>
            Features
          </motion.p>
          <motion.h2 className={`mkt-display ${styles.sectionTitle}`} variants={rise}>
            Built for a <em>shared life</em>
          </motion.h2>
          <motion.div className={styles.featureGrid} variants={stagger(0.08)}>
            {FEATURES.map((feature, i) => (
              <motion.article key={feature.title} className={styles.featureCard} variants={rise}>
                <span className={styles.featureIndex}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureBody}>{feature.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <motion.div className={styles.containerNarrow} {...enter(stagger(0.06))}>
          <motion.p className="mkt-eyebrow" variants={rise}>
            Common questions
          </motion.p>
          <motion.h2 className={`mkt-display ${styles.sectionTitle}`} variants={rise}>
            Good to know
          </motion.h2>
          <motion.div className={styles.faqList} variants={stagger(0.05)}>
            {FAQS.map((faq) => (
              <motion.details key={faq.q} className={styles.faqItem} variants={rise}>
                <summary className={styles.faqQuestion}>
                  {faq.q}
                  <span className={styles.faqPlus} aria-hidden />
                </summary>
                <p className={styles.faqAnswer}>{faq.a}</p>
              </motion.details>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <CtaSection />

      <LandingFooter />
    </div>
  )
}
