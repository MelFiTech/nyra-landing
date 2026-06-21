import { useEffect, useRef, type ReactNode } from 'react'
import Button from './Button'
import styles from './FilterMenu.module.css'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: () => void
  onClear: () => void
  trigger: ReactNode
  children: ReactNode
  canClear?: boolean
}

export default function FilterMenu({
  open,
  onOpenChange,
  onApply,
  onClear,
  trigger,
  children,
  canClear = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onOpenChange])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  return (
    <div className={styles.wrap} ref={ref}>
      {trigger}
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Filters">
          <div className={styles.header}>
            <span className={styles.title}>Filters</span>
            {canClear && (
              <button type="button" className={styles.clearBtn} onClick={onClear}>
                Clear all
              </button>
            )}
          </div>
          <div className={styles.body}>{children}</div>
          <div className={styles.footer}>
            <Button
              variant="outline"
              size="sm"
              className={styles.footerBtn}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className={styles.footerBtn}
              onClick={() => {
                onApply()
                onOpenChange(false)
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function FilterSection({
  title,
  children,
  stacked = true,
}: {
  title: string
  children: ReactNode
  stacked?: boolean
}) {
  return (
    <div className={styles.section}>
      <span className={styles.sectionTitle}>{title}</span>
      {stacked ? <div className={styles.options}>{children}</div> : children}
    </div>
  )
}

export function FilterCheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className={styles.option}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <span className={styles.optionLabel}>{label}</span>
    </label>
  )
}

export function FilterRadioOption({
  label,
  name,
  checked,
  onChange,
}: {
  label: string
  name: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className={styles.option}>
      <input
        type="radio"
        name={name}
        className={styles.radio}
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.optionLabel}>{label}</span>
    </label>
  )
}

export function FilterDateFields({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: {
  startDate: string
  endDate: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
}) {
  return (
    <div className={styles.dateRow}>
      <div className={styles.dateField}>
        <span className={styles.dateLabel}>From</span>
        <input
          type="date"
          className={styles.dateInput}
          value={startDate}
          onChange={e => onStartChange(e.target.value)}
        />
      </div>
      <div className={styles.dateField}>
        <span className={styles.dateLabel}>To</span>
        <input
          type="date"
          className={styles.dateInput}
          value={endDate}
          onChange={e => onEndChange(e.target.value)}
        />
      </div>
    </div>
  )
}
