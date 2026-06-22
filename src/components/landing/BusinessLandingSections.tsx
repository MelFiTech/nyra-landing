import styles from './BusinessLandingSections.module.css'
import BuildMoneySection from './sections/BuildMoneySection'
import BusinessSegmentsSection from './sections/BusinessSegmentsSection'
import DevelopersSection from './sections/DevelopersSection'
import LandingCtaSection from './sections/LandingCtaSection'
import LandingFooter from './sections/LandingFooter'
import ProductsSection from './sections/ProductsSection'
import ScaleStatsSection from './sections/ScaleStatsSection'
import SecuritySection from './sections/SecuritySection'

export default function BusinessLandingSections() {
  return (
    <div className={styles.root}>
      <BuildMoneySection />
      <ProductsSection />
      <BusinessSegmentsSection />
      <ScaleStatsSection />
      <DevelopersSection />
      <SecuritySection />
      <LandingCtaSection />
      <LandingFooter />
    </div>
  )
}
