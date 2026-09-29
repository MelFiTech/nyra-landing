import LandingShell from '../components/landing/LandingShell'
import BusinessLandingSections from '../components/landing/BusinessLandingSections'
import DashboardPreview from '../components/dashboard/DashboardPreview'
import { usePageMeta } from '../hooks/usePageMeta'

export default function BusinessLandingPage() {
  usePageMeta({
    title: 'Financial infrastructure for builders | Nyra',
    description:
      'The payments, payouts, and accounts your product needs, in one platform. Build money into your software with Nyra.',
    image: 'og-business.jpg',
    path: '/business',
  })

  return (
    <LandingShell
      audience="business"
      scrollable
      sections={<BusinessLandingSections />}
      badge="Now with instant settlements"
      title={
        <>
          <span style={{ whiteSpace: 'nowrap' }}>Financial Infrastructure</span>
          <span style={{ display: 'block', textAlign: 'center' }}>
            <em style={{ fontStyle: 'italic' }}>for builders</em>
          </span>
        </>
      }
      subtitle="The payments, payouts, and accounts your product needs, in one platform."
      ctaLabel="Start building"
      preview={<DashboardPreview />}
    />
  )
}
