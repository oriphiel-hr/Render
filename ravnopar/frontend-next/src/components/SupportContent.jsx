'use client';

import PricingHeartSection from './PricingHeartSection.jsx';
import DonateSection from './DonateSection.jsx';
import PricingPlans from './PricingPlans.jsx';
import PricingPolicySection from './PricingPolicySection.jsx';

export default function SupportContent({ showDonate = true, showHeart = false, policyVariant = 'full', token }) {
  return (
    <>
      {showHeart && <PricingHeartSection />}
      <PricingPolicySection variant={policyVariant} />
      <PricingPlans token={token} />
      {showDonate && <DonateSection token={token} />}
    </>
  );
}
