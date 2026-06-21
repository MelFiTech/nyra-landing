import { BRAND } from '../../lib/brand'

type Props = {
  data: number[]
  trend: 'up' | 'down'
  width?: number
  height?: number
}

function buildPaths(data: number[], width: number, height: number) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padY = 2
  const innerH = height - padY * 2
  const step = data.length > 1 ? width / (data.length - 1) : 0

  const points = data.map((value, i) => ({
    x: i * step,
    y: padY + innerH - ((value - min) / range) * innerH,
  }))

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const area = `${line} L ${width} ${height} L 0 ${height} Z`

  return { line, area }
}

export default function TrendSparkline({ data, trend, width = 72, height = 32 }: Props) {
  const { line, area } = buildPaths(data, width, height)
  const stroke = trend === 'up' ? BRAND : '#ef4444'
  const fill = trend === 'up' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(239, 68, 68, 0.12)'

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden
    >
      <path d={area} fill={fill} />
      <path d={line} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
