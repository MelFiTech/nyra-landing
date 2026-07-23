import LandingShell from '../components/landing/LandingShell'
import BusinessLandingSections from '../components/landing/BusinessLandingSections'
import DashboardPreview from '../components/dashboard/DashboardPreview'
import { usePageMeta } from '../hooks/usePageMeta'

export default function BusinessLandingPage() {
  usePageMeta({
    title: 'The Future of Smarter Business Banking — Nyra',
    description:
      'Send, collect, and automate payments with intelligent tools that learn and adapt, so your team can focus on growing the business.',
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
          The Future of{' '}
          <em style={{ fontStyle: 'italic' }}>Smarter</em>{' '}
          <span style={{ whiteSpace: 'nowrap' }}>Business Banking</span>
        </>
      }
      subtitle="Send, collect, and automate payments with intelligent tools that learn and adapt, so your team can focus on growing the business."
      ctaLabel="Open a business account"
      preview={<DashboardPreview />}
    />
  )
}
