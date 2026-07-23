import { useEffect } from 'react'
import '../landing.css'
import BackgroundVideo from '../components/landing/BackgroundVideo'
import LandingNav from '../components/landing/LandingNav'
import LandingCtaSection from '../components/landing/sections/LandingCtaSection'
import LandingFooter from '../components/landing/sections/LandingFooter'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from './AboutPage.module.css'

const IMAGES = {
  team:
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  platform:
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
  joint:
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=900&q=80',
  values:
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80',
}

const VALUES = [
  {
    title: 'Trust by default',
    body: 'Money is built on trust. We hold ourselves to bank-grade security, transparent practices, and rigorous compliance so businesses can move with confidence.',
  },
  {
    title: 'Simplicity is the product',
    body: 'The best financial tools disappear into the background. We obsess over removing friction until sending, collecting, and managing money feels effortless.',
  },
  {
    title: 'Built to scale',
    body: 'From a first transaction to millions, our infrastructure is engineered to grow with you: reliable, fast, and ready for whatever comes next.',
  },
  {
    title: 'Better together',
    body: 'Money is rarely managed alone. We design for teams, partners, and families who need to hold and move money together with clarity and control.',
  },
]

const WHAT_WE_DO = [
  {
    title: 'Business accounts',
    body: 'Multi-currency accounts that let businesses hold, send, and receive money locally and across borders.',
  },
  {
    title: 'Instant payouts',
    body: 'Move money to any bank in seconds, with real-time settlement and transparent fees.',
  },
  {
    title: 'Joint accounts',
    body: 'Shared accounts with pooled balances, shared visibility, and granular controls for everyone involved.',
  },
  {
    title: 'Identity & compliance',
    body: 'KYC, KYB, and verification built in, so onboarding is fast and every transaction stays compliant.',
  },
  {
    title: 'Developer APIs',
    body: 'A clean, well-documented API and webhooks to embed payments and accounts directly into your product.',
  },
  {
    title: 'Treasury & insight',
    body: 'A single dashboard to see balances, track cash flow, and understand every movement of money.',
  },
]

export default function AboutPage() {
  usePageMeta({
    title: 'About Nyra — Building the rails for seamless business payments',
    description:
      'Nyra makes moving money effortless for businesses, and reimagines how people and teams hold money together.',
    image: 'og-about.jpg',
    path: '/company/about',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={styles.page} style={{ fontFamily: 'var(--font-body-var)' }}>
      <section className={styles.heroShell} aria-labelledby="about-hero-title">
        <BackgroundVideo />
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroContent}>
          <LandingNav />
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>About Nyra</p>
            <h1
              id="about-hero-title"
              className={styles.heroTitle}
              style={{ fontFamily: 'var(--font-display-var)' }}
            >
              Building the rails for <em>seamless</em> business payments
            </h1>
            <p className={styles.heroLead}>
              Nyra is a financial technology company on a mission to make moving money effortless for
              businesses, and to reimagine how people and teams hold money together. We turn the
              complexity of modern finance into simple, dependable products.
            </p>
          </div>
        </div>
      </section>

      <main>
        <section className={styles.band}>
          <div className={styles.bandInner}>
            <span className={styles.bandLabel}>Our mission</span>
            <p className={styles.bandStatement} style={{ fontFamily: 'var(--font-display-var)' }}>
              To make payments invisible, so every business can focus on what it does best, while
              money simply moves.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.splitGrid}>
            <div className={styles.prose}>
              <h2 className={styles.h2} style={{ fontFamily: 'var(--font-display-var)' }}>
                Why we exist
              </h2>
              <p className={styles.p}>
                Moving money should be the easiest part of running a business. Yet for too long it has
                meant slow transfers, opaque fees, fragmented tools, and infrastructure that wasn't
                built for how businesses actually operate. We started Nyra to change that and build
                the financial backbone that businesses deserve.
              </p>
              <p className={styles.p}>
                We bring together accounts, payouts, identity, compliance, and developer-grade APIs
                into one platform, backed by the banking relationships and licensing that make it all
                work. The result is a single place to send, collect, and manage money that's fast, secure,
                and built to scale.
              </p>
            </div>
            <figure className={styles.figure}>
              <img
                src={IMAGES.team}
                alt="Nyra team collaborating"
                className={styles.image}
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={styles.jointGrid}>
            <div>
              <span className={styles.darkLabel}>Pioneering joint accounts</span>
              <h2 className={styles.h2Dark} style={{ fontFamily: 'var(--font-display-var)' }}>
                Money is rarely managed alone
              </h2>
              <p className={styles.pDark}>
                Most accounts assume one owner. Real life doesn't work that way: partners run
                businesses together, teams share budgets, families pool resources, and co-founders
                split costs.
              </p>
              <p className={styles.pDark}>
                Nyra pioneered modern joint accounts so people can hold and move money together with
                shared balances, full transparency, and the controls each member needs. It's a
                simpler, fairer way to manage shared money, and a first of its kind for businesses
                and individuals alike.
              </p>
            </div>
            <figure className={styles.figureDark}>
              <img
                src={IMAGES.joint}
                alt="Shared finances and joint accounts"
                className={styles.image}
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.platformRow}>
            <figure className={styles.figureWide}>
              <img
                src={IMAGES.platform}
                alt="Nyra platform in use"
                className={styles.image}
                loading="lazy"
              />
            </figure>
            <div className={styles.platformCopy}>
              <h2 className={styles.h2} style={{ fontFamily: 'var(--font-display-var)' }}>
                What we build
              </h2>
              <p className={styles.sectionLead}>
                A complete financial toolkit designed to work together and to disappear into how
                your business runs.
              </p>
            </div>
          </div>
          <div className={styles.grid}>
            {WHAT_WE_DO.map((item) => (
              <div key={item.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardBody}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionMuted}`}>
          <figure className={styles.valuesBanner}>
            <img
              src={IMAGES.values}
              alt="People working together"
              className={styles.image}
              loading="lazy"
            />
          </figure>
          <h2 className={`${styles.h2} ${styles.valuesHeading}`} style={{ fontFamily: 'var(--font-display-var)' }}>
            What we believe
          </h2>
          <div className={styles.valuesGrid}>
            {VALUES.map((value) => (
              <div key={value.title} className={styles.valueItem}>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueBody}>{value.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <LandingCtaSection />
      <LandingFooter />
    </div>
  )
}
