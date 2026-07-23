import CopySnippetButton from './CopySnippetButton'
import styles from './DocCodeBlock.module.css'

type Props = {
  text: string
  preClassName: string
  copyLabel?: string
}

export default function DocCodeBlock({ text, preClassName, copyLabel = 'Copy' }: Props) {
  return (
    <div className={styles.wrap}>
      <CopySnippetButton text={text} label={copyLabel} className={styles.copyBtn} />
      <pre className={preClassName}>{text}</pre>
    </div>
  )
}
