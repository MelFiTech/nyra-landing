import { useLocation, useNavigate } from 'react-router-dom'
import styles from './AuthGoBack.module.css'

export default function AuthGoBack() {
  const navigate = useNavigate()
  const location = useLocation()

  function handleGoBack() {
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
