import styles from './Skeletons.module.css'

export function TableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className={styles.tableRows} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.tableRow} />
      ))}
    </div>
  )
}

export function BlockSkeleton({
  height = 120,
  className,
}: {
  height?: number | string
  className?: string
}) {
  return (
    <div
      className={`${styles.block} ${className ?? ''}`}
      style={{ height }}
      aria-hidden
    />
  )
}
