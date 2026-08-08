'use client';

import AuthPage from '../../../views/AuthPage';
import { Navigate } from '../../../lib/next-router-compat';
import { useAuth } from '../../../components/AuthProvider';

export default function AuthClient() {
  const { token, onLogin, hydrated } = useAuth();
  if (!hydrated) return null;
  if (token) return <Navigate to="/app" replace />;
  return <AuthPage onLogin={onLogin} />;
}
