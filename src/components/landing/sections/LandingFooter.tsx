import { InstagramIcon, LinkedinIcon, TwitterIcon } from './SocialIcons'
import FooterLinkColumns from './FooterLinkColumns'
import styles from './LandingFooter.module.css'

export default function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.shell}>
      <div className={styles.inner}>
        <FooterLinkColumns />

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>© {year} Nyra. All rights reserved.</p>
          <div className={styles.socialRow}>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <TwitterIcon />
            </a>
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">
              <LinkedinIcon />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
