import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BackgroundVideo from '../landing/BackgroundVideo'
import {
  AUTH_PANEL_EYEBROW,
  AUTH_TESTIMONIALS,
  type AuthTestimonial,
} from '../../lib/authTestimonials'
import styles from './AuthVisualPanel.module.css'

const ease = [0.22, 1, 0.36, 1] as const
const ROTATE_MS = 6500

type AuthVisualPanelProps = {
  variant?: 'login' | 'signup'
}

function TestimonialSlide({ testimonial }: { testimonial: AuthTestimonial }) {
  return (
    <>
      <p className={styles.quote}>&ldquo;{testimonial.quote}&rdquo;</p>
      <footer className={styles.author}>
        <span className={styles.name}>{testimonial.name}</span>
        <span className={styles.meta}>
          {testimonial.role} · {testimonial.company}
        </span>
      </footer>
    </>
  )
}

export default function AuthVisualPanel({ variant = 'login' }: AuthVisualPanelProps) {
  const [index, setIndex] = useState(0)
  const [slideHeight, setSlideHeight] = useState<number | null>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const eyebrow = AUTH_PANEL_EYEBROW[variant]
  const testimonial = AUTH_TESTIMONIALS[index]

  useLayoutEffect(() => {
    const measure = () => {
      const root = measureRef.current
      if (!root) return

      const slides = root.querySelectorAll<HTMLElement>(`[data-slide]`)
      let maxHeight = 0
      slides.forEach(slide => {
        maxHeight = Math.max(maxHeight, slide.offsetHeight)
      })

      if (maxHeight > 0) setSlideHeight(maxHeight)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [variant])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex(current => (current + 1) % AUTH_TESTIMONIALS.length)
    }, ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className={styles.visual}>
      <BackgroundVideo />
      <div className={styles.overlay} aria-hidden />

      <div className={styles.visualInner}>
        <motion.div
          className={styles.glass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
        >
          <p className={styles.eyebrow}>{eyebrow}</p>

          <div ref={measureRef} className={styles.measure} aria-hidden>
            {AUTH_TESTIMONIALS.map(item => (
              <blockquote key={item.name} className={styles.testimonial} data-slide>
                <TestimonialSlide testimonial={item} />
              </blockquote>
            ))}
          </div>

          <div
            className={`${styles.testimonialWrap} ${slideHeight ? styles.testimonialWrapReady : ''}`}
            style={slideHeight ? { height: slideHeight } : undefined}
            aria-live="polite"
          >
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={index}
                className={styles.testimonial}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease }}
              >
                <TestimonialSlide testimonial={testimonial} />
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className={styles.dots} aria-hidden>
            {AUTH_TESTIMONIALS.map((_, i) => (
              <span key={i} className={i === index ? styles.dotActive : styles.dot} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
