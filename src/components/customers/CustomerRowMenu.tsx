import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import styles from './CustomerRowMenu.module.css'

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.75"/>
    <circle cx="12" cy="12" r="1.75"/>
    <circle cx="12" cy="19" r="1.75"/>
  </svg>
)

type MenuItem = {
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}

type Props = {
  items: MenuItem[]
  ariaLabel?: string
}

export default function CustomerRowMenu({ items, ariaLabel = 'Actions' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={styles.wrap} ref={ref}>
      <Button
        variant="icon"
        iconSm
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <MoreIcon />
      </Button>
      {open && (
        <div className={styles.menu} role="menu">
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={`${styles.menuItem} ${item.danger ? styles.menuItemDanger : ''} ${item.disabled ? styles.menuItemDisabled : ''}`}
              onClick={() => {
                if (item.disabled) return
                item.onClick()
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
