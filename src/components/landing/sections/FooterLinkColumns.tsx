import { useNavigate } from 'react-router-dom'
import { FOOTER_COLUMNS, FOOTER_LINKS } from './footerLinks'
import styles from './FooterLinkColumns.module.css'

export default function FooterLinkColumns() {
  const navigate = useNavigate()

  function handleClick(href: string) {
    if (href.startsWith('/')) {
      navigate(href)
    }
  }

  return (
    <div className={styles.columns}>
      {FOOTER_COLUMNS.map((column) => (
        <div key={column.key}>
          <h3 className={styles.columnTitle}>{column.title}</h3>
          <ul className={styles.linkList}>
            {FOOTER_LINKS[column.key].map((item) => (
              <li key={item.label}>
                {item.href.startsWith('/') ? (
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => handleClick(item.href)}
                  >
                    {item.label}
                  </button>
                ) : (
                  <a href={item.href} className={styles.link}>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
