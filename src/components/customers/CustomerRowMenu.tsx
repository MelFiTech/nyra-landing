import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

type MenuCoords = {
  top: number
  left: number
  minWidth: number
}

const MENU_MIN_WIDTH = 168
const MENU_EST_ITEM_HEIGHT = 40
const MENU_PAD = 8

export default function CustomerRowMenu({ items, ariaLabel = 'Actions' }: Props) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<MenuCoords | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  function placeMenu() {
    const trigger = wrapRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const estimatedHeight = MENU_PAD * 2 + items.length * MENU_EST_ITEM_HEIGHT
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight

    let left = rect.right - MENU_MIN_WIDTH
    left = Math.max(8, Math.min(left, viewportW - MENU_MIN_WIDTH - 8))

    let top = rect.bottom + 6
    if (top + estimatedHeight > viewportH - 8) {
      top = Math.max(8, rect.top - estimatedHeight - 6)
    }

    setCoords({ top, left, minWidth: MENU_MIN_WIDTH })
  }

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null)
      return
    }
    placeMenu()
  }, [open, items.length])

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (wrapRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    function onReposition() {
      placeMenu()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open, items.length])

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <Button
        variant="icon"
        iconSm
        type="button"
        className={styles.trigger}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <MoreIcon />
      </Button>
      {open && coords && createPortal(
        <div
          ref={menuRef}
          className={styles.menu}
          role="menu"
          style={{
            top: coords.top,
            left: coords.left,
            minWidth: coords.minWidth,
          }}
        >
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
        </div>,
        document.body,
      )}
    </div>
  )
}
