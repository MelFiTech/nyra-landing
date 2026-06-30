import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NyraLogo from '../components/ui/NyraLogo'
import styles from './LegalPage.module.css'

const LAST_UPDATED = 'June 2026'

export default function LegalCompliancePage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logoLink} aria-label="Nyra home">
          <NyraLogo forceBlack />
        </Link>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </header>

      <main className={styles.main}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Compliance</h1>
        <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.h2}>1. Our commitment</h2>
            <p className={styles.p}>
              Nyra is built for regulated financial activity. We design our products, partnerships,
              and operations so businesses can collect, move, and reconcile money with confidence,
              within applicable laws and supervisory expectations in Nigeria.
            </p>
            <p className={styles.p}>
              Compliance is not a one-off checklist. It is embedded in how we onboard customers,
              monitor activity, protect data, and work with banking and payment partners.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>2. Regulatory framework</h2>
            <p className={styles.p}>
              Our programme is aligned with requirements and guidance relevant to payment service
              providers and financial institutions operating in Nigeria, including:
            </p>
            <ul className={styles.list}>
              <li>Central Bank of Nigeria (CBN) regulations and circulars on payments and AML/CFT.</li>
              <li>The Money Laundering (Prevention and Prohibition) Act and related AML/CFT rules.</li>
              <li>Nigeria Data Protection Act (NDPA) and applicable data-protection obligations.</li>
              <li>Financial Action Task Force (FATF) recommendations, where applicable.</li>
            </ul>
            <p className={styles.p}>
              We work with licensed banking and payment partners and maintain controls appropriate
              to our role in the payment chain.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>3. Business verification (KYB)</h2>
            <p className={styles.p}>
              Before a business can use Nyra at full scale, we verify the legal entity and its
              controllers. This typically includes:
            </p>
            <ul className={styles.list}>
              <li>Corporate registration details (e.g. CAC/RC number) and legal name.</li>
              <li>Identity verification for directors and beneficial owners.</li>
              <li>Supporting documents such as certificate of incorporation, memorandum of association, and proof of address.</li>
              <li>Ongoing review when business details or risk profile changes materially.</li>
            </ul>
            <p className={styles.p}>
              Businesses complete KYB through the Nyra dashboard. Limits may apply until verification
              is approved.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>4. Customer identity (KYC)</h2>
            <p className={styles.p}>
              Where Nyra is used to onboard or serve end customers, we support identity verification
              flows appropriate to the product, including verification against government identifiers
              such as BVN and NIN, document checks, and risk-based review.
            </p>
            <p className={styles.p}>
              API and dashboard tools help you meet your own regulatory obligations while benefiting
              from Nyra&apos;s underlying controls.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>5. AML / CFT programme</h2>
            <p className={styles.p}>
              We maintain an Anti-Money Laundering and Counter-Terrorist Financing programme that
              includes customer due diligence, sanctions screening, transaction monitoring, suspicious
              activity reporting, and record keeping. Full detail is set out in our{' '}
              <Link className={styles.inlineLink} to="/legal/aml-kyc">
                AML / KYC Policy
              </Link>
              .
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>6. Transaction monitoring</h2>
            <p className={styles.p}>
              Transfers, collections, and account activity are monitored for patterns inconsistent
              with expected behaviour. Alerts are investigated by trained staff; where required, we
              file reports with the Nigerian Financial Intelligence Unit (NFIU) and cooperate with
              lawful requests from regulators and law enforcement.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>7. Data protection &amp; security</h2>
            <p className={styles.p}>
              Personal and business data is processed lawfully, stored securely, and accessed only
              for legitimate purposes. We use encryption in transit and at rest, role-based access,
              and security practices designed to protect customer and transaction information.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>8. Your responsibilities</h2>
            <p className={styles.p}>
              Businesses using Nyra are responsible for using the platform in line with applicable
              law, providing accurate information, cooperating with verification requests, and
              implementing appropriate controls for their own customers and use cases. You must not
              use Nyra for prohibited or high-risk activity without prior written approval.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>9. Contact</h2>
            <p className={styles.p}>
              For compliance enquiries, regulatory correspondence, or law-enforcement requests,
              contact{' '}
              <a className={styles.inlineLink} href="mailto:compliance@nyrawallet.com">
                compliance@nyrawallet.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className={styles.pageFooter}>
        <span>© {new Date().getFullYear()} Nyra. All rights reserved.</span>
        <Link to="/" className={styles.footerHome}>
          Back to home
        </Link>
      </footer>
    </div>
  )
}
