import styles from './MethodBadge.module.css'

type Props = {
  method: string
}

export default function MethodBadge({ method }: Props) {
  const variant =
    method === 'GET'
      ? styles.get
      : method === 'POST'
        ? styles.post
        : method === 'DELETE'
          ? styles.delete
          : styles.patch

  return <span className={`${styles.badge} ${variant}`}>{method}</span>
}
