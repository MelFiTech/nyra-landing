import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export type StatConfig = {
  target: number
  prefix?: string
  suffix?: string
  decimals?: number
  label: string
}

type Props = {
  stat: StatConfig
  index?: number
  className?: string
  valueClassName?: string
  labelClassName?: string
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function formatValue(value: number, decimals: number) {
  if (decimals > 0) return value.toFixed(decimals)
  return Math.round(value).toLocaleString('en-US')
}

export default function AnimatedStatValue({
  stat,
  index = 0,
  className,
  valueClassName,
  labelClassName,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const [display, setDisplay] = useState(0)
  const decimals = stat.decimals ?? 0

  useEffect(() => {
    if (!isInView) return

    const duration = 2000
    const delay = index * 120
    let frame = 0
    let startTime: number | null = null

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime - delay
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick)
        return
      }

      const progress = Math.min(elapsed / duration, 1)
      setDisplay(stat.target * easeOutCubic(progress))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setDisplay(stat.target)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isInView, stat.target, index])

  const valueText = `${stat.prefix ?? ''}${formatValue(display, decimals)}${stat.suffix ?? ''}`

  return (
    <div ref={ref} className={className}>
      <div className={valueClassName}>{valueText}</div>
      <div className={labelClassName}>{stat.label}</div>
    </div>
  )
}
