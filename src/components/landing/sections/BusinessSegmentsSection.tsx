import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEGMENTS, type SegmentKey } from './data'
import styles from '../BusinessLandingSections.module.css'

export default function BusinessSegmentsSection() {
  const navigate = useNavigate()
  const [segment, setSegment] = useState<SegmentKey>('financial')
  const activeSegment = SEGMENTS[segment]

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle} style={{ fontFamily: 'var(--font-display-var)' }}>
          Global payments for businesses of all sizes
        </h2>
        <p className={styles.sectionLead}>
          Different businesses have different needs. Discover how Nyra can help you grow — no matter your model.
        </p>

        <div className={styles.segmentTabs}>
          {(Object.keys(SEGMENTS) as SegmentKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`${styles.segmentTab} ${segment === key ? styles.segmentTabActive : ''}`}
              onClick={() => setSegment(key)}
            >
              {key === 'financial' && 'Financial services'}
              {key === 'marketplaces' && 'Marketplaces & on-demand'}
              {key === 'smes' && 'SMEs'}
            </button>
          ))}
        </div>

        <div className={styles.segmentPanel}>
          <div className={styles.segmentCopy}>
            <h3 className={styles.segmentTitle}>{activeSegment.title}</h3>
            <p className={styles.segmentBody}>{activeSegment.body}</p>
            <div className={styles.tagRow}>
              {activeSegment.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
            <button type="button" className={styles.outlineBtn} onClick={() => navigate('/app/signup')}>
              {activeSegment.cta}
            </button>
          </div>
          <div className={styles.segmentVisual} aria-hidden />
        </div>
      </div>
    </section>
  )
}
