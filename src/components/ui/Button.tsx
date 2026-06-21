import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant =
  | 'primary'
  | 'inverted'
  | 'secondary'
  | 'outline'
  | 'filter'
  | 'warning'
  | 'ghost'
  | 'text'
  | 'danger'
  | 'segment'
  | 'icon'
  | 'nav'

export type ButtonSize = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  active?: boolean
  iconSm?: boolean
  children?: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  active = false,
  iconSm = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: Props) {
  const activeClass =
    (variant === 'segment' || variant === 'filter') && active
      ? variant === 'segment'
        ? styles.segmentActive
        : styles.filterActive
      : ''

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        styles.btn,
        styles[variant],
        variant !== 'segment' && variant !== 'ghost' && variant !== 'text' && variant !== 'icon' && variant !== 'nav'
          ? styles[`size_${size}`]
          : '',
        variant === 'icon' && iconSm ? styles.iconSm : '',
        fullWidth ? styles.fullWidth : '',
        activeClass,
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : children}
    </button>
  )
}
