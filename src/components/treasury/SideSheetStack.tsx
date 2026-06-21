import { useEffect, useState, type ReactNode } from 'react'
import Button from '../ui/Button'
import styles from './SideSheetStack.module.css'

export type SheetLayer = {
  key: string
  title: string
  showBack?: boolean
  onBack?: () => void
  children: ReactNode
}

type Props = {
  open: boolean
  onClose: () => void
  layers: SheetLayer[]
}

const TRANSITION_MS = 340

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

export default function SideSheetStack({ open, onClose, layers }: Props) {
  const [exitingKey, setExitingKey] = useState<string | null>(null)
  const [returning, setReturning] = useState(false)
  const [playRootEnter, setPlayRootEnter] = useState(false)

  useEffect(() => {
    if (open) {
      setPlayRootEnter(true)
      const t = window.setTimeout(() => setPlayRootEnter(false), TRANSITION_MS)
      return () => clearTimeout(t)
    }
    setExitingKey(null)
    setReturning(false)
    setPlayRootEnter(false)
  }, [open])

  function handleBack(layer: SheetLayer) {
    if (!layer.onBack || exitingKey) return
    setExitingKey(layer.key)
    setReturning(true)
    window.setTimeout(() => {
      layer.onBack!()
      setExitingKey(null)
      setReturning(false)
    }, TRANSITION_MS)
  }

  if (!open || layers.length === 0) return null

  const visibleLayers = layers.length > 2 ? layers.slice(-2) : layers
  const hasChild = visibleLayers.length > 1

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.stack} onClick={e => e.stopPropagation()}>
        {visibleLayers.map((layer, index) => {
          const isBack = index < visibleLayers.length - 1
          const isFront = index === visibleLayers.length - 1
          const isExiting = exitingKey === layer.key
          const isPushed = isBack && !returning

          const sheetClass = [
            styles.sheet,
            isPushed ? styles.sheetPushed : styles.sheetActive,
            isFront && isExiting ? styles.sheetExiting : '',
            isFront && hasChild && !isExiting && !returning ? styles.sheetEntering : '',
            playRootEnter && !hasChild && isFront ? styles.sheetRootEnter : '',
          ].filter(Boolean).join(' ')

          return (
            <div key={layer.key} className={sheetClass}>
              <div className={styles.header}>
                {layer.showBack && isFront && !isExiting && (
                  <Button variant="icon" onClick={() => handleBack(layer)}>
                    <BackIcon />
                  </Button>
                )}
                <span className={styles.title}>{layer.title}</span>
                {isFront && (
                  <Button variant="icon" onClick={onClose}>
                    <CloseIcon />
                  </Button>
                )}
              </div>
              <div className={styles.body}>{layer.children}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
