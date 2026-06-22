import { SECURITY } from './data'
import styles from '../BusinessLandingSections.module.css'

export default function SecuritySection() {
  return (
    <section className={`${styles.section} ${styles.sectionMuted}`}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle} style={{ fontFamily: 'var(--font-display-var)' }}>
          Data privacy and security you can rely on
        </h2>
        <p className={styles.sectionLead}>
          We take security and compliance seriously — investing in systems that keep you and your money safe.
        </p>
        <div className={styles.securityGrid}>
          {SECURITY.map((item) => (
            <article key={item.title} className={styles.securityCard}>
              <h3 className={styles.securityTitle}>{item.title}</h3>
              <p className={styles.securityBody}>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
