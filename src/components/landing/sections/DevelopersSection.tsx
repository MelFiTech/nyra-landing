import { useNavigate } from 'react-router-dom'
import AnimatedCodeEditor from '../AnimatedCodeEditor'
import { DEV_CARDS } from './data'
import styles from '../BusinessLandingSections.module.css'

export default function DevelopersSection() {
  const navigate = useNavigate()

  return (
    <section className={`${styles.section} ${styles.sectionDev}`}>
      <div className={styles.container}>
        <div className={styles.devSplit}>
          <div className={styles.devCopy}>
            <p className={styles.devEyebrow}>For developers</p>
            <h2 className={styles.devTitle} style={{ fontFamily: 'var(--font-display-var)' }}>
              One API to help you build and launch faster
            </h2>
            <p className={styles.devLead}>
              Save time and remove engineering complexity so you can go to market quickly — with fewer revisions and
              less stress.
            </p>
            <div className={styles.devFeatures}>
              {DEV_CARDS.map((card) => (
                <article key={card.title} className={styles.devFeature}>
                  <h3 className={styles.devFeatureTitle}>{card.title}</h3>
                  <p className={styles.devFeatureBody}>{card.body}</p>
                  <button type="button" className={styles.textLink} onClick={() => navigate('/app/signup')}>
                    {card.link} →
                  </button>
                </article>
              ))}
            </div>
          </div>

          <AnimatedCodeEditor />
        </div>
      </div>
    </section>
  )
}
