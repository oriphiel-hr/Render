'use client';

import { Navigate } from '../../../lib/next-router-compat';
import { useAuth } from '../../../components/AuthProvider';
import UserDashboardPage from '../../../views/UserDashboardPage';

export default function AppHomeClient() {
  const { token, profile, hydrated, needsOnboarding, needsProfileSetup } = useAuth();
  if (!hydrated) return null;
  if (!token) return <Navigate to="/auth" replace />;
  if (needsOnboarding || needsProfileSetup) return <Navigate to="/app/onboarding" replace />;
  return <UserDashboardPage token={token} profile={profile} />;
}
