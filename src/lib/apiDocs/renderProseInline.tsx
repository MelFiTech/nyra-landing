import type { ReactNode } from 'react'

export const SUPPORT_EMAIL = 'support@nyrawallet.com'

const PROSE_INLINE_PATTERN = /(https?:\/\/[^\s]+|support@nyrawallet\.com)/g

type ProseInlineStyles = {
  inlineLink: string
  supportEmail: string
}

export function renderProseInline(text: string, styles: ProseInlineStyles): ReactNode[] {
  return text.split(PROSE_INLINE_PATTERN).map((part, index) => {
    if (part === SUPPORT_EMAIL) {
      return (
        <a key={index} href={`mailto:${SUPPORT_EMAIL}`} className={styles.supportEmail}>
          {part}
        </a>
      )
    }
    if (part.match(/^https?:\/\//)) {
      return (
        <a
          key={index}
          href={part}
          className={styles.inlineLink}
          target="_blank"
          rel="noreferrer"
        >
          {part}
        </a>
      )
    }
    return part
  })
}
