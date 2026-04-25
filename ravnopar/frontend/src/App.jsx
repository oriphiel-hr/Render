import { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('ravnoparToken') || '');
  const [profile, setProfile] = useState(() => {
    const raw = localStorage.getItem('ravnoparProfile');
    return raw ? JSON.parse(raw) : null;
  });

  function onLogin(nextToken, nextProfile) {
    setToken(nextToken);
    setProfile(nextProfile);
    localStorage.setItem('ravnoparToken', nextToken);
    localStorage.setItem('ravnoparProfile', JSON.stringify(nextProfile));
  }

  function onLogout() {
    setToken('');
    setProfile(null);
    localStorage.removeItem('ravnoparToken');
    localStorage.removeItem('ravnoparProfile');
  }

  return (
    <>
      <header className="topbar">
        <nav className="topbar-inner">
          <Link className="nav-link" to="/">Landing</Link>
          <Link className="nav-link" to="/auth">Prijava</Link>
          <Link className="nav-link" to="/app">Korisnicki dio</Link>
          {profile?.role === 'ADMIN' && <Link className="nav-link" to="/admin">Admin</Link>}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage onLogin={onLogin} />} />
        <Route
          path="/app"
          element={
            token ? (
              <UserDashboardPage token={token} profile={profile} onLogout={onLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            token && profile?.role === 'ADMIN' ? (
              <AdminPage token={token} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
