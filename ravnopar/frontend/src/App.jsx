import { useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PublicFooter from './components/PublicFooter.jsx';
import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import DonatePage from './pages/DonatePage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import GuidelinesPage from './pages/GuidelinesPage.jsx';
import PlanoviPage from './pages/PlanoviPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import { recordMemberSinceIfNeeded } from './lib/donate-prompt.js';

function Topbar({ token, profile, onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    closeMenu();
    onLogout();
  }

  return (
    <header className="topbar">
      <nav className="topbar-inner">
        <div className="topbar-main">
          <Link className="brand" to="/" onClick={closeMenu}>
            Ravnopar
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Zatvori' : 'Izbornik'}
          </button>
        </div>
        <div id="main-navigation" className={`topbar-links ${menuOpen ? 'open' : ''}`}>
          {!token && (
            <>
              <Link className={location.pathname === '/' ? 'nav-link active' : 'nav-link'} to="/" onClick={closeMenu}>
                Početna
              </Link>
              <Link className={location.pathname === '/auth' ? 'nav-link active' : 'nav-link'} to="/auth" onClick={closeMenu}>
                Prijava
              </Link>
              <Link className={location.pathname === '/planovi' ? 'nav-link active' : 'nav-link'} to="/planovi" onClick={closeMenu}>
                Planovi
              </Link>
              <Link className={location.pathname === '/pomoc' ? 'nav-link active' : 'nav-link'} to="/pomoc" onClick={closeMenu}>
                Pomoć
              </Link>
            </>
          )}
          {token && (
            <>
              <Link className={location.pathname === '/app' ? 'nav-link active' : 'nav-link'} to="/app" onClick={closeMenu}>
                Moj prostor
              </Link>
              <Link
                className={location.pathname === '/app/postavke' ? 'nav-link active' : 'nav-link'}
                to="/app/postavke"
                onClick={closeMenu}
              >
                Postavke
              </Link>
              <span className="nav-user">Pozdrav, {profile?.displayName}</span>
              <button type="button" className="button button-ghost nav-logout" onClick={handleLogout}>
                Odjava
              </button>
            </>
          )}
          {profile?.role === 'ADMIN' && (
            <Link className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'} to="/admin" onClick={closeMenu}>
              Admin
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

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
    recordMemberSinceIfNeeded();
  }

  function onProfileUpdate(nextProfile) {
    setProfile(nextProfile);
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
      <Topbar token={token} profile={profile} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/planovi" element={<PlanoviPage />} />
        <Route path="/pomoc" element={<FaqPage />} />
        <Route path="/pravila" element={<GuidelinesPage />} />
        <Route path="/privatnost" element={<PrivacyPage />} />
        <Route path="/uvjeti" element={<TermsPage />} />
        <Route path="/kontakt" element={<ContactPage />} />
        <Route path="/auth" element={token ? <Navigate to="/app" replace /> : <AuthPage onLogin={onLogin} />} />
        <Route
          path="/app"
          element={token ? <UserDashboardPage token={token} profile={profile} /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/app/postavke"
          element={
            token ? (
              <SettingsPage token={token} profile={profile} onLogout={onLogout} onProfileUpdate={onProfileUpdate} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/app/chat/:pairId"
          element={token ? <ChatPage token={token} profile={profile} /> : <Navigate to="/auth" replace />}
        />
        <Route path="/app/podrzi" element={token ? <DonatePage /> : <Navigate to="/auth" replace />} />
        <Route
          path="/admin"
          element={token && profile?.role === 'ADMIN' ? <AdminPage token={token} /> : <Navigate to="/auth" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PublicFooter token={token} />
      {token && (
        <nav className="mobile-dock" aria-label="Brza navigacija">
          <Link className="dock-link" to="/app">Moj prostor</Link>
          <Link className="dock-link" to="/app/postavke">Postavke</Link>
          {profile?.role === 'ADMIN' && <Link className="dock-link" to="/admin">Admin</Link>}
        </nav>
      )}
    </>
  );
}
