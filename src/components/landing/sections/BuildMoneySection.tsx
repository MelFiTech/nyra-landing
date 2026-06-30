import { useState } from 'react'
import { BUILD_POINTS, PAY_POINTS } from './data'
import CheckIcon from './CheckIcon'
import SalesByDayCard from './SalesByDayCard'
import styles from '../BusinessLandingSections.module.css'

export default function BuildMoneySection() {
  const [buildTab, setBuildTab] = useState<'build' | 'pay'>('build')

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle} style={{ fontFamily: 'var(--font-display-var)' }}>
          Build, get paid, and move money
        </h2>
        <p className={styles.sectionLead}>
          Take your business further with a complete suite of financial products, backed by banking
          relationships, licensing, compliance, core banking, identity management, and payment networks.
        </p>

        <div className={styles.splitBlock}>
          <div className={styles.splitCopy}>
            <div className={styles.tabRow}>
              <button
                type="button"
                className={`${styles.tab} ${buildTab === 'build' ? styles.tabActive : ''}`}
                onClick={() => setBuildTab('build')}
              >
                Build, launch and scale
              </button>
              <button
                type="button"
                className={`${styles.tab} ${buildTab === 'pay' ? styles.tabActive : ''}`}
                onClick={() => setBuildTab('pay')}
              >
                Pay and get paid
              </button>
            </div>
            <div className={styles.bulletListShell}>
              <ul
                className={`${styles.bulletList} ${buildTab !== 'build' ? styles.bulletListInactive : ''}`}
                aria-hidden={buildTab !== 'build'}
              >
                {BUILD_POINTS.map((point) => (
                  <li key={point} className={styles.bulletItem}>
                    <span className={styles.bulletIcon}>
                      <CheckIcon />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <ul
                className={`${styles.bulletList} ${buildTab !== 'pay' ? styles.bulletListInactive : ''}`}
                aria-hidden={buildTab !== 'pay'}
              >
                {PAY_POINTS.map((point) => (
                  <li key={point} className={styles.bulletItem}>
                    <span className={styles.bulletIcon}>
                      <CheckIcon />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.visualPanelDark} aria-hidden>
            <SalesByDayCard />
          </div>
        </div>
      </div>
    </section>
  )
}
