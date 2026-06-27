import DonateSection from './DonateSection.jsx';
import PricingPlans from './PricingPlans.jsx';
import PricingPolicySection from './PricingPolicySection.jsx';

export default function SupportContent({ showDonate = true, policyVariant = 'full' }) {
  return (
    <>
      <PricingPolicySection variant={policyVariant} />
      <PricingPlans />
      {showDonate && <DonateSection />}
    </>
  );
}
