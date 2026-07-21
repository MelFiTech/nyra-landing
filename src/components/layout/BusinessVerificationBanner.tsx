import { useNavigate } from 'react-router-dom'
import AlertBanner from '../ui/AlertBanner'
import { useBusiness } from '../../context/BusinessContext'

/**
 * Shown when the business is not admin-approved for money movement (KYB).
 */
export default function BusinessVerificationBanner() {
  const navigate = useNavigate()
  const { business, businesses, businessesLoading } = useBusiness()

  if (businessesLoading) return null

  if (!business && businesses.length === 0) {
    return (
      <AlertBanner
        centered
        actionLabel="Add a business"
        onClick={() => navigate('/app/settings')}
      >
        Create your business profile, then complete KYB. Wallet and payouts unlock after admin
        approval.
      </AlertBanner>
    )
  }

  const status = business?.verification_status ?? 'NOT_STARTED'

  if (status === 'VERIFIED') return null

  if (status === 'PENDING') {
    return (
      <AlertBanner centered>
        Your business KYB is under review. You can use the dashboard, but wallet, collections, and
        payouts stay locked until an admin approves your business.
      </AlertBanner>
    )
  }

  if (status === 'REJECTED') {
    return (
      <AlertBanner
        centered
        actionLabel="Review compliance"
        onClick={() => navigate('/app/compliance')}
      >
        Your business KYB was rejected. Update your documents and resubmit for approval before you
        can transact.
      </AlertBanner>
    )
  }

  return (
    <AlertBanner
      centered
      actionLabel="Complete KYB"
      onClick={() => navigate('/app/compliance')}
    >
      Complete business verification (KYB) and get admin approval to unlock your wallet and
      transactions.
    </AlertBanner>
  )
}
