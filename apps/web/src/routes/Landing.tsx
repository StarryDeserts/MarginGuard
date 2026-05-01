import { ArchitecturePrinciples } from '../components/landing/ArchitecturePrinciples'
import { HowItWorks } from '../components/landing/HowItWorks'
import { LandingCTA } from '../components/landing/LandingCTA'
import { LandingFooter } from '../components/landing/LandingFooter'
import { LandingHero } from '../components/landing/LandingHero'
import { LandingNav } from '../components/landing/LandingNav'
import { WhyMarginGuard } from '../components/landing/WhyMarginGuard'
import { MarketingShell } from '../components/layout/MarketingShell'

export function Landing() {
  return (
    <MarketingShell>
      <LandingNav />
      <LandingHero />
      <WhyMarginGuard />
      <HowItWorks />
      <ArchitecturePrinciples />
      <LandingCTA />
      <LandingFooter />
    </MarketingShell>
  )
}
