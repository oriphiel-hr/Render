'use client';

import { Navigate } from '../../../../../lib/next-router-compat';
import { useAuth } from '../../../../../components/AuthProvider';
import ProfileDetailPage from '../../../../../views/ProfileDetailPage';

export default function ProfileClient() {
  const { token, profile, hydrated } = useAuth();
  if (!hydrated) return null;
  if (!token) return <Navigate to="/auth" replace />;
  return <ProfileDetailPage token={token} myProfileId={profile?.id} />;
}
