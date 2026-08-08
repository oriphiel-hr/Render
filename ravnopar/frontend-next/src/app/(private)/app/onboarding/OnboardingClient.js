'use client';

import { Navigate } from '../../../../lib/next-router-compat';
import { useAuth } from '../../../../components/AuthProvider';
import OnboardingPage from '../../../../views/OnboardingPage';

export default function OnboardingClient() {
  const { token, hydrated, setOnboardingDone, setFeedReady } = useAuth();
  if (!hydrated) return null;
  if (!token) return <Navigate to="/auth" replace />;
  return (
    <OnboardingPage
      token={token}
      onDone={() => {
        setOnboardingDone(true);
        setFeedReady(true);
      }}
    />
  );
}
