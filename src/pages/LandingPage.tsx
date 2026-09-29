import LandingShell from '../components/landing/LandingShell'
import AppStoreButtons from '../components/landing/AppStoreButtons'
import PersonalLandingSections from '../components/landing/PersonalLandingSections'
import { usePageMeta } from '../hooks/usePageMeta'

export default function LandingPage() {
  usePageMeta({
    title: 'Nyra | Banking for life together',
    description:
      'Open a joint account with Nyra, save, spend, and track shared finances with full visibility for you and your partner.',
    image: 'og-home.jpg',
    path: '/',
  })

  return (
    <LandingShell
      audience="personal"
      title="Banking for life together"
      titleLines={['Banking for', <>life <em>together</em></>]}
      subtitle="Open a joint account with Nyra, save, spend, and track shared finances with full visibility for you and your partner."
      ctaSlot={<AppStoreButtons />}
      scrollable
      sections={<PersonalLandingSections />}
    />
  )
}
