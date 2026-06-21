import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NyraLogo from '../ui/NyraLogo'
import styles from './LandingNav.module.css'

type NavLink = {
  label: string
  href: string
}

const PRODUCTS_LINKS: NavLink[] = [
  { label: 'Joint account', href: '#' },
  { label: 'Cards', href: '#' },
  { label: 'Accounts', href: '#' },
  { label: 'Identity', href: '#' },
]

const LEARN_LINKS: NavLink[] = [
  { label: 'Blog', href: '#' },
  { label: 'Developer docs', href: '#' },
  { label: 'Why Nyra', href: '#' },
]

const ABOUT_HREF = '#'

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

type DropdownProps = {
  label: string
  links: NavLink[]
  onNavigate?: () => void
}

function DesktopDropdown({ label, links }: DropdownProps) {
  return (
    <div className={styles.navItem}>
      <button type="button" className={styles.navTrigger} aria-haspopup="true">
        <span>{label}</span>
        <Chevron />
      </button>
      <div className={styles.dropdown}>
        <div className={styles.dropdownPanel}>
          {links.map(link => (
            <a key={link.label} href={link.href} className={styles.dropdownLink}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileAccordion({ label, links, onNavigate }: DropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.mobileGroup}>
      <button
        type="button"
        className={styles.mobileGroupTrigger}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span>{label}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className={styles.mobileSubmenu}>
          {links.map(link => (
            <a
              key={link.label}
              href={link.href}
              className={styles.mobileSubLink}
              onClick={onNavigate}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LandingNav() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.navBar}>
        <div className={styles.zoneLeft}>
          <NyraLogo forceBlack />
        </div>

        <nav className={styles.zoneCenter} aria-label="Site">
          <DesktopDropdown label="Products" links={PRODUCTS_LINKS} />
          <a href={ABOUT_HREF} className={styles.navLink}>
            About us
          </a>
          <DesktopDropdown label="Learn" links={LEARN_LINKS} />
        </nav>

        <div className={styles.zoneRight}>
          <div className={styles.navActions}>
            <button type="button" className={styles.signIn} onClick={() => navigate('/app/login')}>
              Sign in
            </button>
            <button type="button" className={styles.getStarted} onClick={() => navigate('/app/signup')}>
              Get started
            </button>
          </div>

          <button
            type="button"
            className={styles.menuBtn}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={styles.mobileRoot}>
          <button
            type="button"
            className={styles.mobileBackdrop}
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <aside className={styles.mobileDrawer} aria-label="Mobile menu">
            <div className={styles.mobileDrawerHeader}>
              <span className={styles.mobileDrawerTitle}>Menu</span>
              <button type="button" className={styles.mobileCloseBtn} onClick={closeMobile} aria-label="Close menu">
                <CloseIcon />
              </button>
            </div>

            <div className={styles.mobileDrawerBody}>
              <MobileAccordion label="Products" links={PRODUCTS_LINKS} onNavigate={closeMobile} />
              <a href={ABOUT_HREF} className={styles.mobileLink} onClick={closeMobile}>
                About us
              </a>
              <MobileAccordion label="Learn" links={LEARN_LINKS} onNavigate={closeMobile} />
            </div>

            <div className={styles.mobileDrawerFooter}>
              <button type="button" className={styles.mobileSignIn} onClick={() => { closeMobile(); navigate('/app/login') }}>
                Sign in
              </button>
              <button type="button" className={styles.mobileGetStarted} onClick={() => { closeMobile(); navigate('/app/signup') }}>
                Get started
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}
