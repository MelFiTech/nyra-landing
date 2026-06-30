import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NyraLogo from '../components/ui/NyraLogo'
import styles from './LegalPage.module.css'

const LAST_UPDATED = 'June 2026'

export default function AmlKycPolicyPage() {
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
        <h1 className={styles.title}>AML / KYC Policy</h1>
        <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.h2}>1. Overview</h2>
            <p className={styles.p}>
              Nyra ("Nyra", "we", "us", or "our") is committed to the highest standards of
              Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) compliance. This
              policy describes the controls we apply to detect, prevent, and report money
              laundering, terrorist financing, and other financial crime across our products and
              services.
            </p>
            <p className={styles.p}>
              We operate in line with the Money Laundering (Prevention and Prohibition) Act, the
              Central Bank of Nigeria (CBN) AML/CFT Regulations, guidance issued by the Nigerian
              Financial Intelligence Unit (NFIU), and applicable recommendations of the Financial
              Action Task Force (FATF).
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>2. Purpose &amp; Scope</h2>
            <p className={styles.p}>
              This policy applies to all Nyra customers, employees, contractors, and partners, and
              to every account, wallet, transfer, and integration offered through our platform and
              APIs. Its purpose is to:
            </p>
            <ul className={styles.list}>
              <li>Verify the identity of every customer and beneficial owner before onboarding.</li>
              <li>Assess and continuously monitor the money-laundering risk of each relationship.</li>
              <li>Detect and report suspicious activity to the relevant authorities.</li>
              <li>Maintain accurate records to support audits and regulatory enquiries.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>3. Know Your Customer (KYC) &amp; Customer Due Diligence</h2>
            <p className={styles.p}>
              Before a customer can transact, we carry out Customer Due Diligence (CDD) appropriate
              to their risk profile. For individuals this includes verification of legal name, date
              of birth, residential address, and a government identifier such as a Bank Verification
              Number (BVN) or National Identification Number (NIN).
            </p>
            <p className={styles.p}>
              For businesses, we additionally verify the legal entity, its registration details
              (e.g. CAC/RC number), and the identity of directors and beneficial owners holding a
              material interest in the entity. Supporting documents, such as a certificate of
              incorporation, memorandum of association, and proof of address, are collected and
              validated.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>4. Risk-Based Approach</h2>
            <p className={styles.p}>
              We apply a risk-based approach, assigning each customer a risk rating based on factors
              including their identity, location, transaction patterns, products used, and exposure
              to higher-risk jurisdictions. Controls are scaled to the assessed level of risk.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>5. Enhanced Due Diligence (EDD)</h2>
            <p className={styles.p}>
              Enhanced Due Diligence is performed for higher-risk customers, including Politically
              Exposed Persons (PEPs), customers in high-risk jurisdictions, and those displaying
              unusual or complex transaction behaviour. EDD may include obtaining additional
              documentation, establishing source of funds and wealth, and senior-management approval
              before onboarding or continuing a relationship.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>6. Sanctions &amp; Watchlist Screening</h2>
            <p className={styles.p}>
              Customers and transactions are screened against applicable sanctions lists and
              watchlists, including those maintained by the United Nations, relevant national
              regulators, and other recognised bodies. Matches are investigated and, where
              confirmed, the relationship is blocked and reported as required by law.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>7. Ongoing Monitoring</h2>
            <p className={styles.p}>
              We monitor transactions on an ongoing basis to identify activity that is inconsistent
              with a customer's known profile, expected behaviour, or stated purpose. Automated rules
              and manual review are used to flag unusual patterns for further investigation.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>8. Reporting Suspicious Activity</h2>
            <p className={styles.p}>
              Where we identify activity that we know or suspect to be linked to money laundering,
              terrorist financing, or other financial crime, we file Suspicious Transaction Reports
              (STRs) with the NFIU in accordance with statutory timelines. We do not "tip off" any
              party that a report has been or may be made.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>9. Record Keeping</h2>
            <p className={styles.p}>
              Customer identification records, transaction data, and internal reports are retained
              for at least the minimum period required by law (generally five years after the end of
              a relationship or completion of a transaction), and made available to regulators and
              law-enforcement on lawful request.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>10. Governance, Training &amp; the MLRO</h2>
            <p className={styles.p}>
              Nyra appoints a Money Laundering Reporting Officer (MLRO) responsible for oversight of
              this policy, regulatory reporting, and liaison with authorities. All relevant staff
              receive AML/CTF training at onboarding and periodically thereafter so they can
              recognise and escalate suspicious activity.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>11. Data Protection</h2>
            <p className={styles.p}>
              Information collected for KYC and AML purposes is processed securely and only for
              compliance and legitimate business purposes, in line with the Nigeria Data Protection
              Act and our Privacy Policy.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>12. Updates to this Policy</h2>
            <p className={styles.p}>
              We may update this policy from time to time to reflect changes in regulation, risk, or
              our products. The latest version will always be available on this page.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>13. Contact</h2>
            <p className={styles.p}>
              Questions about this policy or our AML/KYC programme can be directed to our compliance
              team at{' '}
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
        <Link to="/" className={styles.footerHome}>Back to home</Link>
      </footer>
    </div>
  )
}
