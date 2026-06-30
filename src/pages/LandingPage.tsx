import LandingShell from '../components/landing/LandingShell'
import AppStoreButtons from '../components/landing/AppStoreButtons'
import PersonalPreview from '../components/landing/PersonalPreview'

export default function LandingPage() {
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
