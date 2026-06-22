import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import styles from './BusinessLandingSections.module.css'

type Tone = 'kw' | 'fn' | 'str' | 'num'
type Token = { text: string; tone?: Tone }

const CHAR_DELAY_MS = 16
const LINE_PAUSE_MS = 70

const TRANSFER_SNIPPET: Token[][] = [
  [
    { text: 'const', tone: 'kw' },
    { text: ' response = ' },
    { text: 'await', tone: 'kw' },
    { text: ' ' },
    { text: 'fetch', tone: 'fn' },
    { text: '(' },
  ],
  [{ text: "  'https://api.nyra.africa/v1/transfers'", tone: 'str' }, { text: ',' }],
  [{ text: '  {' }],
  [{ text: "    method: 'POST'", tone: 'str' }, { text: ',' }],
  [{ text: '    headers: {' }],
  [
    { text: '      Authorization: ' },
    { text: '`Bearer ${process.env.NYRA_SECRET_KEY}`', tone: 'str' },
    { text: ',' },
  ],
  [{ text: "      'Content-Type': 'application/json'", tone: 'str' }, { text: ',' }],
  [{ text: '    },' }],
  [{ text: '    body: ' }, { text: 'JSON.stringify', tone: 'fn' }, { text: '({' }],
  [{ text: '      amount: ' }, { text: '5000000', tone: 'num' }, { text: ',' }],
  [{ text: "      currency: 'NGN'", tone: 'str' }, { text: ',' }],
  [{ text: "      account_number: '0123456789'", tone: 'str' }, { text: ',' }],
  [{ text: "      bank_code: '058'", tone: 'str' }, { text: ',' }],
  [{ text: "      narration: 'Vendor payout'", tone: 'str' }, { text: ',' }],
  [{ text: '    }),' }],
  [{ text: '  }' }],
  [{ text: ');' }],
  [{ text: '' }],
  [
    { text: 'const', tone: 'kw' },
    { text: ' { data } = ' },
    { text: 'await', tone: 'kw' },
    { text: ' response.' },
    { text: 'json', tone: 'fn' },
    { text: '();' },
  ],
  [
    { text: 'console.' },
    { text: 'log', tone: 'fn' },
    { text: '(data.reference);' },
  ],
]

function lineText(tokens: Token[]) {
  return tokens.map((token) => token.text).join('')
}

function toneClass(tone?: Tone) {
  if (tone === 'kw') return styles.codeKw
  if (tone === 'fn') return styles.codeFn
  if (tone === 'str') return styles.codeStr
  if (tone === 'num') return styles.codeNum
  return undefined
}

function HighlightedLine({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((token, index) => (
        <span key={index} className={toneClass(token.tone)}>
          {token.text}
        </span>
      ))}
    </>
  )
}

export default function AnimatedCodeEditor() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDone, setIsDone] = useState(false)

  const currentLine = TRANSFER_SNIPPET[lineIndex]
  const currentText = currentLine ? lineText(currentLine) : ''

  useEffect(() => {
    if (!isInView || isDone) return

    if (lineIndex >= TRANSFER_SNIPPET.length) {
      setIsDone(true)
      return
    }

    const delay = charIndex === 0 && lineIndex > 0 ? LINE_PAUSE_MS : CHAR_DELAY_MS

    const timer = window.setTimeout(() => {
      if (charIndex < currentText.length) {
        setCharIndex((value) => value + 1)
        return
      }

      if (lineIndex < TRANSFER_SNIPPET.length - 1) {
        setLineIndex((value) => value + 1)
        setCharIndex(0)
        return
      }

      setIsDone(true)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [isInView, isDone, lineIndex, charIndex, currentText.length])

  return (
    <div ref={ref} className={styles.codeEditor} aria-label="Example Nyra API integration">
      <div className={styles.codeChrome}>
        <div className={styles.codeDots} aria-hidden>
          <span className={styles.codeDotRed} />
          <span className={styles.codeDotYellow} />
          <span className={styles.codeDotGreen} />
        </div>
        <span className={styles.codeFile}>create-transfer.ts</span>
      </div>
      <pre className={styles.codePre}>
        <code>
          {TRANSFER_SNIPPET.map((tokens, index) => {
            const text = lineText(tokens)
            const isComplete =
              index < lineIndex || (index === lineIndex && charIndex >= text.length)
            const isActive = index === lineIndex && !isDone
            const isLastLine = index === TRANSFER_SNIPPET.length - 1

            if (!isComplete && !isActive) return null

            return (
              <span key={index} className={styles.codeLine}>
                {isComplete ? (
                  <HighlightedLine tokens={tokens} />
                ) : (
                  <span className={styles.codeTyping}>{text.slice(0, charIndex)}</span>
                )}
                {((isActive && charIndex < text.length) || (isDone && isLastLine)) && (
                  <span className={styles.codeCursor} aria-hidden />
                )}
              </span>
            )
          })}
        </code>
      </pre>
    </div>
  )
}
