import PricingHeartSection from './PricingHeartSection.jsx';
import DonateSection from './DonateSection.jsx';
import PricingPlans from './PricingPlans.jsx';
import PricingPolicySection from './PricingPolicySection.jsx';

export default function SupportContent({ showDonate = true, showHeart = false, policyVariant = 'full' }) {
  return (
    <>
      {showHeart && <PricingHeartSection />}
      <PricingPolicySection variant={policyVariant} />
      <PricingPlans />
      {showDonate && <DonateSection />}
    </>
  );
}
