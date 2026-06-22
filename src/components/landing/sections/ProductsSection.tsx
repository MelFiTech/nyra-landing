import styles from './ProductsSection.module.css'

const NETWORK_IMG =
  'https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/viktor/network.svg'
const FOLDER_IMG =
  'https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/viktor/library%20icon.svg'

function CursorArrow() {
  return (
    <svg className={styles.cursorArrow} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 2L20 11L11 13L9 22L4 2Z"
        fill="#0f172a"
        stroke="#fff"
        strokeWidth="1"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="8" stroke="#64748b" strokeWidth="2" />
      <path
        d="M21 21L16.65 16.65"
        stroke="#64748b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ProductsSection() {
  return (
    <section className={styles.shell}>
      <div className={styles.container}>
        <p className={styles.badge}>Payment Solutions</p>
        <h2 className={styles.title}>Built for speed &amp; scale</h2>
        <p className={styles.subtitle}>
          Everything you need to go
          <br />
          from collections to payouts
        </p>

        <div className={styles.grid}>
          <article className={`${styles.card} ${styles.card1}`}>
            <div className={styles.promptBox}>
              Assign a <span className={styles.blurText}>dedicated virtual account</span> to every{' '}
              <span className={styles.blurText}>customer</span> and{' '}
              <span className={styles.blurText}>accept bank transfers</span> instantly in{' '}
              <span className={styles.blurText}>NGN</span>
            </div>
            <div className={styles.detailPill}>
              <span className={styles.detailPillIcon} aria-hidden>
                ✦
              </span>
              Generate account
            </div>
            <CursorArrow />
            <h3>Accounts</h3>
          </article>

          <article className={`${styles.card} ${styles.card2}`}>
            <div className={styles.apiVisual}>
              <img className={styles.networkImg} src={NETWORK_IMG} alt="" />
            </div>
            <h3>Payout</h3>
          </article>

          <article className={`${styles.card} ${styles.card3}`}>
            <div className={styles.mesh} aria-hidden />
            <img className={styles.folderImg} src={FOLDER_IMG} alt="" />
            <div className={styles.searchPill}>
              <SearchIcon />
              Verify customer identity
            </div>
            <h3>Identity</h3>
          </article>
        </div>
      </div>
    </section>
  )
}
