/* src/admin/router.jsx */
import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import ModelPage from './ModelPage'
import Login from './Login'
import AdminPayments from '../pages/AdminPayments'
import AdminProviderApprovals from '../pages/AdminProviderApprovals'
import AdminKYCMetrics from '../pages/AdminKYCMetrics'
import AdminDataCleanup from '../pages/AdminDataCleanup'
import AdminTesting from '../pages/AdminTesting'
import AdminVerificationDocuments from '../pages/AdminVerificationDocuments'
import AdminPlatformStats from '../pages/AdminPlatformStats'
import AdminModeration from '../pages/AdminModeration'
import AdminDocumentation from '../pages/AdminDocumentation'
import AdminSmsLogs from '../pages/AdminSmsLogs'
import AdminInvoices from '../pages/AdminInvoices'
import AdminUsersOverview from '../pages/AdminUsersOverview'
import AdminDatabaseEditor from '../pages/AdminDatabaseEditor'
import AdminApiReference from '../pages/AdminApiReference'
import UserTypesOverview from '../pages/UserTypesOverview'
import AdminAuditLogs from '../pages/AdminAuditLogs'
import AdminApiRequestLogs from '../pages/AdminApiRequestLogs'
import AdminErrorLogs from '../pages/AdminErrorLogs'
import AdminAddonEventLogs from '../pages/AdminAddonEventLogs'
import api from '../api'

// Model nazivi u PascalCase kako backend očekuje
export const MODELS = [
  'User',
  'ProviderProfile',
  'Category',
  'Job',
  'Offer',
  'Review',
  'Notification',
  'ChatRoom',
  'ChatMessage',
  'Subscription',
  'SubscriptionPlan',
  'LegalStatus'
]

export default function AdminRouter(){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Provjeri da li postoji token u localStorage
    const token = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Postavi token u axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    
    setIsLoading(false);
  }, []);

  // Detektiraj hash linkove koji nisu dio admin panela i preusmjeri na glavnu aplikaciju
  useEffect(() => {
    if (!isAuthenticated) return; // Ne radi provjere dok korisnik nije autentificiran
    
    // Admin panel rute (hash-ovi koji su dio admin panela)
    const adminHashRoutes = ['admin'];
    // Admin panel path rute (koje se koriste u BrowserRouter)
    const adminPathRoutes = ['payments', 'provider-approvals', 'kyc-metrics', 'verification-documents', 
                             'platform-stats', 'moderation', 'sms-logs', 'invoices', 
                             'users-overview', 'cleanup', 'testing', 'database', 'api-reference', 'user-types',
                             'audit-logs', 'api-request-logs', 'error-logs', 'addon-event-logs'];
    // Dodaj sve MODELS kao admin rute
    const adminModelRoutes = MODELS.map(m => m.toLowerCase());
    
    const isAdminRoute = (hash) => {
      if (!hash) return false;
      const hashLower = hash.toLowerCase();
      const isAdminHash = adminHashRoutes.includes(hashLower) || hashLower.startsWith('admin/');
      const isAdminPath = adminPathRoutes.some(route => hashLower === route);
      const isAdminModel = adminModelRoutes.some(model => hashLower === model);
      return isAdminHash || isAdminPath || isAdminModel;
    };

    const checkAndRedirect = () => {
      const hash = window.location.hash?.slice(1).split('?')[0];
      const pathname = window.location.pathname;
      
      // Ako smo u admin panelu (pathname sadrži /admin/) i hash NIJE dio admin panela
      if (pathname.includes('/admin/') && hash && !isAdminRoute(hash)) {
        // Resetiraj pathname na root i postavi hash
        const query = window.location.search;
        const newUrl = `/${window.location.hash}${query}`;
        window.location.replace(newUrl);
        return true; // Redirected
      }
      return false; // No redirect needed
    };

    // Interceptiraj klikove na sve linkove (hash i vanjske)
    const handleClick = (e) => {
      const target = e.target.closest('a[href]');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (!href) return;
      
      const pathname = window.location.pathname;
      
      // Ako nismo u admin panelu, ne radi ništa
      if (!pathname.includes('/admin/')) return;
      
      // Apsolutni URL-ovi (https://, http://, mailto:, tel:) - omogući normalno otvaranje
      if (href.match(/^(https?:\/\/|mailto:|tel:)/i)) {
        // Ako je target="_blank", omogući normalno otvaranje
        if (target.getAttribute('target') === '_blank') {
          return; // Omogući normalno otvaranje
        }
        // Inače, možda želimo preusmjeriti na glavnu aplikaciju
        // Ali za sada omogućimo normalno otvaranje
        return;
      }
      
      // Hash linkovi
      if (href.startsWith('#')) {
        const hash = href.slice(1).split('?')[0];
        
        // Ako hash NIJE dio admin panela, resetiraj pathname na root
        if (!isAdminRoute(hash)) {
          e.preventDefault();
          e.stopPropagation();
          const query = window.location.search;
          window.location.replace(`/${href}${query}`);
          return;
        }
        // Ako je hash dio admin panela, omogući normalno React Router navigaciju
        return;
      }
      
      // Relativni linkovi koji nisu hash (npr. "/", "/#login", "/#register")
      // Ako relativni link nije dio admin panela, preusmjeri na glavnu aplikaciju
      if (href.startsWith('/')) {
        // Provjeri da li je to admin ruta
        const isAdminPath = href.startsWith('/admin/') || href === '/admin';
        
        if (!isAdminPath) {
          // Nije admin ruta - preusmjeri na glavnu aplikaciju
          e.preventDefault();
          e.stopPropagation();
          window.location.replace(href);
          return;
        }
        // Ako je admin ruta, omogući normalno React Router navigaciju
        return;
      }
      
      // Ostali relativni linkovi (bez /) - tretiraj kao hash ili preusmjeri
      // Ako nije hash, možda je relativni path - preusmjeri na glavnu aplikaciju
      if (!href.startsWith('#') && !href.match(/^(https?:\/\/|mailto:|tel:)/i)) {
        e.preventDefault();
        e.stopPropagation();
        window.location.replace(`/${href}`);
        return;
      }
    };

    // Provjeri trenutni URL pri učitavanju (samo jednom)
    const initialCheck = () => {
      if (checkAndRedirect()) {
        return; // Redirected
      }
    };
    
    // Provjeri odmah nakon što se komponenta učita
    initialCheck();
    
    // Slušaj hash promjene
    const handleHashChange = () => {
      // Dodaj malu delay da se hash promjena potpuno primijeni
      setTimeout(() => {
        checkAndRedirect();
      }, 10);
    };
    
    // Slušaj hash promjene i klikove
    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('click', handleClick, true); // Use capture phase
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isAuthenticated]);

  const handleLogin = (token, userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    // Postavi token u axios headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    delete api.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={logout} />}>
          <Route index element={<Navigate to={`/admin/${MODELS[0]}`} replace />} />
          {MODELS.map(m => (
            <Route key={m} path={`/admin/${m}`} element={<ModelPage model={m} />} />
          ))}
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/provider-approvals" element={<AdminProviderApprovals />} />
          <Route path="/admin/kyc-metrics" element={<AdminKYCMetrics />} />
          <Route path="/admin/verification-documents" element={<AdminVerificationDocuments />} />
          <Route path="/admin/platform-stats" element={<AdminPlatformStats />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/admin/documentation" element={<AdminDocumentation />} />
          <Route path="/admin/sms-logs" element={<AdminSmsLogs />} />
          <Route path="/admin/invoices" element={<AdminInvoices />} />
          <Route path="/admin/users-overview" element={<AdminUsersOverview />} />
          <Route path="/admin/cleanup" element={<AdminDataCleanup />} />
          <Route path="/admin/testing" element={<AdminTesting />} />
          <Route path="/admin/database" element={<AdminDatabaseEditor />} />
          <Route path="/admin/api-reference" element={<AdminApiReference />} />
          <Route path="/admin/user-types" element={<UserTypesOverview isAdmin={true} />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
          <Route path="/admin/api-request-logs" element={<AdminApiRequestLogs />} />
          <Route path="/admin/error-logs" element={<AdminErrorLogs />} />
          <Route path="/admin/addon-event-logs" element={<AdminAddonEventLogs />} />
          {/* Fallback ruta za nepoznate admin rute - redirect na prvi model */}
          <Route path="/admin/*" element={<Navigate to={`/admin/${MODELS[0]}`} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
