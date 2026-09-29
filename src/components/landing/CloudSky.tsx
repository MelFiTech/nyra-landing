import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import styles from './CloudSky.module.css'

const CLOUD = '/assets/hero-cloud.png'

/**
 * Green-tinted cloud sky behind the hero. Real photographic clouds blended with
 * `mix-blend-mode: soft-light` over a mint sky and pushed further green with a
 * hue filter. The whole layer drifts on scroll via a smoothed (spring) parallax.
 */
export default function CloudSky() {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const raw = useTransform(scrollY, [0, 900], [0, 150])
  const y = useSpring(raw, { stiffness: 55, damping: 22, mass: 0.6 })

  return (
    <div className={styles.sky} aria-hidden>
      <motion.div className={styles.clouds} style={reduced ? undefined : { y }}>
        <img className={`${styles.cloud} ${styles.cloudLeft}`} src={CLOUD} alt="" />
        <img className={`${styles.cloud} ${styles.cloudRight}`} src={CLOUD} alt="" />
        <img className={`${styles.cloud} ${styles.cloudTop}`} src={CLOUD} alt="" />
      </motion.div>
      <div className={styles.horizon} />
    </div>
  )
}
