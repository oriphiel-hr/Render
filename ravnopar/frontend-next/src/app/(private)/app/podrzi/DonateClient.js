'use client';

import { Navigate } from '../../../../lib/next-router-compat';
import { useAuth } from '../../../../components/AuthProvider';
import DonatePage from '../../../../views/DonatePage';

export default function DonateClient() {
  const { token, hydrated } = useAuth();
  if (!hydrated) return null;
  if (!token) return <Navigate to="/doniraj" replace />;
  return <DonatePage token={token} />;
}
