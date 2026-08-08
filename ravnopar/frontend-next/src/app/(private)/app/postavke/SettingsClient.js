'use client';

import { Navigate } from '../../../../lib/next-router-compat';
import { useAuth } from '../../../../components/AuthProvider';
import SettingsPage from '../../../../views/SettingsPage';

export default function SettingsClient() {
  const { token, profile, hydrated, onLogout, onProfileUpdate } = useAuth();
  if (!hydrated) return null;
  if (!token) return <Navigate to="/auth" replace />;
  return (
    <SettingsPage
      token={token}
      profile={profile}
      onLogout={onLogout}
      onProfileUpdate={onProfileUpdate}
    />
  );
}
