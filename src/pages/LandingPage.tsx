import LandingShell from '../components/landing/LandingShell'
import AppStoreButtons from '../components/landing/AppStoreButtons'
import PersonalPreview from '../components/landing/PersonalPreview'
import { usePageMeta } from '../hooks/usePageMeta'

export default function LandingPage() {
  usePageMeta({
    title: 'Nyra — Banking for life together',
    description:
      'Open a joint account with Nyra, save, spend, and track shared finances with full visibility for you and your partner.',
    image: 'og-home.jpg',
    path: '/',
  })

  return (
    <LandingShell
      audience="personal"
      badge="Joint accounts, made simple"
      title={
        <>
          Banking for
          <br />
          life <em style={{ fontStyle: 'italic' }}>together</em>
        </>
      }
      subtitle="Open a joint account with Nyra, save, spend, and track shared finances with full visibility for you and your partner."
      ctaSlot={<AppStoreButtons />}
      previewVariant="phone"
      preview={<PersonalPreview />}
    />
  )
}
