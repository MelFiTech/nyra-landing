import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NyraLogo from '../components/ui/NyraLogo'
import styles from './LegalPage.module.css'

const LAST_UPDATED = 'June 2026'

export default function PrivacyPolicyPage() {
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
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.h2}>1. Introduction</h2>
            <p className={styles.p}>
              Nyra ("Nyra", "we", "us", or "our") respects your privacy and is committed to
              protecting your personal data. This Privacy Policy explains how we collect, use,
              disclose, store, and protect information when you use our website, mobile
              applications, dashboard, APIs, and related services (collectively, the "Services").
            </p>
            <p className={styles.p}>
              By accessing or using the Services, you acknowledge that you have read and understood
              this Privacy Policy. If you do not agree, please do not use the Services.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>2. Who we are</h2>
            <p className={styles.p}>
              Nyra is a financial technology company that provides payment, account, identity, and
              treasury tools for businesses and individuals in Nigeria and supported markets. We
              work with licensed banking and payment partners to deliver regulated financial
              services.
            </p>
            <p className={styles.p}>
              For data protection purposes, Nyra is the data controller responsible for your personal
              data, unless we inform you otherwise for a specific product or integration.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>3. Information we collect</h2>
            <p className={styles.p}>We may collect the following categories of information:</p>
            <ul className={styles.list}>
              <li>
                <strong>Identity and contact data:</strong> name, email address, phone number, date
                of birth, residential or business address, and government identifiers such as BVN or
                NIN.
              </li>
              <li>
                <strong>Business data:</strong> company name, registration number (e.g. CAC/RC),
                directors, beneficial owners, industry, and supporting incorporation documents.
              </li>
              <li>
                <strong>Financial data:</strong> bank account details, transaction history, wallet
                balances, payment references, and payout instructions.
              </li>
              <li>
                <strong>Technical data:</strong> IP address, device type, browser, operating system,
                session logs, API usage, and cookies or similar technologies.
              </li>
              <li>
                <strong>Communications:</strong> support messages, feedback, and correspondence with
                our team.
              </li>
              <li>
                <strong>Compliance data:</strong> verification results, risk assessments, and records
                required for AML/CFT and regulatory obligations.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>4. How we collect information</h2>
            <p className={styles.p}>We collect information when you:</p>
            <ul className={styles.list}>
              <li>Register for an account or complete onboarding and verification.</li>
              <li>Use the dashboard, APIs, webhooks, or other Nyra products.</li>
              <li>Contact customer support or respond to surveys.</li>
              <li>Visit our website or interact with marketing communications.</li>
              <li>Are referred by a partner or integrated service you authorise.</li>
            </ul>
            <p className={styles.p}>
              We may also receive information from identity verification providers, banking partners,
              credit bureaus, fraud-prevention services, and publicly available sources where
              permitted by law.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>5. How we use your information</h2>
            <p className={styles.p}>We use personal data to:</p>
            <ul className={styles.list}>
              <li>Provide, operate, and improve the Services.</li>
              <li>Verify identity, onboard customers, and meet KYB/KYC obligations.</li>
              <li>Process payments, transfers, collections, and account activity.</li>
              <li>Detect, prevent, and investigate fraud, abuse, and financial crime.</li>
              <li>Comply with legal, regulatory, and audit requirements.</li>
              <li>Communicate with you about your account, security alerts, and product updates.</li>
              <li>Analyse usage to improve performance, reliability, and user experience.</li>
              <li>Enforce our Terms of Service and protect the rights and safety of Nyra and others.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>6. Legal bases for processing</h2>
            <p className={styles.p}>
              Depending on the context, we process personal data based on one or more of the
              following grounds under the Nigeria Data Protection Act (NDPA) and applicable law:
            </p>
            <ul className={styles.list}>
              <li>Performance of a contract with you or your business.</li>
              <li>Compliance with a legal or regulatory obligation.</li>
              <li>Legitimate interests that are not overridden by your rights (e.g. fraud prevention).</li>
              <li>Your consent, where required (e.g. certain marketing communications).</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>7. How we share information</h2>
            <p className={styles.p}>
              We do not sell your personal data. We may share information with:
            </p>
            <ul className={styles.list}>
              <li>Licensed banking and payment partners that help us deliver the Services.</li>
              <li>Identity verification, fraud prevention, and analytics providers.</li>
              <li>Cloud infrastructure, security, and professional advisers under confidentiality duties.</li>
              <li>Regulators, law enforcement, or courts when required by law or to protect rights and safety.</li>
              <li>Affiliates or successors in the event of a merger, acquisition, or restructuring.</li>
            </ul>
            <p className={styles.p}>
              If you use Nyra through a third-party application, we may share limited data with that
              provider as necessary to complete the integration you authorise.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>8. International transfers</h2>
            <p className={styles.p}>
              Your data may be processed in Nigeria or in other countries where our service providers
              operate. Where data is transferred outside Nigeria, we implement appropriate safeguards
              consistent with the NDPA and applicable regulations.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>9. Data retention</h2>
            <p className={styles.p}>
              We retain personal data only for as long as necessary to provide the Services, meet
              legal and regulatory requirements (including AML/CFT record-keeping), resolve disputes,
              and enforce our agreements. Retention periods may vary by data type and obligation.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>10. Security</h2>
            <p className={styles.p}>
              We implement technical and organisational measures designed to protect personal data,
              including encryption in transit and at rest, access controls, monitoring, and staff
              training. No method of transmission or storage is completely secure; we encourage you
              to use strong credentials and protect your account access.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>11. Your rights</h2>
            <p className={styles.p}>
              Subject to applicable law, you may have the right to:
            </p>
            <ul className={styles.list}>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of data where legally permitted.</li>
              <li>Object to or restrict certain processing activities.</li>
              <li>Withdraw consent where processing is consent-based.</li>
              <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC).</li>
            </ul>
            <p className={styles.p}>
              To exercise your rights, contact us using the details below. We may need to verify your
              identity before responding.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>12. Cookies and tracking</h2>
            <p className={styles.p}>
              We use cookies and similar technologies to keep you signed in, remember preferences,
              measure site performance, and improve the Services. You can control cookies through
              your browser settings, though some features may not function properly if cookies are
              disabled.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>13. Children</h2>
            <p className={styles.p}>
              The Services are not directed at children under 18. We do not knowingly collect personal
              data from minors. If you believe a minor has provided us data, please contact us so we
              can take appropriate action.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>14. Changes to this policy</h2>
            <p className={styles.p}>
              We may update this Privacy Policy from time to time. Material changes will be posted on
              this page with an updated "Last updated" date. Continued use of the Services after
              changes take effect constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>15. Contact</h2>
            <p className={styles.p}>
              For privacy-related questions or requests, contact us at{' '}
              <a className={styles.inlineLink} href="mailto:privacy@nyrawallet.com">
                privacy@nyrawallet.com
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
