import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ease, lineWipe, rise } from '../../../lib/motion'
import styles from './LandingCtaSection.module.css'

export default function LandingCtaSection() {
  const navigate = useNavigate()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-5%', '6%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16])

  return (
    <section className={styles.shell} ref={ref} aria-label="Get started with Nyra">
      <motion.img
        className={styles.bg}
        src="/assets/biz-cta-bg.png"
        alt=""
        aria-hidden
        style={{ y: bgY, scale: bgScale }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.4, ease }}
      />
      <div className={styles.grain} aria-hidden />
      <div className={styles.vignette} aria-hidden />

      <div className={styles.inner}>
        <motion.h2
          className={styles.title}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          <span className={styles.titleLine}>
            <motion.span style={{ display: 'block' }} variants={lineWipe}>
              Ready to grow
            </motion.span>
          </span>
          <span className={styles.titleLine}>
            <motion.span style={{ display: 'block' }} variants={lineWipe}>
              <em>with Nyra?</em>
            </motion.span>
          </span>
        </motion.h2>

        <motion.p
          className={styles.lead}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={rise}
        >
          Collect payments, automate payouts, and move money at scale. Start building in minutes.
        </motion.p>

        <motion.div
          className={styles.actions}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={rise}
        >
          <button type="button" className={styles.ctaBtn} onClick={() => navigate('/app/signup')}>
            Start building
          </button>
        </motion.div>
      </div>
    </section>
  )
}
