import { useLocation, useNavigate } from 'react-router-dom'
import styles from './AuthGoBack.module.css'

type AuthGoBackProps = {
  onGoBack?: () => void
}

export default function AuthGoBack({ onGoBack }: AuthGoBackProps) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleGoBack() {
    if (onGoBack) {
      onGoBack()
      return
    }
    if (location.key !== 'default') {
      navigate(-1)
      return
    }
    navigate('/')
  }

  return (
    <button type="button" className={styles.goBack} onClick={handleGoBack}>
      Go back
    </button>
  )
}
