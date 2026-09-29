import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NyraLogo from '../ui/NyraLogo'
import { APP_STORE_URL, PLAY_STORE_URL } from './AppStoreButtons'
import styles from './LandingNav.module.css'

/** Personal is app-only (no web dashboard): send people to the right store. */
function appStoreHref() {
  if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)) {
    return PLAY_STORE_URL
  }
  return APP_STORE_URL
}

type NavLink = {
  label: string
  href: string
}

function isInternalHref(href: string) {
  return href.startsWith('/') && !href.startsWith('//')
}

function NavMenuLink({
  link,
  className,
  onNavigate,
}: {
  link: NavLink
  className: string
  onNavigate?: () => void
}) {
  if (isInternalHref(link.href)) {
    return (
      <Link to={link.href} className={className} onClick={onNavigate}>
        {link.label}
      </Link>
    )
  }

  return (
    <a href={link.href} className={className} onClick={onNavigate}>
      {link.label}
    </a>
  )
}

type Audience = 'personal' | 'business'

// The nav adapts to the product the visitor is on: different product links and,
// most importantly, a different primary CTA.
const PRODUCTS_BY_AUDIENCE: Record<Audience, NavLink[]> = {
  personal: [
    { label: 'Joint account', href: '#' },
    { label: 'Cards', href: '#' },
    { label: 'Savings', href: '#' },
    { label: 'Payments', href: '#' },
  ],
  business: [
    { label: 'Accounts', href: '#' },
    { label: 'Payouts', href: '#' },
    { label: 'Identity', href: '#' },
    { label: 'Developer API', href: '/docs?view=guides' },
  ],
}

// Personal has no web dashboard, so its CTA points to the app store (handled at
// click time for device detection); business goes to the dashboard sign-up.
const CTA_BY_AUDIENCE: Record<Audience, { label: string; href?: string }> = {
  personal: { label: 'Get the app' },
  business: { label: 'Start building', href: '/app/signup' },
}

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
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function handleOpen() {
    clearCloseTimer()
    setOpen(true)
  }

  function handleClose() {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpen(false), 160)
  }

  useEffect(() => () => clearCloseTimer(), [])

  return (
    <div
      className={`${styles.navItem} ${open ? styles.navItemOpen : ''}`}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          clearCloseTimer()
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        className={styles.navTrigger}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{label}</span>
        <Chevron open={open} />
      </button>
      <div className={`${styles.dropdown} ${open ? styles.dropdownOpen : ''}`}>
        <div className={styles.dropdownPanel}>
          {links.map((link) => (
            <NavMenuLink
              key={link.label}
              link={link}
              className={styles.dropdownLink}
              onNavigate={() => setOpen(false)}
            />
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
            <NavMenuLink
              key={link.label}
              link={link}
              className={styles.mobileSubLink}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function LandingNav({ audience = 'personal' }: { audience?: Audience }) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [stuck, setStuck] = useState(false)

  const products = PRODUCTS_BY_AUDIENCE[audience]
  const cta = CTA_BY_AUDIENCE[audience]

  function goCta() {
    if (cta.href) navigate(cta.href)
    else window.location.href = appStoreHref()
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Past the hero, the bar condenses into a floating pill; back at the top it
  // returns to the full-width transparent nav.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <header className={`${styles.header} ${stuck ? styles.stuck : ''}`}>
      <div className={styles.navBar}>
        <div className={styles.zoneLeft}>
          <Link to="/" className={styles.logoLink} aria-label="Nyra home">
            <NyraLogo forceBlack />
          </Link>
        </div>

        <nav className={styles.zoneCenter} aria-label="Site">
          <DesktopDropdown label="Products" links={products} />
          <Link to="/company/about" className={styles.navLink}>
            About us
          </Link>
          <Link to="/pricing" className={styles.navLink}>
            Pricing
          </Link>
        </nav>

        <div className={styles.zoneRight}>
          <div className={styles.navActions}>
            {audience !== 'personal' && (
              <button type="button" className={styles.signIn} onClick={() => navigate('/app/login')}>
                Sign in
              </button>
            )}
            <button type="button" className={styles.getStarted} onClick={goCta}>
              {cta.label}
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
              <MobileAccordion label="Products" links={products} onNavigate={closeMobile} />
              <Link to="/company/about" className={styles.mobileLink} onClick={closeMobile}>
                About us
              </Link>
              <Link to="/pricing" className={styles.mobileLink} onClick={closeMobile}>
                Pricing
              </Link>
            </div>

            <div className={styles.mobileDrawerFooter}>
              {audience !== 'personal' && (
                <button type="button" className={styles.mobileSignIn} onClick={() => { closeMobile(); navigate('/app/login') }}>
                  Sign in
                </button>
              )}
              <button type="button" className={styles.mobileGetStarted} onClick={() => { closeMobile(); goCta() }}>
                {cta.label}
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}
