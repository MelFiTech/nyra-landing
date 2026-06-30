import { useEffect, useState } from 'react'
import styles from './SalesByDayCard.module.css'

/** Currency cycles to convey multi-currency support (NGN → USD → EUR). */
const CURRENCIES = [
  { symbol: '₦', amount: '2,350,400' },
  { symbol: '$', amount: '1,587' },
  { symbol: '€', amount: '1,432' },
] as const

// relative bar heights (%), the "Sales by Day" distribution
const BARS = [42, 30, 55, 78, 62, 88, 48, 34, 70, 90, 64, 50]

export default function SalesByDayCard() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % CURRENCIES.length)
    }, 2400)
    return () => window.clearInterval(id)
  }, [])

  const current = CURRENCIES[index]

  return (
    <div className={styles.stage} aria-hidden>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.amount}>
          <span key={`sym-${index}`} className={styles.symbol}>{current.symbol}</span>
          <span key={`amt-${index}`} className={styles.value}>{current.amount}</span>
        </div>

        <div className={styles.chart}>
          {BARS.map((h, i) => (
            <span
              key={i}
              className={styles.bar}
              style={{
                // CSS vars drive the keyframe so each bar animates around its own height
                ['--h' as string]: `${h}%`,
                ['--delay' as string]: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>

        <span className={styles.label}>Sales by Day</span>
      </div>
    </div>
  )
}
