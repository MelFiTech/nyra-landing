import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEGMENTS, type SegmentKey } from './data'
import SegmentVisual from './SegmentVisual'
import styles from '../BusinessLandingSections.module.css'

const SEGMENT_ORDER: SegmentKey[] = ['financial', 'marketplaces', 'smes']

const SEGMENT_LABELS: Record<SegmentKey, string> = {
  financial: 'Financial services',
  marketplaces: 'Marketplaces & on-demand',
  smes: 'SMEs',
}

export default function BusinessSegmentsSection() {
  const navigate = useNavigate()
  const [segment, setSegment] = useState<SegmentKey>('financial')

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle} style={{ fontFamily: 'var(--font-display-var)' }}>
          Global payments for businesses of all sizes
        </h2>
        <p className={styles.sectionLead}>
          Different businesses have different needs. Discover how Nyra can help you grow, no matter your model.
        </p>

        <div className={styles.segmentTabs}>
          {SEGMENT_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className={`${styles.segmentTab} ${segment === key ? styles.segmentTabActive : ''}`}
              onClick={() => setSegment(key)}
            >
              {SEGMENT_LABELS[key]}
            </button>
          ))}
        </div>

        <div className={styles.segmentPanel}>
          <div className={styles.segmentCopyShell}>
            {SEGMENT_ORDER.map((key) => {
              const item = SEGMENTS[key]
              const isActive = segment === key

              return (
                <div
                  key={key}
                  className={`${styles.segmentCopy} ${!isActive ? styles.segmentCopyInactive : ''}`}
                  aria-hidden={!isActive}
                >
                  <h3 className={styles.segmentTitle}>{item.title}</h3>
                  <p className={styles.segmentBody}>{item.body}</p>
                  <div className={styles.tagRow}>
                    {item.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.outlineBtn}
                    onClick={() => navigate('/app/signup')}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {item.cta}
                  </button>
                </div>
              )
            })}
          </div>

          <SegmentVisual segment={segment} />
        </div>
      </div>
    </section>
  )
}
