'use client';

import { useState } from 'react';
import Link from './Link.jsx';
import { useLocation } from '../lib/next-router-compat.js';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import NotificationCenter from './NotificationCenter.jsx';
import { isDonateConfigured } from '../lib/donate-config.js';
import { useI18n } from '../lib/i18n/index.jsx';
import { useAuth } from './AuthProvider.jsx';

export function Topbar() {
  const location = useLocation();
  const { t } = useI18n();
  const {
    token,
    profile,
    onLogout,
    unreadTotal,
    notificationUnread,
    setNotificationUnread
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const totalUnread = unreadTotal + notificationUnread;

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="topbar">
      <nav className="topbar-inner">
        <div className="topbar-head">
          <Link className="brand" to="/" onClick={closeMenu}>
            Ravnopar
          </Link>
          <div className={`topbar-links ${menuOpen ? 'open' : ''}`}>
            {!token && (
              <>
                <Link className={location.pathname.endsWith('/') || /\/[a-z]{2}$/.test(location.pathname) ? 'nav-link active' : 'nav-link'} to="/" onClick={closeMenu}>{t('nav.home')}</Link>
                <Link className={location.pathname.includes('/auth') ? 'nav-link active' : 'nav-link'} to="/auth?login=1" onClick={closeMenu}>{t('nav.login')}</Link>
                <Link className={location.pathname.includes('/planovi') ? 'nav-link active' : 'nav-link'} to="/planovi" onClick={closeMenu}>{t('nav.plans')}</Link>
                <Link className={location.pathname.includes('/pomoc') ? 'nav-link active' : 'nav-link'} to="/pomoc" onClick={closeMenu}>{t('nav.help')}</Link>
              </>
            )}
            {token && (
              <>
                <Link className={location.pathname === '/app' ? 'nav-link active' : 'nav-link'} to="/app" onClick={closeMenu}>
                  {totalUnread > 0 ? t('nav.mySpaceUnread', { count: totalUnread }) : t('nav.mySpace')}
                </Link>
                <Link className={location.pathname.startsWith('/app/postavke') ? 'nav-link active' : 'nav-link'} to="/app/postavke" onClick={closeMenu}>{t('nav.settings')}</Link>
                <Link className={location.pathname.includes('/pomoc') ? 'nav-link active' : 'nav-link'} to="/pomoc" onClick={closeMenu}>{t('nav.help')}</Link>
                <Link className={location.pathname.includes('/kontakt') ? 'nav-link active' : 'nav-link'} to="/kontakt" onClick={closeMenu}>{t('nav.contact')}</Link>
                {isDonateConfigured() && (
                  <Link
                    className={location.pathname === '/app/podrzi' ? 'nav-link active' : 'nav-link'}
                    to="/app/podrzi"
                    onClick={closeMenu}
                  >
                    {t('nav.donate')}
                  </Link>
                )}
                <span className="nav-user">
                  {t('nav.greeting', { name: profile?.displayName })}
                  {profile?.role === 'ADMIN' && <span className="chip chip-admin nav-role">{t('nav.admin')}</span>}
                </span>
                <button type="button" className="button button-ghost nav-logout" onClick={() => { closeMenu(); onLogout(); }}>{t('nav.logout')}</button>
              </>
            )}
            {profile?.role === 'ADMIN' && (
              <Link className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'} to="/admin" onClick={closeMenu}>{t('nav.admin')}</Link>
            )}
            <LanguageSwitcher variant="popover" className="topbar-lang" />
            {token && (
              <NotificationCenter token={token} onChange={setNotificationUnread} />
            )}
            <ThemeToggle />
          </div>
          <button type="button" className="menu-toggle" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? t('nav.close') : t('nav.menu')}
          </button>
        </div>
      </nav>
    </header>
  );
}

export function MobileDock() {
  const { t } = useI18n();
  const { token, profile, unreadTotal, notificationUnread } = useAuth();
  const location = useLocation();
  const totalUnread = unreadTotal + notificationUnread;
  if (!token) return null;
  if (location.pathname.includes('/app/chat/')) return null;

  return (
    <nav className="mobile-dock" aria-label={t('nav.quickNav')}>
      <Link className="dock-link" to="/app">
        {totalUnread > 0 ? t('nav.mySpaceUnread', { count: totalUnread }) : t('nav.mySpace')}
      </Link>
      <Link className="dock-link" to="/app/postavke">{t('nav.settings')}</Link>
      {isDonateConfigured() && <Link className="dock-link" to="/app/podrzi">{t('nav.donate')}</Link>}
      {profile?.role === 'ADMIN' && <Link className="dock-link" to="/admin">{t('nav.admin')}</Link>}
    </nav>
  );
}
