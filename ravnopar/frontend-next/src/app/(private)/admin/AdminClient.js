'use client';

import { Navigate } from '../../../lib/next-router-compat';
import { useAuth } from '../../../components/AuthProvider';
import AdminPage from '../../../views/AdminPage';

export default function AdminClient() {
  const { token, profile, hydrated } = useAuth();
  if (!hydrated) return null;
  if (!token || profile?.role !== 'ADMIN') return <Navigate to="/auth" replace />;
  return <AdminPage token={token} profile={profile} />;
}
