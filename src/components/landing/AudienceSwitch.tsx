import { useNavigate } from 'react-router-dom'
import styles from './AudienceSwitch.module.css'

type Audience = 'personal' | 'business'

type Props = {
  active: Audience
}

export default function AudienceSwitch({ active }: Props) {
  const navigate = useNavigate()

  return (
    <div className={styles.switch} role="tablist" aria-label="Nyra audience">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'personal'}
        className={active === 'personal' ? styles.tabActive : styles.tab}
        onClick={() => navigate('/')}
      >
        Personal
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'business'}
        className={active === 'business' ? styles.tabActive : styles.tab}
        onClick={() => navigate('/business')}
      >
        Business
      </button>
    </div>
  )
}
