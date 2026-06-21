import styles from './NyraLogo.module.css'

type Props = {
  variant?: 'full' | 'icon'
  className?: string
  /** Always render as black (e.g. landing hero on light background) */
  forceBlack?: boolean
}

export default function NyraLogo({ variant = 'full', className, forceBlack }: Props) {
  const src = variant === 'icon' ? '/icon.png' : '/nyra-logo.png'
  const alt = variant === 'icon' ? 'Nyra' : 'Nyra Wallet'

  return (
    <img
      src={src}
      alt={alt}
      className={[
        variant === 'icon' ? styles.icon : styles.logo,
        forceBlack ? styles.forceBlack : null,
        className,
      ].filter(Boolean).join(' ')}
    />
  )
}
