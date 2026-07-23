import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../landing.css'
import BackgroundVideo from '../components/landing/BackgroundVideo'
import LandingNav from '../components/landing/LandingNav'
import CheckIcon from '../components/landing/sections/CheckIcon'
import LandingCtaSection from '../components/landing/sections/LandingCtaSection'
import LandingFooter from '../components/landing/sections/LandingFooter'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from './PricingPage.module.css'

const HIGHLIGHTS = [
  {
    title: 'No monthly fees',
    body: 'No subscriptions, no setup fees, and no minimums. You only pay when you move money.',
  },
  {
    title: 'Pay per successful action',
    body: 'Fees apply on successful transfers and collections. Failed transactions are never charged.',
  },
  {
    title: 'Custom rates at volume',
    body: 'High-volume businesses can unlock negotiated rates in the dashboard after KYB approval.',
  },
]

type FeeTable = {
  id: string
  heading: string
  note: string
  headers: [string, string]
  rows: [string, string][]
}

const FEE_TABLES: FeeTable[] = [
  {
    id: 'transfers',
    heading: 'Outbound bank transfers',
    note: 'A flat fee based on the transfer amount, capped at ₦100 per transfer.',
    headers: ['Transfer amount', 'Fee per transfer'],
    rows: [
      ['₦0 to ₦10,000', '₦25'],
      ['₦10,001 to ₦100,000', '₦50'],
      ['₦100,001 to ₦400,000', '₦75'],
      ['₦400,001 and above', '₦100'],
    ],
  },
  {
    id: 'collections',
    heading: 'Collections',
    note: 'Charged on money paid in through virtual accounts, only when the payment succeeds.',
    headers: ['Product', 'Fee on payment'],
    rows: [
      ['Static account', '2.0% (max ₦2,000 per credit)'],
      ['Dynamic account', '₦70 per successful payment'],
    ],
  },
  {
    id: 'identity',
    heading: 'Identity verification',
    note: 'Billed per successful lookup. Failed lookups with no match are not charged.',
    headers: ['Check', 'Fee per lookup'],
    rows: [
      ['BVN (basic)', '₦60'],
      ['BVN (advanced)', '₦100'],
      ['NIN', '₦150'],
    ],
  },
]

const FLOAT_POINTS = [
  'Inbound bank transfers to your business float are free (₦0).',
  'You only pay the standard outbound fee when you move money out.',
  'Static inflows settle T+1 when settlement is enabled for your business.',
]

const CASHBACK = [
  { label: 'Airtime & data (MTN, Airtel)', value: '0.90%' },
  { label: 'Airtime & data (GLO)', value: '1.20%' },
  { label: 'Airtime & data (9mobile)', value: '1.50%' },
  { label: 'Cable TV (DStv / GOtv)', value: '0.48%' },
  { label: 'Electricity (typical DisCo)', value: '0.24% to 0.36%' },
  { label: 'Education pins (e.g. JAMB)', value: '0.72%' },
]

export default function PricingPage() {
  const navigate = useNavigate()

  usePageMeta({
    title: 'Simple, transparent pricing — Nyra',
    description:
      'Pay only for what you use. No monthly fees, no minimums, and no charges on failed transactions.',
    image: 'og-pricing.jpg',
    path: '/pricing',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={styles.page} style={{ fontFamily: 'var(--font-body-var)' }}>
      <section className={styles.heroShell} aria-labelledby="pricing-hero-title">
        <BackgroundVideo />
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroContent}>
          <LandingNav />
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>Pricing</p>
            <h1
              id="pricing-hero-title"
              className={styles.heroTitle}
              style={{ fontFamily: 'var(--font-display-var)' }}
            >
              Simple, <em>transparent</em> pricing
            </h1>
            <p className={styles.heroLead}>
              Pay only for what you use. No monthly fees, no minimums, and no charges on failed
              transactions. Just clear, low fees that scale with your business.
            </p>
            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => navigate('/app/signup')}
              >
                Open a business account
              </button>
              <a className={styles.secondaryBtn} href="/docs?view=guides&g=pricing">
                View full fee schedule
              </a>
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* Highlights */}
        <section className={styles.section}>
          <div className={styles.highlightGrid}>
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className={styles.highlightCard}>
                <span className={styles.highlightCheck} aria-hidden>
                  <CheckIcon />
                </span>
                <h3 className={styles.highlightTitle}>{item.title}</h3>
                <p className={styles.highlightBody}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fee tables */}
        <section className={`${styles.section} ${styles.sectionMuted}`}>
          <div className={styles.feesInner}>
            <span className={styles.bandLabel}>Fees</span>
            <h2 className={styles.h2} style={{ fontFamily: 'var(--font-display-var)' }}>
              Pay only for what you use
            </h2>
            <p className={styles.sectionLead}>
              Standard fees for every Nyra business account. Each successful action debits your
              business float unless noted otherwise.
            </p>

            <div className={styles.tablesGrid}>
              {FEE_TABLES.map((table) => (
                <div key={table.id} className={styles.feeTableCard}>
                  <h3 className={styles.feeTableHeading}>{table.heading}</h3>
                  <p className={styles.feeTableNote}>{table.note}</p>
                  <table className={styles.feeTable}>
                    <thead>
                      <tr>
                        <th>{table.headers[0]}</th>
                        <th>{table.headers[1]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row) => (
                        <tr key={row[0]}>
                          <td>{row[0]}</td>
                          <td className={styles.feeAmount}>{row[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Treasury float (free) */}
              <div className={styles.feeTableCard}>
                <h3 className={styles.feeTableHeading}>Treasury float</h3>
                <p className={styles.feeTableNote}>Your own business wallet.</p>
                <div className={styles.freeBadge}>₦0 to receive</div>
                <ul className={styles.floatList}>
                  {FLOAT_POINTS.map((point) => (
                    <li key={point} className={styles.floatItem}>
                      <span className={styles.floatCheck} aria-hidden>
                        <CheckIcon />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className={styles.footnote}>
              Volume businesses may receive custom pricing after approval. VAT or other statutory
              charges may apply where required by law.
            </p>
          </div>
        </section>

        {/* Cashback */}
        <section className={styles.section}>
          <div className={styles.cashbackInner}>
            <span className={styles.bandLabel}>Cashback</span>
            <h2 className={styles.h2} style={{ fontFamily: 'var(--font-display-var)' }}>
              Earn on every bill payment
            </h2>
            <p className={styles.sectionLead}>
              Eligible businesses earn cashback on successful bill payments like airtime, data,
              electricity, and TV, credited straight to your float.
            </p>
            <div className={styles.cashbackGrid}>
              {CASHBACK.map((item) => (
                <div key={item.label} className={styles.cashbackCard}>
                  <span className={styles.cashbackValue}>{item.value}</span>
                  <span className={styles.cashbackLabel}>{item.label}</span>
                </div>
              ))}
            </div>
            <p className={styles.footnote}>
              Cashback is enabled per business. Contact support@nyrawallet.com for the full biller
              list or to turn it on for your account.
            </p>
          </div>
        </section>

        {/* Custom terms */}
        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={styles.customInner}>
            <h2 className={styles.h2Dark} style={{ fontFamily: 'var(--font-display-var)' }}>
              Doing volume? Let's talk rates.
            </h2>
            <p className={styles.customLead}>
              Share your expected monthly volume and use case, and we'll propose negotiated rates or
              enable them directly in your dashboard.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => navigate('/company/about')}
            >
              Talk to sales
            </button>
          </div>
        </section>
      </main>

      <LandingCtaSection />
      <LandingFooter />
    </div>
  )
}
