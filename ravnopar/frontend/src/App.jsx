import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Analytics from './components/Analytics.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import CookieBanner from './components/CookieBanner.jsx';
import PublicFooter from './components/PublicFooter.jsx';
import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import DonatePage from './pages/DonatePage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import GuidelinesPage from './pages/GuidelinesPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import PlanoviPage from './pages/PlanoviPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import ProfileDetailPage from './pages/ProfileDetailPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import { getInboxSummary, getProfile } from './api/index.js';
import { recordMemberSinceIfNeeded } from './lib/donate-prompt.js';

function Topbar({ token, profile, onLogout, unreadTotal }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="topbar">
      <nav className="topbar-inner">
        <div className="topbar-main">
          <Link className="brand" to="/" onClick={closeMenu}>
            Ravnopar
          </Link>
          <button type="button" className="menu-toggle" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? 'Zatvori' : 'Izbornik'}
          </button>
        </div>
        <div className={`topbar-links ${menuOpen ? 'open' : ''}`}>
          {!token && (
            <>
              <Link className={location.pathname === '/' ? 'nav-link active' : 'nav-link'} to="/" onClick={closeMenu}>Početna</Link>
              <Link className={location.pathname === '/auth' ? 'nav-link active' : 'nav-link'} to="/auth?login=1" onClick={closeMenu}>Prijava</Link>
              <Link className={location.pathname === '/planovi' ? 'nav-link active' : 'nav-link'} to="/planovi" onClick={closeMenu}>Planovi</Link>
              <Link className={location.pathname === '/pomoc' ? 'nav-link active' : 'nav-link'} to="/pomoc" onClick={closeMenu}>Pomoć</Link>
            </>
          )}
          {token && (
            <>
              <Link className={location.pathname === '/app' ? 'nav-link active' : 'nav-link'} to="/app" onClick={closeMenu}>
                Moj prostor{unreadTotal > 0 ? ` (${unreadTotal})` : ''}
              </Link>
              <Link className={location.pathname.startsWith('/app/postavke') ? 'nav-link active' : 'nav-link'} to="/app/postavke" onClick={closeMenu}>Postavke</Link>
              <span className="nav-user">
                Pozdrav, {profile?.displayName}
                {profile?.role === 'ADMIN' && <span className="chip chip-admin nav-role">Admin</span>}
              </span>
              <button type="button" className="button button-ghost nav-logout" onClick={() => { closeMenu(); onLogout(); }}>Odjava</button>
            </>
          )}
          {profile?.role === 'ADMIN' && (
            <Link className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'} to="/admin" onClick={closeMenu}>Admin</Link>
          )}
          <ThemeToggle />
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
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [feedReady, setFeedReady] = useState(true);

  useEffect(() => {
    if (!token) return;
    getProfile(token).then((data) => {
      if (data?.success) {
        setOnboardingDone(Boolean(data.profile?.onboardingDone));
        setFeedReady(data.feedReady === true);
      }
    });
    const refreshInbox = () => {
      getInboxSummary(token).then((data) => {
        if (data?.success) setUnreadTotal(data.unreadTotal || 0);
      });
    };
    refreshInbox();
    const timer = window.setInterval(refreshInbox, 15000);
    return () => window.clearInterval(timer);
  }, [token]);

  function onLogin(nextToken, nextProfile) {
    setToken(nextToken);
    setProfile(nextProfile);
    setOnboardingDone(Boolean(nextProfile?.onboardingDone));
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
    setUnreadTotal(0);
    localStorage.removeItem('ravnoparToken');
    localStorage.removeItem('ravnoparProfile');
  }

  const needsOnboarding = token && profile && !onboardingDone;
  const needsProfileSetup = token && profile && onboardingDone && !feedReady;

  return (
    <>
      <Analytics />
      <CookieBanner />
      <Topbar token={token} profile={profile} onLogout={onLogout} unreadTotal={unreadTotal} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/planovi" element={<PlanoviPage />} />
        <Route path="/pomoc" element={<FaqPage />} />
        <Route path="/pravila" element={<GuidelinesPage />} />
        <Route path="/privatnost" element={<PrivacyPage />} />
        <Route path="/uvjeti" element={<TermsPage />} />
        <Route path="/kontakt" element={<ContactPage />} />
        <Route path="/auth" element={token ? <Navigate to="/app" replace /> : <AuthPage onLogin={onLogin} />} />
        <Route path="/app/onboarding" element={token ? <OnboardingPage token={token} onDone={() => { setOnboardingDone(true); setFeedReady(true); }} /> : <Navigate to="/auth" replace />} />
        <Route path="/app" element={token ? (needsOnboarding || needsProfileSetup ? <Navigate to="/app/onboarding" replace /> : <UserDashboardPage token={token} profile={profile} />) : <Navigate to="/auth" replace />} />
        <Route path="/app/postavke" element={token ? <SettingsPage token={token} profile={profile} onLogout={onLogout} onProfileUpdate={onProfileUpdate} /> : <Navigate to="/auth" replace />} />
        <Route path="/app/profile/:profileId" element={token ? <ProfileDetailPage token={token} myProfileId={profile?.id} /> : <Navigate to="/auth" replace />} />
        <Route path="/app/chat/:pairId" element={token ? <ChatPage token={token} profile={profile} onRead={() => getInboxSummary(token).then((d) => d?.success && setUnreadTotal(d.unreadTotal || 0))} /> : <Navigate to="/auth" replace />} />
        <Route path="/app/podrzi" element={token ? <DonatePage /> : <Navigate to="/auth" replace />} />
        <Route path="/admin" element={token && profile?.role === 'ADMIN' ? <AdminPage token={token} profile={profile} /> : <Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PublicFooter token={token} />
      {token && (
        <nav className="mobile-dock" aria-label="Brza navigacija">
          <Link className="dock-link" to="/app">Moj prostor{unreadTotal > 0 ? ` (${unreadTotal})` : ''}</Link>
          <Link className="dock-link" to="/app/postavke">Postavke</Link>
          {profile?.role === 'ADMIN' && <Link className="dock-link" to="/admin">Admin</Link>}
        </nav>
      )}
    </>
  );
}
