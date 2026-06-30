import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NyraLogo from '../components/ui/NyraLogo'
import styles from './LegalPage.module.css'

const LAST_UPDATED = 'June 2026'

export default function TermsOfServicePage() {
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
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.h2}>1. Agreement</h2>
            <p className={styles.p}>
              These Terms of Service ("Terms") govern your access to and use of Nyra's website,
              dashboard, APIs, and related products and services (collectively, the "Services")
              operated by Nyra ("Nyra", "we", "us", or "our").
            </p>
            <p className={styles.p}>
              By creating an account, accessing the Services, or clicking to accept these Terms, you
              agree to be bound by them. If you are using the Services on behalf of a business, you
              represent that you have authority to bind that business.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>2. Eligibility</h2>
            <p className={styles.p}>
              To use the Services, you must be at least 18 years old and capable of entering into a
              legally binding agreement. Business users must be duly registered entities or authorised
              representatives with valid documentation. We may refuse or terminate access where
              eligibility or verification requirements are not met.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>3. Account registration and security</h2>
            <p className={styles.p}>
              You must provide accurate, complete, and current information during registration and
              keep your account details up to date. You are responsible for maintaining the
              confidentiality of your login credentials, API keys, wallet PIN, and any other access
              secrets.
            </p>
            <p className={styles.p}>
              You must notify us promptly of any unauthorised access or suspected compromise. Nyra is
              not liable for losses arising from your failure to secure account credentials.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>4. Verification and compliance</h2>
            <p className={styles.p}>
              Use of certain Services requires identity or business verification (KYC/KYB). You agree
              to cooperate with verification requests and to provide documents and information we
              reasonably require to comply with applicable laws, including AML/CFT regulations.
            </p>
            <p className={styles.p}>
              We may suspend, limit, or close accounts that fail verification, present elevated risk,
              or are associated with prohibited activity. See our{' '}
              <Link className={styles.inlineLink} to="/legal/aml-kyc">
                AML/KYC Policy
              </Link>{' '}
              and{' '}
              <Link className={styles.inlineLink} to="/legal/compliance">
                Compliance
              </Link>{' '}
              pages for more detail.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>5. Permitted use</h2>
            <p className={styles.p}>You may use the Services only for lawful purposes. You agree not to:</p>
            <ul className={styles.list}>
              <li>Violate any applicable law, regulation, or third-party rights.</li>
              <li>Use the Services for fraud, money laundering, terrorist financing, or sanctions evasion.</li>
              <li>Transmit malware, attempt unauthorised access, or interfere with platform security.</li>
              <li>Reverse engineer, scrape, or misuse the APIs except as permitted in documentation.</li>
              <li>Misrepresent your identity, business, or the nature of your transactions.</li>
              <li>Use the Services for prohibited industries or activities we publish from time to time.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>6. Payments, fees, and settlement</h2>
            <p className={styles.p}>
              Transaction limits, fees, settlement times, and supported payment methods are disclosed
              in the dashboard, pricing pages, or applicable order forms. By initiating a payment or
              transfer, you authorise us and our partners to debit or credit the relevant accounts in
              accordance with your instructions.
            </p>
            <p className={styles.p}>
              You are responsible for ensuring sufficient funds, accurate beneficiary details, and
              compliance with tax and reporting obligations related to your transactions. Nyra may
              delay, reject, or reverse transactions where required by law, risk controls, or
              partner rules.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>7. API and developer terms</h2>
            <p className={styles.p}>
              If you access Nyra via API, you must comply with our documentation, rate limits, and
              security requirements. API keys are confidential and must not be embedded in public
              client-side code. You are responsible for activity conducted through your keys and
              webhook endpoints.
            </p>
            <p className={styles.p}>
              We may modify API versions or deprecate endpoints with reasonable notice where
              practicable. Continued use after changes constitutes acceptance of updated technical
              requirements.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>8. Intellectual property</h2>
            <p className={styles.p}>
              The Services, including software, branding, content, and documentation, are owned by
              Nyra or its licensors and protected by intellectual property laws. These Terms grant
              you a limited, non-exclusive, non-transferable right to use the Services in accordance
              with these Terms. No other rights are granted.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>9. Privacy</h2>
            <p className={styles.p}>
              Our collection and use of personal data is described in our{' '}
              <Link className={styles.inlineLink} to="/legal/privacy">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>10. Service availability and changes</h2>
            <p className={styles.p}>
              We strive to keep the Services available and reliable but do not guarantee
              uninterrupted access. Maintenance, partner outages, or events beyond our reasonable
              control may affect availability. We may add, modify, or discontinue features with
              notice where appropriate.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>11. Disclaimers</h2>
            <p className={styles.p}>
              The Services are provided on an "as is" and "as available" basis to the fullest extent
              permitted by law. Nyra disclaims warranties of merchantability, fitness for a
              particular purpose, and non-infringement. We do not warrant that the Services will be
              error-free or that all transactions will complete within a specific timeframe.
            </p>
            <p className={styles.p}>
              Nyra is a technology platform working with regulated partners. We are not a bank unless
              expressly stated for a specific licensed product.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>12. Limitation of liability</h2>
            <p className={styles.p}>
              To the maximum extent permitted by law, Nyra and its affiliates, officers, employees,
              and partners will not be liable for any indirect, incidental, special, consequential,
              or punitive damages, or for loss of profits, revenue, data, or goodwill arising from
              your use of the Services.
            </p>
            <p className={styles.p}>
              Our aggregate liability for claims relating to the Services will not exceed the greater
              of (a) the fees you paid to Nyra in the three months before the claim arose, or (b) the
              amount required by applicable law.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>13. Indemnity</h2>
            <p className={styles.p}>
              You agree to indemnify and hold harmless Nyra from claims, losses, and expenses
              (including reasonable legal fees) arising from your breach of these Terms, misuse of the
              Services, or violation of law or third-party rights.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>14. Suspension and termination</h2>
            <p className={styles.p}>
              You may close your account at any time subject to settling outstanding obligations. We
              may suspend or terminate access immediately if you breach these Terms, pose a security
              or compliance risk, or where required by law or a partner.
            </p>
            <p className={styles.p}>
              Provisions that by their nature should survive termination (including payment
              obligations, liability limits, indemnity, and dispute resolution) will continue to
              apply.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>15. Governing law and disputes</h2>
            <p className={styles.p}>
              These Terms are governed by the laws of the Federal Republic of Nigeria, without regard
              to conflict-of-law principles. Disputes will first be addressed through good-faith
              negotiation. If unresolved, disputes shall be subject to the exclusive jurisdiction of
              the courts of Nigeria, unless mandatory law provides otherwise.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>16. Changes to these Terms</h2>
            <p className={styles.p}>
              We may update these Terms from time to time. The latest version will be posted on this
              page with an updated "Last updated" date. Material changes may also be communicated by
              email or in-product notice. Continued use after changes take effect constitutes
              acceptance.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>17. Contact</h2>
            <p className={styles.p}>
              Questions about these Terms can be directed to{' '}
              <a className={styles.inlineLink} href="mailto:legal@nyrawallet.com">
                legal@nyrawallet.com
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
