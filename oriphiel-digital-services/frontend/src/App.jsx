import { useMemo, useState } from 'react';
import PartnerServices from './pages/PartnerServices.jsx';
import AdsStrategyPreview, { INDUSTRIES, buildStrategy } from './pages/AdsStrategyPreview.jsx';
import OfferPhasesPlanner from './pages/OfferPhasesPlanner.jsx';
import AdminDemoInsights from './pages/AdminDemoInsights.jsx';
import AdminClientConfigurations from './pages/AdminClientConfigurations.jsx';

export default function App() {
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [goal, setGoal] = useState('LEADS');
  const [paymentModel, setPaymentModel] = useState('TEST');
  const [offerSnapshot, setOfferSnapshot] = useState(null);

  const strategy = useMemo(
    () => buildStrategy(industry, goal, paymentModel),
    [industry, goal, paymentModel]
  );

  return (
    <>
      <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Oriphiel digital services</h1>
        <p style={{ marginTop: 0 }}>
          Testni prikaz vrijednosti za klijenta: što dobiva kroz Google Ads strategiju.
        </p>
        <OfferPhasesPlanner onSnapshotChange={setOfferSnapshot} />
        <AdsStrategyPreview
          industry={industry}
          goal={goal}
          paymentModel={paymentModel}
          strategy={strategy}
          onChangeIndustry={setIndustry}
          onChangeGoal={setGoal}
          onChangePaymentModel={setPaymentModel}
        />
        <AdminDemoInsights />
        <AdminClientConfigurations />
      </main>
      <PartnerServices
        strategySnapshot={{
          industry,
          goal,
          paymentModel,
          recommendation: strategy,
          offerSnapshot
        }}
      />
    </>
  );
}
