import { useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            <PublicPortal
              industry={industry}
              goal={goal}
              paymentModel={paymentModel}
              strategy={strategy}
              offerSnapshot={offerSnapshot}
              onChangeIndustry={setIndustry}
              onChangeGoal={setGoal}
              onChangePaymentModel={setPaymentModel}
              onOfferSnapshotChange={setOfferSnapshot}
            />
          }
        />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

function AppLayout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <header style={{ borderBottom: '1px solid #e5e7eb', padding: '0.75rem 1rem' }}>
        <nav style={{ maxWidth: 980, margin: '0 auto', display: 'flex', gap: 16 }}>
          <Link to="/" style={{ fontWeight: !isAdmin ? 700 : 500 }}>
            Korisnicki dio
          </Link>
          <Link to="/admin" style={{ fontWeight: isAdmin ? 700 : 500 }}>
            Admin dio
          </Link>
        </nav>
      </header>
      {children}
    </>
  );
}

function PublicPortal({
  industry,
  goal,
  paymentModel,
  strategy,
  offerSnapshot,
  onChangeIndustry,
  onChangeGoal,
  onChangePaymentModel,
  onOfferSnapshotChange
}) {
  return (
    <>
      <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Oriphiel digital services</h1>
        <p style={{ marginTop: 0 }}>
          Korisnicki dio: konfigurator demo strategije, kalkulator i slanje upita.
        </p>
        <OfferPhasesPlanner onSnapshotChange={onOfferSnapshotChange} />
        <AdsStrategyPreview
          industry={industry}
          goal={goal}
          paymentModel={paymentModel}
          strategy={strategy}
          onChangeIndustry={onChangeIndustry}
          onChangeGoal={onChangeGoal}
          onChangePaymentModel={onChangePaymentModel}
        />
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

function AdminPortal() {
  return (
    <main style={{ maxWidth: 980, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Admin portal</h1>
      <p style={{ marginTop: 0 }}>
        Administracija leadova, klijenata, konfiguracija i technology sync statusa.
      </p>
      <AdminDemoInsights />
      <AdminClientConfigurations />
    </main>
  );
}
