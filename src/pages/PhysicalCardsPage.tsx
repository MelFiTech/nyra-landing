import EmptyState, { CardEmptyIcon } from '../components/ui/EmptyState'
import styles from './CardsPage.module.css'

export default function PhysicalCardsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Physical card</h1>
      </div>

      <div className={styles.tableWrap}>
        <EmptyState
          icon={<CardEmptyIcon />}
          title="Physical cards"
          description="Issue NGN physical cards attached to customer wallets. Cardholders spend directly from their wallet balance."
        />
      </div>
    </div>
  )
}
