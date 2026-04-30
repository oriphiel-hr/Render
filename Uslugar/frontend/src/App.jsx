import React, { useEffect, useState } from 'react';
import api from '@/api'
import { getCategoryIcon } from './data/categoryIcons.js';
import { highlightMatch } from './utils/highlightMatch.jsx';
import { AdminRouter } from './admin';
import JobCard from './components/JobCard';
import JobForm from './components/JobForm';
import ProviderCard from './components/ProviderCard';
import ProviderFilter from './components/ProviderFilter';
import ProvidersMap from './components/ProvidersMap';
import LocationMap from './components/LocationMap';
import ReviewList from './components/ReviewList';
import Login from './pages/Login';
import UserRegister from './pages/UserRegister';
import ProviderProfile from './pages/ProviderProfile';
import ProviderProfileModal from './components/ProviderProfile';
import UserProfile from './pages/UserProfile';
import UpgradeToProvider from './pages/UpgradeToProvider';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Pricing from './pages/Pricing';
import TimeLanding from './pages/TimeLanding';
import Documentation from './pages/Documentation';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Contact from './pages/Contact';
import PaymentSuccess from './pages/PaymentSuccess';
import UserTypesFlowcharts from './pages/UserTypesFlowcharts';
// USLUGAR EXCLUSIVE components
// Trigger deployment #400
import LeadMarketplace from './pages/LeadMarketplace';
import ROIDashboard from './pages/ROIDashboard';
import MyLeads from './pages/MyLeads';
import MyJobs from './pages/MyJobs';
import TeamLocations from './pages/TeamLocations';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Invoices from './pages/Invoices';
import DirectorDashboard from './pages/DirectorDashboard';
import CreditsWidget from './components/CreditsWidget';
// Chat and Offers
import ChatList from './components/ChatList';
import OfferForm from './components/OfferForm';
// Navigation components
import DropdownMenu from './components/DropdownMenu';
import MobileMenu from './components/MobileMenu';
import Logo from './components/Logo';
import { useDarkMode } from './contexts/DarkModeContext.jsx';
import { getChatRooms } from './api/chat';

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  function saveToken(t) { localStorage.setItem('token', t); setToken(t); }
  function logout(){ localStorage.removeItem('token'); setToken(null); }
  return { token, saveToken, logout };
}

export default function App(){
  const { token, saveToken, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const docsScreenshotStamp = (() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('screenshotMode') !== 'docs') return null;
    return params.get('screenshotStamp') || null;
  })();
  const isDocsScreenshotMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search || '').get('screenshotMode') === 'docs';
  
  // Helper funkcija za navigaciju koja provjerava da li smo u admin panelu
  const navigateToTab = (tabName) => {
    if (window.location.pathname.startsWith('/admin/')) {
      window.location.replace(`/#${tabName}`);
    } else {
      setTab(tabName);
    }
  };

  // Helper funkcija za provjeru je li korisnik PROVIDER ili USER sa legalStatusId
  const isProviderOrBusinessUser = () => {
    if (!token) return false;
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return false;
    try {
      const userData = JSON.parse(storedUser);
      return userData.role === 'PROVIDER' || userData.role === 'ADMIN' || (userData.role === 'USER' && userData.legalStatusId);
    } catch {
      return false;
    }
  };

  // Helper funkcija: je li korisnik pružatelj usluge (ili admin)
  const isProvider = () => {
    if (!token) return false;
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return false;
    try {
      const userData = JSON.parse(storedUser);
      return userData.role === 'PROVIDER' || userData.role === 'ADMIN';
    } catch {
      return false;
    }
  };

  // "Postani pružatelj" samo za korisnike usluge koji su pravna osoba (imaju legalStatusId)
  const canShowPostaniPružatelj = () => {
    if (!token) return false;
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return false;
    try {
      const userData = JSON.parse(storedUser);
      return userData.role === 'USER' && !!userData.legalStatusId;
    } catch {
      return false;
    }
  };

  const getUserFlags = () => {
    if (!token) return { canUseLeads: false, hasActiveSubscription: false, subscriptionPlan: null };
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return { canUseLeads: false, hasActiveSubscription: false, subscriptionPlan: null };
    try {
      const userData = JSON.parse(storedUser);
      return {
        canUseLeads: !!userData.canUseLeads,
        hasActiveSubscription: !!userData.hasActiveSubscription,
        subscriptionPlan: userData.subscriptionPlan || null
      };
    } catch {
      return { canUseLeads: false, hasActiveSubscription: false, subscriptionPlan: null };
    }
  };

  // TAB: 'user' | 'admin' | 'login' | 'register-user' | 'upgrade-to-provider' | 'verify' | 'forgot-password' | 'reset-password' | 'leads' | 'my-leads' | 'roi' | 'subscription' | 'pricing' | 'providers' | 'documentation' | 'faq'
  // Note: 'register-provider' is kept in validTabs for backward compatibility but redirects to 'register-user'
  const validTabs = ['admin', 'login', 'register-user', 'register-provider', 'provider-profile', 'user-profile', 'upgrade-to-provider', 'verify', 'forgot-password', 'reset-password', 'leads', 'my-leads', 'my-jobs', 'roi', 'subscription', 'subscription-success', 'pricing', 'providers', 'categories', 'documentation', 'faq', 'about', 'contact', 'time-landing', 'tools-catalog', 'team-locations', 'invoices', 'user', 'user-types-flowcharts', 'director', 'chat'];
  const [tab, setTab] = useState(() => {
    // Provjeri pathname za admin panel (BrowserRouter koristi pathname, ne hash)
    const pathname = window.location.pathname;
    if (pathname.startsWith('/admin/')) {
      return 'admin';
    }
    
    // Inače koristi hash-based routing
    const fullHash = window.location.hash?.slice(1) || '';
    const [hashWithoutQuery] = fullHash.split('?');
    const hash = hashWithoutQuery;
    // Obfuscated admin panel pristup: #adm -> admin
    const normalizedHash = hash === 'adm' ? 'admin' : hash;
    return validTabs.includes(normalizedHash) ? normalizedHash : 'time-landing';
  });

  // USER tab state
  const [jobs, setJobs] = useState([]);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [previewJobs, setPreviewJobs] = useState([]); // Preview poslova za neregistrirane
  const [q, setQ] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [openProviderForContact, setOpenProviderForContact] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: '',
    city: '',
    budgetMin: '',
    budgetMax: '',
    status: '',
    sortBy: 'newest', // newest, oldest, budgetHigh, budgetLow
    dateFrom: '',
    dateTo: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [savedSearches, setSavedSearches] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedJobForOffer, setSelectedJobForOffer] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [providerFilters, setProviderFilters] = useState({
    search: null,
    categoryId: null,
    city: null,
    minRating: null,
    verified: null,
    hasLicenses: null,
    isAvailable: null,
    sortBy: 'rating'
  });
  const [providerUserLocation, setProviderUserLocation] = useState(null); // { lat, lon } za sort by distance
  const [providersView, setProvidersView] = useState('list'); // 'list' | 'map'
  const [chatWaitingCount, setChatWaitingCount] = useState(0);
  const [providerMeta, setProviderMeta] = useState({ hasTeam: false, isDirector: false });
  const [platformInsights, setPlatformInsights] = useState(null);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dohvati hasTeam i isDirector za uvjetni prikaz Lokacije timova i Nadzorna ploča direktora
  // hasTeam = direktor s barem 1 članom ILI član tima (companyId); inače sakrij Lokacije timova
  useEffect(() => {
    if (!token || !isProviderOrBusinessUser()) {
      setProviderMeta({ hasTeam: false, isDirector: false });
      return;
    }
    const load = async () => {
      try {
        const res = await api.get('/providers/me');
        const p = res.data;
        const isDirector = !!p?.isDirector;
        let hasTeam = !!p?.companyId; // član tima
        if (isDirector) {
          const teamRes = await api.get('/director/team').catch(() => ({ data: { teamMembers: [] } }));
          const members = teamRes?.data?.teamMembers || [];
          hasTeam = members.length > 0;
        }
        setProviderMeta({ hasTeam, isDirector });
      } catch {
        setProviderMeta({ hasTeam: false, isDirector: false });
      }
    };
    load();
  }, [token]);

  // Ako je korisnik već prijavljen, ne nudimo login/registraciju – automatski preusmjeri na user tab
  useEffect(() => {
    if (token && (tab === 'login' || tab === 'register-user' || tab === 'register-provider')) {
      setTab('user');
    }
  }, [token, tab]);

  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  // Globalni listener za istek sesije (401 iz api.js)
  useEffect(() => {
    const handleSessionExpired = (e) => {
      const isAdmin = e?.detail?.isAdminRequest;
      if (!isAdmin) {
        logout();
        setTab('login');
      }
      setShowSessionExpiredModal(true);
    };

    window.addEventListener('uslugar:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('uslugar:session-expired', handleSessionExpired);
    };
  }, [logout]);

  useEffect(() => {
    if (tab !== 'user') return;

    if (token) {
      const params = {};
      if (q && String(q).trim()) params.q = String(q).trim();
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.city && String(filters.city).trim()) params.city = String(filters.city).trim();
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.budgetMin) params.minBudget = filters.budgetMin;
      if (filters.budgetMax) params.maxBudget = filters.budgetMax;
      if (filters.status) params.status = filters.status;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.urgency) params.urgency = filters.urgency;
      if (filters.jobSize) params.jobSize = filters.jobSize;
      api.get('/jobs', { params }).then(r => setJobs(r.data)).catch(() => setJobs([]));
    } else if (filters.categoryId) {
      const params = { limit: 60, categoryId: filters.categoryId };
      if (q && String(q).trim()) params.q = String(q).trim();
      if (filters.city && String(filters.city).trim()) params.city = String(filters.city).trim();
      api.get('/jobs', { params }).then(r => setJobs(r.data)).catch(() => setJobs([]));
    } else {
      setJobs([]);
      api.get('/jobs', { params: { limit: 6 } })
        .then(r => setPreviewJobs(r.data.slice(0, 6)))
        .catch(() => setPreviewJobs([]));
    }
  }, [q, tab, filters, token]);

  useEffect(() => {
    // Dohvati kategorije s API-ja
    api.get('/categories')
      .then(r => {
        setCategories(r.data);
      })
      .catch(err => {
        setCategories([]);
      });
  }, []);

  // Učitaj spremljene pretrage
  useEffect(() => {
    if (token && tab === 'user') {
      api.get('/saved-searches')
        .then(r => setSavedSearches(r.data))
        .catch(() => setSavedSearches([]));
    }
  }, [token, tab]);

  // Učitaj currentUserId iz tokena
  useEffect(() => {
    if (token) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUserId(userData.id);
        } else {
          // Ako nema u localStorage, pokušaj iz tokena
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUserId(payload.userId);
        }
      } catch (e) {
        console.error('Error parsing user ID:', e);
      }
    } else {
      setCurrentUserId(null);
    }
  }, [token]);

  // Periodično dohvaćanje chat soba za badge (broj razgovora koji čekaju odgovor)
  useEffect(() => {
    if (!token || !currentUserId) {
      setChatWaitingCount(0);
      return;
    }
    let cancelled = false;

    const loadChatRooms = async () => {
      try {
        const response = await getChatRooms();
        const rooms = Array.isArray(response.data)
          ? response.data
          : (response.data?.rooms ?? []);
        if (!Array.isArray(rooms) || cancelled) return;
        const count = rooms.reduce((acc, room) => {
          const last = room.messages && room.messages.length > 0 ? room.messages[0] : null;
          const status = room.job?.status || null;
          const isActiveJob = status === 'OPEN' || status === 'IN_PROGRESS' || !status;
          if (isActiveJob && last && last.senderId && last.senderId !== currentUserId) {
            return acc + 1;
          }
          return acc;
        }, 0);
        if (!cancelled) setChatWaitingCount(count);
      } catch {
        if (!cancelled) setChatWaitingCount(0);
      }
    };

    loadChatRooms();
    const intervalId = setInterval(loadChatRooms, 15000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [token, currentUserId]);

  useEffect(() => {
    if (tab !== 'providers') return;
    const insQ = providerFilters.categoryId
      ? `?categoryId=${encodeURIComponent(providerFilters.categoryId)}`
      : '';
    api
      .get(`/public/platform-insights${insQ}`)
      .then((r) => setPlatformInsights(r.data))
      .catch(() => setPlatformInsights(null));
  }, [tab, providerFilters.categoryId]);

  useEffect(() => {
    if (tab !== 'providers') return;
    
    const params = { ...providerFilters };
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });
    if (providerUserLocation) {
      params.userLat = providerUserLocation.lat;
      params.userLon = providerUserLocation.lon;
    }
    if (params.sortBy === 'distance' && !providerUserLocation && params.city) {
      params.centerCity = params.city;
    }
    
    api.get('/providers', { params })
      .then(r => {
        setProviders(r.data);
      })
      .catch(err => {
        console.error('Error fetching providers:', err);
        setProviders([]);
      });
  }, [tab, providerFilters, providerUserLocation]);

  const handleJobSubmit = async (jobData) => {
    try {
      const response = await api.post('/jobs', jobData);
      setJobs(prev => [response.data, ...prev]);
      setShowJobForm(false);
      alert('Posao uspješno objavljen!');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Greška pri objavljivanju posla';
      console.error('Error creating job:', error.response?.status, error.response?.data, error.message);
      alert(msg);
    }
  };

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
  };

  /** S kartice kategorije: postavi filter, idi na Traži poslove (#user), učitaj rezultate */
  const goToJobsFilteredByCategory = (categoryId) => {
    setFilters(prev => ({ ...prev, categoryId }));
    setTab('user');
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleViewProviderProfile = (provider) => {
    setOpenProviderForContact(false);
    setSelectedProvider(provider);
  };

  const handleCloseProviderProfile = () => {
    setSelectedProvider(null);
    setOpenProviderForContact(false);
  };

  const handleMakeOffer = (job) => {
    if (!token) {
      alert('Morate se prijaviti da biste poslali ponudu');
      return;
    }
    // Provjeri da li je korisnik PROVIDER
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role !== 'PROVIDER' && !userData.legalStatusId) {
          alert('Samo pružatelji usluga mogu slati ponude. Nadogradite svoj profil na pružatelja.');
          return;
        }
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    setSelectedJobForOffer(job);
    setShowOfferForm(true);
  };


  const handleContactProvider = (provider) => {
    setOpenProviderForContact(true);
    setSelectedProvider(provider);
  };

  // sync hash radi "deeplinka"
  useEffect(() => {
    const currentHash = window.location.hash?.slice(1).split('?')[0];
    if (tab && currentHash !== tab) {
      window.location.hash = '#' + tab;
    }
  }, [tab]);

  // Listen for hash changes and pathname changes (back/forward navigation, external links, admin panel routing)
  useEffect(() => {
    const handleLocationChange = () => {
      // Provjeri pathname za admin panel (BrowserRouter koristi pathname)
      const pathname = window.location.pathname;
      if (pathname.startsWith('/admin/')) {
        setTab('admin');
        return;
      }
      
      // Inače koristi hash-based routing
      const hash = window.location.hash?.slice(1).split('?')[0];
      // Obfuscated admin panel pristup: #adm -> admin
      const normalizedHash = hash === 'adm' ? 'admin' : hash;
      const validTabs = ['admin', 'login', 'register-user', 'register-provider', 'provider-profile', 'user-profile', 'upgrade-to-provider', 'verify', 'forgot-password', 'reset-password', 'leads', 'my-leads', 'my-jobs', 'roi', 'subscription', 'subscription-success', 'pricing', 'providers', 'categories', 'documentation', 'faq', 'about', 'contact', 'time-landing', 'tools-catalog', 'team-locations', 'invoices', 'user', 'user-types-flowcharts', 'director', 'chat'];
      
      // Check for provider direct link: #provider/{providerId}
      const providerMatch = normalizedHash.match(/^provider\/(.+)$/);
      if (providerMatch) {
        const providerId = providerMatch[1];
        // Fetch and display provider
        api.get(`/providers/${providerId}`)
          .then(response => {
            // API vraća { user, reviews } gdje user ima providerProfile
            const providerData = {
              ...response.data.user.providerProfile,
              user: response.data.user,
              reviews: response.data.reviews
            };
            setSelectedProvider(providerData);
            setTab('providers'); // Switch to providers tab
          })
          .catch(err => {
            console.error('Error loading provider:', err);
            setTab('providers');
          });
        return;
      }
      
      // Auto-route profile pages based on user role
      if (hash === 'provider-profile' || hash === 'user-profile') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            // Ako je PROVIDER ili USER sa legalStatusId, prikaži provider profile
            if (userData.role === 'PROVIDER' || (userData.role === 'USER' && userData.legalStatusId)) {
              setTab('provider-profile');
              window.location.hash = '#provider-profile';
            } else {
              setTab('user-profile');
              window.location.hash = '#user-profile';
            }
          } catch {
            setTab('user-profile');
            window.location.hash = '#user-profile';
          }
        } else {
          setTab('user-profile');
          window.location.hash = '#user-profile';
        }
        return;
      }
      
      // Redirect register-provider to register-user (UserRegister already allows choosing provider type)
      if (hash === 'register-provider') {
        window.location.hash = '#register-user';
        setTab('register-user');
        return;
      }
      
      if (validTabs.includes(normalizedHash)) {
        setTab(normalizedHash);
      } else if (!normalizedHash) {
        setTab('user');
      }
    };
    
    // Check initial location on load
    handleLocationChange();
    
    // Listen for hash changes (hash-based routing)
    window.addEventListener('hashchange', handleLocationChange);
    // Listen for pathname changes (BrowserRouter in admin panel)
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Keyboard shortcut za pristup admin panelu: Ctrl+Shift+A (ili Cmd+Shift+A na Mac)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+A (ili Cmd+Shift+A na Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        // Provjeri da li korisnik ima admin prava (opcionalno - može se provjeriti i na backendu)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            // Provjeri da li je admin (može se dodati provjera role === 'ADMIN' ako postoji)
            // Za sada dozvoljavamo svim prijavljenim korisnicima, backend će provjeriti prava
            window.location.hash = '#adm';
            setTab('admin');
          } catch (e) {
            console.error('Error parsing user:', e);
          }
        } else {
          // Ako nije prijavljen, preusmjeri na login
          window.location.hash = '#login';
          setTab('login');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navLinkBase =
    'relative px-2 py-1 text-sm font-medium transition-colors';
  const navLinkActive =
    'text-gray-900 dark:text-white after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:rounded-full after:bg-emerald-500';
  const navLinkActiveFaq =
    'text-gray-900 dark:text-white after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:rounded-full after:bg-indigo-500';
  const navLinkInactive =
    'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white';

  /*
   * POSLOVNA LOGIKA GRUPIRANJA MENIJA (navigacija)
   * -----------------------------------------------
   * LIJEVA STRANA (javno / glavna navigacija):
   *   - Početna, Cjenik, FAQ, Kontakt = najčešće korišteni linkovi (Cjenik samo ako nema tokena ili je korisnik PROVIDER).
   *   - Dropdown "Više" = manje korištene informacijske stranice: Dokumentacija, O nama, Dijagrami procesa.
   *
   * DESNA STRANA KAD KORISNIK NIJE PRIJAVLJEN (!token):
   *   - "Korisnik" = autentikacija: Prijava, Registracija.
   *   - "Kategorije" = pregledavanje kategorija usluga.
   *
   * DESNA STRANA KAD JE KORISNIK PRIJAVLJEN (token):
   *   - "Leadovi" (dropdown) = samo ako isProviderOrBusinessUser() (PROVIDER, ADMIN ili USER s legalStatusId).
   *     Stavke: Leadovi, Moji Leadovi, Lokacije timova, ROI, Pretplata, Fakture, Nadzorna ploča direktora.
   *   - Ime + uloga (badge) = tko je prijavljen.
   *   - "Moj račun" (dropdown) = osobni prostor: Traži poslove, Moji poslovi, Pružatelji, Chat, Moj profil;
   *     "Postani pružatelj" samo ako canShowPostaniPružatelj() (USER koji već ima legalStatusId);
   *     Odjava na dnu s vizualnom odvojenošću (border-top).
   *
   * Pomoćne funkcije:
   *   - isProviderOrBusinessUser() = PROVIDER | ADMIN | (USER && legalStatusId).
   *   - isProvider() = PROVIDER | ADMIN (npr. za prikaz Cjenika).
   *   - canShowPostaniPružatelj() = USER && legalStatusId (pravna osoba koja može postati pružatelj).
   */

  return (
    <div
      className={
        'relative p-6 max-w-5xl mx-auto min-h-screen safe-area-x transition-colors bg-gradient-to-b from-stone-50/95 via-amber-50/50 to-orange-50/70 dark:from-gray-900 dark:to-gray-900' +
        (isDocsScreenshotMode ? ' w-full max-w-full min-w-0 overflow-x-hidden' : '')
      }
    >
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="skip-link"
        aria-label="Preskoči na glavni sadržaj"
      >
        Preskoči na glavni sadržaj
      </a>

      <header
        className="sticky top-4 z-30 mb-4 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-stone-50/95 px-4 py-3 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 overflow-visible lg:flex-nowrap"
        role="banner"
      >
        <Logo size="md" />
        <div className="flex items-center gap-3">
          {token && isProviderOrBusinessUser() && <CreditsWidget />}
        </div>
        {/* Desktop Navigation */}
        <nav
          className="hidden flex-1 items-center justify-between gap-8 px-2 lg:flex overflow-visible"
          role="navigation"
          aria-label="Glavna navigacija"
        >
          <div className="flex items-center gap-6">
            {/* Main Navigation */}
            <button
              className={
                navLinkBase +
                ' ' +
                (tab === 'time-landing' ? navLinkActive : navLinkInactive)
              }
              onClick={() => {
                if (window.location.pathname.startsWith('/admin/')) {
                  window.location.replace('/#time-landing');
                } else {
                  setTab('time-landing');
                }
              }}
              aria-label="Početna stranica"
              aria-current={tab === 'time-landing' ? 'page' : undefined}
            >
              Početna
            </button>
            <button
              className={
                navLinkBase +
                ' ' +
                (tab === 'user' ? navLinkActive : navLinkInactive)
              }
              onClick={() => {
                if (window.location.pathname.startsWith('/admin/')) {
                  window.location.replace('/#user');
                } else {
                  setTab('user');
                }
              }}
              aria-label="Traži poslove"
              aria-current={tab === 'user' ? 'page' : undefined}
            >
              Traži poslove
            </button>
            {(!token || isProvider()) && (
              <button
                className={
                  navLinkBase +
                  ' ' +
                  (tab === 'pricing' ? navLinkActive : navLinkInactive)
                }
                onClick={() => {
                  if (window.location.pathname.startsWith('/admin/')) {
                    window.location.replace('/#pricing');
                  } else {
                    setTab('pricing');
                  }
                }}
                aria-label="Cjenik"
                aria-current={tab === 'pricing' ? 'page' : undefined}
              >
                Cjenik
              </button>
            )}
            <button
              className={
                navLinkBase +
                ' ' +
                (tab === 'faq' ? navLinkActiveFaq : navLinkInactive)
              }
              onClick={() => {
                if (window.location.pathname.startsWith('/admin/')) {
                  window.location.replace('/#faq');
                } else {
                  setTab('faq');
                }
              }}
              aria-label="Često postavljana pitanja"
              aria-current={tab === 'faq' ? 'page' : undefined}
            >
              FAQ
            </button>
            <button
              className={
                navLinkBase +
                ' ' +
                (tab === 'contact' ? navLinkActive : navLinkInactive)
              }
              onClick={() => {
                if (window.location.pathname.startsWith('/admin/')) {
                  window.location.replace('/#contact');
                } else {
                  setTab('contact');
                }
              }}
              aria-label="Kontakt"
              aria-current={tab === 'contact' ? 'page' : undefined}
            >
              Kontakt
            </button>
            {/* Secondary pages grouped u dropdown */}
            <DropdownMenu title="Više" className={navLinkBase + ' ' + navLinkInactive}>
              <div className="pt-2 first:pt-0">
                <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Informacije</div>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors duration-150"
                  onClick={() => {
                    if (window.location.pathname.startsWith('/admin/')) {
                      window.location.replace('/#documentation');
                    } else {
                      setTab('documentation');
                    }
                  }}
                >
                  📚 Dokumentacija
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors duration-150"
                  onClick={() => {
                    if (window.location.pathname.startsWith('/admin/')) {
                      window.location.replace('/#about');
                    } else {
                      setTab('about');
                    }
                  }}
                >
                  🏢 O nama
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors duration-150"
                  onClick={() => {
                    if (window.location.pathname.startsWith('/admin/')) {
                      window.location.replace('/#user-types-flowcharts');
                    } else {
                      setTab('user-types-flowcharts');
                    }
                  }}
                >
                  📊 Dijagrami procesa
                </button>
              </div>
              <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-700">
                <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Postavke</div>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                  onClick={() => { toggleDarkMode(); }}
                  aria-label={isDarkMode ? 'Svijetli način' : 'Tamni način'}
                >
                  {isDarkMode ? '☀️' : '🌙'} {isDarkMode ? 'Svijetli način' : 'Tamni način'}
                </button>
              </div>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4 overflow-visible">
            {/* Dropdown Menus */}
            {!token && (
              <>
                <DropdownMenu title="Korisnik" className={navLinkBase + ' ' + navLinkInactive}>
                  <div className="pt-2 first:pt-0">
                    <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pristup</div>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                      onClick={() => {
                        if (window.location.pathname.startsWith('/admin/')) {
                          window.location.replace('/#login');
                        } else {
                          setTab('login');
                        }
                      }}
                    >
                      🔑 Prijava
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                      onClick={() => {
                        if (window.location.pathname.startsWith('/admin/')) {
                          window.location.replace('/#register-user');
                        } else {
                          setTab('register-user');
                        }
                      }}
                    >
                      👤 Registracija
                    </button>
                  </div>
                </DropdownMenu>

                <DropdownMenu title="Kategorije" className={navLinkBase + ' ' + navLinkInactive}>
                  <div className="pt-2 first:pt-0">
                    <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Katalog</div>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                      onClick={() => {
                        if (window.location.pathname.startsWith('/admin/')) {
                          window.location.replace('/#categories');
                        } else {
                          setTab('categories');
                        }
                      }}
                    >
                      🛠️ Kategorije ({categories.length})
                    </button>
                  </div>
                </DropdownMenu>
              </>
            )}

            {token && (
              <>
                {/* Leadovi dropdown - samo za PROVIDER-e i USER-e koji su tvrtke/obrti */}
                {isProviderOrBusinessUser() && (
                  <DropdownMenu title="Leadovi" className={navLinkBase + ' ' + navLinkInactive}>
                    {/* Group: Leadovi */}
                    <div className="pt-2 first:pt-0">
                      <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Leadovi</div>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                        onClick={() => { setTab('leads'); }}
                      >
                        🛒 Tržnica leadova
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                        onClick={() => { setTab('my-leads'); }}
                      >
                        📋 Moji ekskluzivni leadovi
                      </button>
                    </div>
                    {/* Group: Komunikacija i analitika */}
                    <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-700">
                      <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Komunikacija i analitika</div>
                      <button
                        className={'w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ' + (tab === 'chat' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200')}
                        onClick={() => { setTab('chat'); }}
                        aria-label="Chat"
                      >
                        💬 Chat
                        {chatWaitingCount > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100 px-2 py-0.5 text-[10px] font-semibold">
                            {chatWaitingCount > 9 ? '9+' : chatWaitingCount}
                          </span>
                        )}
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                        onClick={() => { setTab('roi'); }}
                      >
                        📊 ROI
                      </button>
                    </div>
                    {/* Group: Tim – samo ako postoji bar jedna stavka */}
                    {(providerMeta.hasTeam || providerMeta.isDirector) && (
                      <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-700">
                        <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tim</div>
                        {providerMeta.hasTeam && (
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                            onClick={() => { setTab('team-locations'); }}
                          >
                            📍 Lokacije timova
                          </button>
                        )}
                        {providerMeta.isDirector && (
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                            onClick={() => { setTab('director'); }}
                          >
                            👔 Nadzorna ploča direktora
                          </button>
                        )}
                      </div>
                    )}
                    {/* Group: Pretplata i naplata */}
                    <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-700">
                      <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pretplata i naplata</div>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                        onClick={() => { setTab('subscription'); }}
                      >
                        💳 Pretplata
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                        onClick={() => { setTab('invoices'); }}
                      >
                        📄 Fakture
                      </button>
                    </div>
                  </DropdownMenu>
                )}

                {/* Moj račun – ime korisnika unutar okvira, iznad stavki menija */}
                <DropdownMenu
                  title="Moj račun"
                  className={navLinkBase + ' ' + (['user', 'my-jobs', 'providers', 'chat', 'provider-profile', 'user-profile', 'upgrade-to-provider'].includes(tab) ? navLinkActive : navLinkInactive)}
                >
                  {(() => {
                    try {
                      const u = JSON.parse(localStorage.getItem('user') || '{}');
                      const name = u.companyName || u.fullName || u.email || null;
                      const roleLabel = u.role === 'PROVIDER' ? 'Pružatelj usluge' : 'Korisnik Usluge';
                      return name ? (
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={name}>
                            {name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{roleLabel}</p>
                        </div>
                      ) : null;
                    } catch { return null; }
                  })()}
                  <div className="pt-2 first:pt-0">
                    <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Navigacija</div>
                    <button
                      className={'w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ' + (tab === 'time-landing' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200')}
                      onClick={() => setTab('time-landing')}
                    >
                      🏠 Početna
                    </button>
                    <button
                      className={'w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ' + (tab === 'user' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200')}
                      onClick={() => setTab('user')}
                    >
                      🔍 Traži poslove
                    </button>
                    <button
                      className={'w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ' + (tab === 'my-jobs' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200')}
                      onClick={() => setTab('my-jobs')}
                    >
                      📋 Moji poslovi
                    </button>
                    <button
                      className={'w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ' + (tab === 'providers' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200')}
                      onClick={() => setTab('providers')}
                    >
                      👥 Pružatelji
                    </button>
                    {!isProviderOrBusinessUser() && (
                      <button
                        className={'w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ' + (tab === 'chat' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200')}
                        onClick={() => setTab('chat')}
                        aria-label="Chat"
                      >
                        💬 Chat
                        {chatWaitingCount > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100 px-2 py-0.5 text-[10px] font-semibold">
                            {chatWaitingCount > 9 ? '9+' : chatWaitingCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-700">
                    <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Račun</div>
                    <button
                      className={'w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ' + ((tab === 'provider-profile' || tab === 'user-profile') ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200')}
                      onClick={() => {
                        const storedUser = localStorage.getItem('user');
                        if (storedUser) {
                          try {
                            const userData = JSON.parse(storedUser);
                            setTab((userData.role === 'PROVIDER' || (userData.role === 'USER' && userData.legalStatusId)) ? 'provider-profile' : 'user-profile');
                          } catch {
                            setTab('user-profile');
                          }
                        } else {
                          setTab('user-profile');
                        }
                      }}
                    >
                      👤 Moj profil
                    </button>
                    {canShowPostaniPružatelj() && (
                      <button
                        className={'w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ' + (tab === 'upgrade-to-provider' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200')}
                        onClick={() => setTab('upgrade-to-provider')}
                      >
                        🏢 Postani pružatelj
                      </button>
                    )}
                  </div>
                  <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-700">
                    <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Postavke</div>
                    <button
                      className="w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                      onClick={() => { toggleDarkMode(); }}
                      aria-label={isDarkMode ? 'Svijetli način' : 'Tamni način'}
                    >
                      {isDarkMode ? '☀️' : '🌙'} {isDarkMode ? 'Svijetli način' : 'Tamni način'}
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300"
                      onClick={() => { logout(); setTab('time-landing'); }}
                      aria-label="Odjavi se"
                    >
                      🚪 Odjava
                    </button>
                  </div>
                </DropdownMenu>
              </>
            )}

          </div>
          
          {/* Admin Panel - skriven, pristup preko Ctrl+Shift+A ili #adm */}
        </nav>

        {/* Mobile Navigation */}
        <div className="lg:hidden basis-full flex w-full min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 max-[360px]:gap-1.5">
            <button
              className={'px-3 py-2 max-[360px]:px-2 max-[360px]:py-1.5 border rounded ' + (tab==='user' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100')}
              onClick={() => navigateToTab('user')}
            >
              🏠
            </button>
            {(!token || isProvider()) && (
              <button
                className={'px-3 py-2 max-[360px]:px-2 max-[360px]:py-1.5 border rounded ' + (tab==='pricing' ? 'bg-orange-600 text-white' : 'border-orange-600 text-orange-600')}
                onClick={() => navigateToTab('pricing')}
              >
                💰
              </button>
            )}
            <button
              className={'px-3 py-2 max-[360px]:px-2 max-[360px]:py-1.5 border rounded ' + (tab==='faq' ? 'bg-indigo-600 text-white' : 'border-indigo-600 text-indigo-600')}
              onClick={() => navigateToTab('faq')}
            >
              ❓
            </button>
            <button
              className={'px-3 py-2 max-[360px]:px-2 max-[360px]:py-1.5 border rounded ' + (tab==='documentation' ? 'bg-indigo-600 text-white' : 'border-indigo-600 text-indigo-600')}
              onClick={() => navigateToTab('documentation')}
            >
              📚
            </button>
            <button
              className={'px-3 py-2 max-[360px]:px-2 max-[360px]:py-1.5 border rounded ' + (tab==='about' ? 'bg-green-600 text-white' : 'border-green-600 text-green-600')}
              onClick={() => navigateToTab('about')}
            >
              🏢
            </button>
            <button
              className={'px-3 py-2 max-[360px]:px-2 max-[360px]:py-1.5 border rounded ' + (tab==='contact' ? 'bg-blue-600 text-white' : 'border-blue-600 text-blue-600')}
              onClick={() => navigateToTab('contact')}
            >
              📞
            </button>
            {/* Chat ikona - samo za korisnike usluge (pružatelji imaju Chat u Leadovi) */}
            {token && !isProviderOrBusinessUser() && (
              <button
                className={'px-3 py-2 max-[360px]:px-2 max-[360px]:py-1.5 border rounded ' + (tab==='chat' ? 'bg-indigo-600 text-white' : 'border-indigo-600 text-indigo-600')}
                onClick={() => navigateToTab('chat')}
                aria-label="Chat"
              >
                💬
                {chatWaitingCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100 px-1.5 py-0.5 text-[10px] font-semibold">
                    {chatWaitingCount > 9 ? '9+' : chatWaitingCount}
                  </span>
                )}
              </button>
            )}
            {token && (() => {
              try {
                const u = JSON.parse(localStorage.getItem('user') || '{}');
                const name = u.companyName || u.fullName || u.email || null;
                return name ? (
                  <span className="nav-user-badge-mobile" title={name}>
                    👤 {name}
                  </span>
                ) : null;
              } catch { return null; }
            })()}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
            className="px-3 py-2 max-[360px]:px-2 max-[360px]:py-1.5 border rounded hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            ☰
          </button>
          {/* Dark Mode Toggle - Mobile */}
          <button
            onClick={toggleDarkMode}
            className="px-3 py-2 max-[360px]:px-2 max-[360px]:py-1.5 border rounded hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            title={isDarkMode ? 'Prebaci na svijetli način' : 'Prebaci na tamni način'}
            aria-label={isDarkMode ? 'Disable dark mode' : 'Enable dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <div className="space-y-4">
          {/* Main Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Glavno</h3>
            <div className="space-y-1">
              <button
                className={'w-full text-left px-3 py-2 rounded transition-colors ' + (tab==='time-landing' ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300')}
                onClick={() => { setTab('time-landing'); setIsMobileMenuOpen(false); }}
              >
                🏠 Početna
              </button>
              <button
                className={'w-full text-left px-3 py-2 rounded transition-colors ' + (tab==='user' ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300')}
                onClick={() => { setTab('user'); setIsMobileMenuOpen(false); }}
              >
                🔍 Traži poslove
              </button>
              {(!token || isProvider()) && (
                <button
                  className={'w-full text-left px-3 py-2 rounded ' + (tab==='pricing' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700')}
                  onClick={() => { navigateToTab('pricing'); setIsMobileMenuOpen(false); }}
                >
                  💰 Cjenik
                </button>
              )}
              <button
                className={'w-full text-left px-3 py-2 rounded ' + (tab==='faq' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700')}
                onClick={() => { navigateToTab('faq'); setIsMobileMenuOpen(false); }}
              >
                ❓ FAQ
              </button>
              <button
                className={'w-full text-left px-3 py-2 rounded ' + (tab==='documentation' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700')}
                onClick={() => { navigateToTab('documentation'); setIsMobileMenuOpen(false); }}
              >
                📚 Dokumentacija
              </button>
              <button
                className={'w-full text-left px-3 py-2 rounded ' + (tab==='about' ? 'bg-green-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700')}
                onClick={() => { navigateToTab('about'); setIsMobileMenuOpen(false); }}
              >
                🏢 O nama
              </button>
              <button
                className={'w-full text-left px-3 py-2 rounded ' + (tab==='contact' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700')}
                onClick={() => { navigateToTab('contact'); setIsMobileMenuOpen(false); }}
              >
                📞 Kontakt
              </button>
            </div>
          </div>

          {/* User Section */}
          {!token && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Korisnici</h3>
              <div className="space-y-1">
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('login'); setIsMobileMenuOpen(false); }}
                >
                  🔑 Prijava
                </button>
              </div>
            </div>
          )}

          {/* Services Section */}
          {!token && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Kategorije</h3>
              <div className="space-y-1">
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('categories'); setIsMobileMenuOpen(false); }}
                >
                  🛠️ Kategorije ({categories.length})
                </button>
              </div>
            </div>
          )}

          {/* Provider Section - samo za PROVIDER-e i USER-e koji su tvrtke/obrti */}
          {token && isProviderOrBusinessUser() && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Leadovi</h3>
              <div className="space-y-1">
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('leads'); setIsMobileMenuOpen(false); }}
                >
                  🛒 Leadovi
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('my-leads'); setIsMobileMenuOpen(false); }}
                >
                  📋 Moji Leadovi
                </button>
                <button
                  className={'w-full text-left px-3 py-2 rounded transition-colors ' + (tab==='chat' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300')}
                  onClick={() => { setTab('chat'); setIsMobileMenuOpen(false); }}
                >
                  💬 Chat
                  {chatWaitingCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100 px-2 py-0.5 text-[10px] font-semibold">
                      {chatWaitingCount > 9 ? '9+' : chatWaitingCount}
                    </span>
                  )}
                </button>
                {providerMeta.hasTeam && (
                  <button
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                    onClick={() => { setTab('team-locations'); setIsMobileMenuOpen(false); }}
                  >
                    📍 Lokacije timova
                  </button>
                )}
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('roi'); setIsMobileMenuOpen(false); }}
                >
                  📊 ROI
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('subscription'); setIsMobileMenuOpen(false); }}
                >
                  💳 Pretplata
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('invoices'); setIsMobileMenuOpen(false); }}
                >
                  📄 Fakture
                </button>
                {providerMeta.isDirector && (
                  <button
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                    onClick={() => { setTab('director'); setIsMobileMenuOpen(false); }}
                  >
                    👔 Nadzorna ploča direktora
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dark Mode Toggle - samo za neprijavljene (prijavljeni imaju u Profil sekciji) */}
          {!token && (
          <div className="pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => { toggleDarkMode(); }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
            >
              {isDarkMode ? '☀️' : '🌙'}
              <span>{isDarkMode ? 'Svijetli način' : 'Tamni način'}</span>
            </button>
          </div>
          )}

          {/* Korisnik usluge sekcija - samo za USER-e bez legalStatusId */}
          {token && !isProviderOrBusinessUser() && (
            <div>
              {/* Ime korisnika unutar okvira, iznad stavki */}
              {(() => {
                try {
                  const u = JSON.parse(localStorage.getItem('user') || '{}');
                  const name = u.companyName || u.fullName || u.email || null;
                  const roleLabel = 'Korisnik Usluge';
                  return name ? (
                    <div className="px-4 py-3 mb-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={name}>
                        {name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{roleLabel}</p>
                    </div>
                  ) : null;
                } catch { return null; }
              })()}
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Moji Poslovi</h3>
              <div className="space-y-1">
                <button
                  className={'w-full text-left px-3 py-2 rounded transition-colors ' + (tab === 'time-landing' ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300')}
                  onClick={() => { setTab('time-landing'); setIsMobileMenuOpen(false); }}
                >
                  🏠 Početna
                </button>
                <button
                  className={'w-full text-left px-3 py-2 rounded transition-colors ' + (tab === 'user' ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300')}
                  onClick={() => { setTab('user'); setIsMobileMenuOpen(false); }}
                >
                  🔍 Traži poslove
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('my-jobs'); setIsMobileMenuOpen(false); }}
                >
                  📋 Moji poslovi
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('providers'); setIsMobileMenuOpen(false); }}
                >
                  👥 Pružatelji usluga
                </button>
              </div>
            </div>
          )}

          {/* Chat sekcija - samo za korisnike usluge (pružatelji imaju Chat u Leadovi) */}
          {token && !isProviderOrBusinessUser() && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Komunikacija</h3>
              <div className="space-y-1">
                <button
                  className={'w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ' + (tab==='chat' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300')}
                  onClick={() => { setTab('chat'); setIsMobileMenuOpen(false); }}
                >
                  💬 Chat
                  {chatWaitingCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100 px-2 py-0.5 text-[10px] font-semibold">
                      {chatWaitingCount > 9 ? '9+' : chatWaitingCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Profil sekcija - za sve prijavljene korisnike */}
          {token && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Profil</h3>
              <div className="space-y-1">
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => {
                    // Provjeri role iz localStorage
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                      try {
                        const userData = JSON.parse(storedUser);
                        // Ako je PROVIDER ili USER sa legalStatusId, prikaži provider profile
                        if (userData.role === 'PROVIDER' || (userData.role === 'USER' && userData.legalStatusId)) {
                          setTab('provider-profile');
                        } else {
                          setTab('user-profile');
                        }
                      } catch {
                        setTab('user-profile');
                      }
                    } else {
                      setTab('user-profile');
                    }
                    setIsMobileMenuOpen(false);
                  }}
                >
                  👤 Moj profil
                </button>
                
                {/* Postani pružatelj - samo za korisnike usluge koji su pravna osoba (imaju legalStatusId) */}
                {canShowPostaniPružatelj() && (
                  <button
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                    onClick={() => { setTab('upgrade-to-provider'); setIsMobileMenuOpen(false); }}
                  >
                    🏢 Postani pružatelj
                  </button>
                )}
                <button
                  onClick={() => { toggleDarkMode(); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
                  aria-label={isDarkMode ? 'Svijetli način' : 'Tamni način'}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                  <span>{isDarkMode ? 'Svijetli način' : 'Tamni način'}</span>
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300 transition-colors border-t border-gray-200 dark:border-gray-600 mt-1 pt-2"
                  onClick={() => { logout(); setTab('time-landing'); setIsMobileMenuOpen(false); }}
                  aria-label="Odjavi se"
                >
                  🚪 Odjava
                </button>
              </div>
            </div>
          )}

          {/* Admin Panel - skriven, pristup preko Ctrl+Shift+A ili #adm */}
        </div>
      </MobileMenu>

      <main id="main-content" role="main" aria-label="Glavni sadržaj">
      {docsScreenshotStamp && (
        <div className="fixed top-16 right-3 z-[80] pointer-events-none">
          <div className="px-2 py-1 rounded-md bg-black/80 text-white text-[10px] sm:text-xs font-semibold tracking-wide shadow-lg border border-white/20">
            DOCS STAMP: {docsScreenshotStamp}
          </div>
        </div>
      )}
      {tab === 'user' && (
        <section id="user" className="tab-section dark:text-gray-100" aria-labelledby="user-heading">
          <h2 id="user-heading" className="sr-only">Početna stranica</h2>

          {filters.categoryId && (!token || !isProviderOrBusinessUser()) && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Otvoreni poslovi
                  {categories.find(c => c.id === filters.categoryId)?.name && (
                    <span className="text-blue-600 dark:text-blue-400">
                      {' '}
                      — {categories.find(c => c.id === filters.categoryId).name}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, categoryId: '' }));
                  }}
                  className="text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Očisti filtar kategorije
                </button>
              </div>
              {jobs.length === 0 ? (
                <p className="text-center py-10 text-gray-600 dark:text-gray-400">
                  Trenutačno nema otvorenih poslova u ovoj kategoriji.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onViewDetails={handleViewJobDetails}
                      onMakeOffer={handleMakeOffer}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hero CTA Section - na vrhu */}
          {!token && (
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3">
                  🚀 Ekskluzivni Leadovi bez Konkurencije
                </h2>
                <p className="text-lg mb-4 opacity-90">
                  1 lead = 1 izvođač | Refund ako klijent ne odgovori
                </p>
                
                {/* Prednosti za korisnike i pružatelje */}
                <div className="grid md:grid-cols-2 gap-4 mb-6 text-left">
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <h3 className="text-base font-semibold mb-2">👥 Za Korisnike</h3>
                    <p className="text-sm opacity-90">
                      Brže pronalaženje kvalitetnih pružatelja usluga. Samo jedan kontakt, bez spam poruka.
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <h3 className="text-base font-semibold mb-2">🎯 Za Pružatelje</h3>
                    <p className="text-sm opacity-90">
                      Samo vi dobivate kontakt klijenta. Nema drugih izvođača koji konkuriraju za isti posao. Ako klijent ne odgovori u roku od 48 sati, automatski dobivate refund kredita.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setTab('pricing')}
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                  >
                    💰 Pogledaj Cjenik
                  </button>
                  <button
                    onClick={() => setTab('register-user')}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm"
                  >
                    🎯 Registriraj se kao Pružatelj
                  </button>
                </div>
                
                <div className="mt-4 text-xs opacity-75">
                  <p>✓ Ekskluzivni leadovi ✓ Refund sistem ✓ ROI statistika ✓ Prioritet prema bodovima</p>
                </div>
              </div>
            </div>
          )}

          {/* Sekcije za neregistrirane korisnike */}
          {!token && (
            <>
              {/* Kako radi - 4 koraka */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
                  Kako radi?
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
                    <div className="text-4xl mb-4">1️⃣</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Registriraj se
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Kreiraj besplatni račun kao korisnik ili pružatelj usluga
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
                    <div className="text-4xl mb-4">2️⃣</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Pronađi ili objavi
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Pretraži dostupne poslove ili objavi svoj posao i dobit ćeš ekskluzivne ponude
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
                    <div className="text-4xl mb-4">3️⃣</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Komuniciraj
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Chat direktno s pružateljem ili korisnikom, sve na jednom mjestu
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
                    <div className="text-4xl mb-4">4️⃣</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Završi posao
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Označi posao kao završen i ostavi recenziju za buduće korisnike
                    </p>
                  </div>
                </div>
              </div>

              {/* Popularne kategorije */}
              {categories.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
                    Popularne kategorije
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {categories
                      .filter(cat => cat.isActive && !cat.parentId)
                      .slice(0, 12)
                      .map(category => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setTab('register-user');
                          }}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow text-center group"
                        >
                          <div className="text-3xl mb-2">{getCategoryIcon(category)}</div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {category.name}
                          </h3>
                        </button>
                      ))}
                  </div>
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setTab('register-user')}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Vidi sve kategorije →
                    </button>
                  </div>
                </div>
              )}

              {/* Preview poslova - samo osnovni podaci */}
              {previewJobs.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
                    Najnoviji poslovi
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {previewJobs.map(job => {
                      const category = categories.find(cat => cat.id === job.categoryId);
                      return (
                        <div
                          key={job.id}
                          onClick={() => setTab('login')}
                          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{category ? getCategoryIcon(category) : '🔧'}</span>
                              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {category?.name || 'Kategorija'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(job.createdAt).toLocaleDateString('hr-HR')}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                            {job.title}
                          </h3>
                          {job.city && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              📍 {job.city}
                            </p>
                          )}
                          {job.budget && (
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {job.budget.toLocaleString('hr-HR')} €
                            </p>
                          )}
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              {token ? 'Prijavite se da vidite sve detalje' : 'Registriraj se da objaviš svoj posao ili vidiš detalje'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setTab('register-user')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Registriraj se i objavi svoj posao
                    </button>
                  </div>
                </div>
              )}

              {/* Testimonials */}
              <div className="mb-12 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
                  Što kažu korisnici?
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="text-2xl">⭐⭐⭐⭐⭐</div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                      "Brzo sam pronašao kvalitetnog majstora za renovaciju kupaonice. Ekskluzivni sistem znači da nema spam poruka!"
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        M
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Marko K.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Korisnik usluga</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="text-2xl">⭐⭐⭐⭐⭐</div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                      "Kao pružatelj usluga, volim ekskluzivne leadove. Nema konkurencije i klijenti su ozbiljniji. ROI mi je porastao za 40%!"
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        A
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Ana P.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pružatelj usluga</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="text-2xl">⭐⭐⭐⭐⭐</div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                      "Refund sistem je odličan! Ako klijent ne odgovori, automatski dobijem kredite natrag. To je pravedno."
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        I
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Ivan M.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pružatelj usluga</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Spremni za početak?
                </h2>
                <p className="text-lg mb-6 opacity-90">
                  Pridružite se tisućama zadovoljnih korisnika i pružatelja usluga
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setTab('register-user')}
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    ✨ Registriraj se besplatno
                  </button>
                  <button
                    onClick={() => setTab('pricing')}
                    className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors border-2 border-white"
                  >
                    💰 Pogledaj cjenik
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Pretraži poslove – samo za pružatelje (oni traže leadove) */}
          {token && isProviderOrBusinessUser() && (
            <div className="mb-8">
              {/* Pretraga - jedan jasan blok */}
              <div className="sticky top-0 z-40 bg-stone-50/98 dark:bg-gray-900 border-b border-stone-200/80 dark:border-gray-700 pb-6 mb-8 -mx-6 px-6 pt-5">
                <div className="max-w-4xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Pretraži poslove</h2>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 pl-11 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                          placeholder="Naslov, opis ili kategorija..."
                          value={q}
                          onChange={e => setQ(e.target.value)}
                        />
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        {showAdvancedFilters ? 'Zatvori' : 'Filteri'}
                      </button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
                      <select
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        value={filters.categoryId || ''}
                        onChange={e => setFilters(prev => ({ ...prev, categoryId: e.target.value || '' }))}
                      >
                        <option value="">Sve kategorije</option>
                        {categories.filter(cat => cat.isActive && !cat.parentId).map(cat => (
                          <option key={cat.id} value={String(cat.id)}>{getCategoryIcon(cat)} {cat.name}</option>
                        ))}
                      </select>
                      <input
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm w-40"
                        placeholder="Grad"
                        value={filters.city}
                        onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
                      />
                      <select
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        value={filters.sortBy}
                        onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      >
                        <option value="newest">Najnoviji</option>
                        <option value="oldest">Najstariji</option>
                        <option value="budgetHigh">Budžet: visok → nizak</option>
                        <option value="budgetLow">Budžet: nizak → visok</option>
                      </select>
                      {savedSearches.length > 0 && (
                        <select
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          onChange={e => {
                            if (e.target.value) {
                              const search = savedSearches.find(s => s.id === e.target.value);
                              if (search) {
                                setQ(search.searchQuery || '');
                                setFilters({ ...filters, ...search.filters });
                                api.post(`/saved-searches/${search.id}/use`).catch(() => {});
                              }
                            }
                            e.target.value = '';
                          }}
                        >
                          <option value="">Spremljene pretrage</option>
                          {savedSearches.map(search => (
                            <option key={search.id} value={search.id}>{search.name}</option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={async () => {
                          const name = prompt('Naziv pretrage:');
                          if (name) {
                            try {
                              await api.post('/saved-searches', { name, searchQuery: q, filters });
                              alert('Pretraga spremljena!');
                              const response = await api.get('/saved-searches');
                              setSavedSearches(response.data);
                            } catch (err) {
                              alert('Greška pri spremanju pretrage');
                            }
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Spremi pretragu
                      </button>
                    </div>
                  </div>

                  {/* Napredni filteri */}
                  {showAdvancedFilters && (
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Napredni filteri</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Min budžet (€)</label>
                          <input
                            type="number"
                            min={0}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
                            placeholder="0"
                            value={filters.budgetMin}
                            onChange={e => setFilters(prev => ({ ...prev, budgetMin: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max budžet (€)</label>
                          <input
                            type="number"
                            min={0}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
                            placeholder="∞"
                            value={filters.budgetMax}
                            onChange={e => setFilters(prev => ({ ...prev, budgetMax: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                          <select
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
                            value={filters.status}
                            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="">Svi statusi</option>
                            <option value="OPEN">Otvoren</option>
                            <option value="IN_PROGRESS">U tijeku</option>
                            <option value="COMPLETED">Završen</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Datum od</label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
                            value={filters.dateFrom}
                            onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

              {/* Nema "Pronađeno" ovdje - ide u Rezultati ispod */}

          {/* Job form modal - samo za prijavljene korisnike */}
          {token && showJobForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold dark:text-gray-100">Objavi novi posao</h3>
                  <button
                    onClick={() => setShowJobForm(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <JobForm
                  onSubmit={handleJobSubmit}
                  onCancel={() => setShowJobForm(false)}
                  categories={categories}
                />
              </div>
            </div>
          )}

          {/* Korisnik usluge – CTA Objavi posao + Moji poslovi (bez pretrage) */}
          {token && !isProviderOrBusinessUser() && (
            <div className="mt-6 p-6 md:p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="max-w-xl mx-auto text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Objavite svoj posao</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Opišite što vam treba i dobit ćete ponude od pouzdanih pružatelja usluga.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    Objavi posao
                  </button>
                  <button
                    onClick={() => setTab('my-jobs')}
                    className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Moji poslovi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Jobs grid/list - samo za pružatelje (oni pretražuju leadove) */}
          {token && isProviderOrBusinessUser() && (
            <>
              {/* Rezultati - jasna sekcija s headerom */}
              <section className="mt-2">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rezultati</h3>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium">
                      <span className="font-semibold">{jobs.length}</span>
                      <span>{jobs.length === 1 ? 'posao' : 'poslova'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={viewMode === 'grid' ? 'Prikaži kao listu' : 'Prikaži kao mrežu'}
                    >
                      {viewMode === 'grid' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      )}
                    </button>
                    <button
                      onClick={() => setShowJobForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      Objavi posao
                    </button>
                  </div>
                </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onViewDetails={handleViewJobDetails}
                      onMakeOffer={handleMakeOffer}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onViewDetails={handleViewJobDetails}
                      onMakeOffer={handleMakeOffer}
                    />
                  ))}
                </div>
              )}

              {jobs.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">Nema pronađenih poslova</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Promijenite filtere ili objavite novi posao</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        setQ('');
                        setFilters({ categoryId: '', city: '', budgetMin: '', budgetMax: '', status: '', sortBy: 'newest', dateFrom: '', dateTo: '' });
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Očisti filtere
                    </button>
                    <button
                      onClick={() => setShowJobForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Objavi posao
                    </button>
                  </div>
                </div>
              )}
              </section>
            </>
          )}
        </section>
      )}

      {tab === 'admin' && (
        <section id="admin" className="tab-section">
          <AdminRouter />
        </section>
      )}

      {tab === 'time-landing' && (
        <section id="time-landing" className="tab-section">
          <TimeLanding />
        </section>
      )}

      {tab === 'tools-catalog' && (
        <section id="tools-catalog" className="tab-section">
          <TimeLanding initialSection="tools-catalog" />
        </section>
      )}

      {tab === 'login' && (
        <section id="login" className="tab-section">
          <Login onSuccess={(token, user) => {
            saveToken(token);
            // Ako je u hash-u naveden redirect parametar (npr. #login?redirect=leads), poštuj ga
            let nextTab = 'user';
            const fullHash = window.location.hash?.slice(1) || '';
            if (fullHash.includes('?')) {
              const [, queryString] = fullHash.split('?');
              const params = new URLSearchParams(queryString);
              const redirect = params.get('redirect');
              if (redirect && validTabs.includes(redirect)) {
                nextTab = redirect;
                window.location.hash = `#${redirect}`;
              }
            }
            setTab(nextTab);
          }} />
        </section>
      )}

      {tab === 'register-user' && (
        <section id="register-user" className="tab-section">
          <UserRegister onSuccess={(token, user) => {
            saveToken(token);
            setTab('user');
          }} />
        </section>
      )}

      {/* register-provider redirects to register-user (UserRegister already allows choosing provider type) */}
      {tab === 'register-provider' && (
        <section id="register-provider" className="tab-section">
          <UserRegister onSuccess={(token, user) => {
            saveToken(token);
            setTab('user');
          }} />
        </section>
      )}

      {tab === 'provider-profile' && (
        <section id="provider-profile" className="tab-section">
          <ProviderProfile 
            onSuccess={() => {
              // Refresh data if needed
            }}
            onNavigate={(tabName) => {
              setTab(tabName);
            }} 
          />
        </section>
      )}

      {tab === 'user-profile' && (
        <section id="user-profile" className="tab-section">
          <UserProfile onNavigate={(tabName) => setTab(tabName)} />
        </section>
      )}

      {tab === 'verify' && (
        <section id="verify" className="tab-section">
          <VerifyEmail />
        </section>
      )}

      {tab === 'forgot-password' && (
        <section id="forgot-password" className="tab-section">
          <ForgotPassword />
        </section>
      )}

      {tab === 'reset-password' && (
        <section id="reset-password" className="tab-section">
          <ResetPassword />
        </section>
      )}

      {tab === 'upgrade-to-provider' && (
        <section id="upgrade-to-provider" className="tab-section">
          <UpgradeToProvider />
        </section>
      )}

      {/* USLUGAR EXCLUSIVE pages */}
      {tab === 'leads' && (
        <section id="leads" className="tab-section">
          <LeadMarketplace />
        </section>
      )}

      {tab === 'my-leads' && (
        <section id="my-leads" className="tab-section">
          <MyLeads isDirector={providerMeta.isDirector} />
        </section>
      )}

      {tab === 'my-jobs' && (
        <section id="my-jobs" className="tab-section">
          <MyJobs onNavigate={(tabName) => setTab(tabName)} categories={categories} />
        </section>
      )}

      {tab === 'team-locations' && (
        <section id="team-locations" className="tab-section">
          <TeamLocations />
        </section>
      )}

      {tab === 'roi' && (
        <section id="roi" className="tab-section">
          <ROIDashboard />
        </section>
      )}

      {tab === 'subscription' && (
        <section id="subscription" className="tab-section">
          <SubscriptionPlans />
        </section>
      )}

      {tab === 'director' && (
        <section id="director" className="tab-section">
          <DirectorDashboard />
        </section>
      )}

      {tab === 'invoices' && (
        <section id="invoices" className="tab-section">
          <Invoices />
        </section>
      )}

      {tab === 'subscription-success' && (
        <section id="subscription-success" className="tab-section">
          <PaymentSuccess setTab={setTab} />
        </section>
      )}

      {tab === 'categories' && (
        <section id="categories" className="tab-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                🛠️ Dostupne Kategorije Usluga
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Dinamički učitano iz baze: <span className="font-semibold text-green-600">{categories.length}</span> kategorija
              </p>
              <p className="text-sm text-gray-500">
                Gumb „Filtrirati poslove“ ili klik na podkategoriju otvara Traži poslove s odabranom kategorijom
              </p>
            </div>

            {/* Pretraga kategorija s označavanjem */}
            <div className="mb-6">
              <label htmlFor="category-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pretraži kategorije
              </label>
              <input
                id="category-search"
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Tipkajte za pretragu kategorija..."
                className="w-full max-w-md mx-auto block px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Glavne kategorije (bez parentId) */}
            <div className="space-y-8">
              {categories
                .filter(category => !category.parentId)
                .filter(parentCategory => {
                  if (!categorySearchQuery.trim()) return true;
                  const q = categorySearchQuery.trim().toLowerCase();
                  const nameMatch = parentCategory.name && parentCategory.name.toLowerCase().includes(q);
                  const descMatch = parentCategory.description && parentCategory.description.toLowerCase().includes(q);
                  const subMatch = categories.some(cat => cat.parentId === parentCategory.id && (cat.name?.toLowerCase().includes(q) || cat.description?.toLowerCase().includes(q)));
                  return nameMatch || descMatch || subMatch;
                })
                .map(parentCategory => {
                  const subcategories = categories.filter(cat => cat.parentId === parentCategory.id);
                  const q = categorySearchQuery.trim().toLowerCase();
                  const filteredSub = q ? subcategories.filter(sub => sub.name?.toLowerCase().includes(q) || sub.description?.toLowerCase().includes(q)) : subcategories;
                  
                  return (
                    <div key={parentCategory.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      {/* Glavna kategorija */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-3xl">
                          {getCategoryIcon(parentCategory)}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {highlightMatch(parentCategory.name, categorySearchQuery)}
                          </h2>
                          <p className="text-gray-600 mb-2">
                            {parentCategory.description ? highlightMatch(parentCategory.description, categorySearchQuery) : ''}
                          </p>
                          {parentCategory.requiresLicense && (
                            <div className="flex gap-2">
                              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                🔐 Licencirano
                              </span>
                              {parentCategory.licenseType && (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {parentCategory.licenseType}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => goToJobsFilteredByCategory(parentCategory.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Filtrirati poslove
                        </button>
                      </div>
                      
                      {/* Podkategorije */}
                      {filteredSub.length > 0 && (
                        <div className="border-t pt-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            📂 Podkategorije ({filteredSub.length})
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredSub.map(subcategory => (
                              <div 
                                key={subcategory.id} 
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    goToJobsFilteredByCategory(subcategory.id);
                                  }
                                }}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => goToJobsFilteredByCategory(subcategory.id)}
                              >
                                <div className="text-center">
                                  <div className="text-xl mb-1">
                                    {getCategoryIcon(subcategory)}
                                  </div>
                                  <h4 className="font-semibold text-xs text-gray-800 mb-1">
                                    {highlightMatch(subcategory.name, categorySearchQuery)}
                                  </h4>
                                  <p className="text-xs text-gray-600 overflow-hidden" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                    {subcategory.description ? highlightMatch(subcategory.description, categorySearchQuery) : ''}
                                  </p>
                                  {subcategory.requiresLicense && (
                                    <div className="mt-1">
                                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded-full">
                                        🔐
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
            
            {categories.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Učitavanje kategorija...</h3>
                <p className="text-gray-500">Molimo pričekajte dok se kategorije učitavaju iz baze podataka.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'providers' && (
        <section id="providers" className="tab-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                👥 Pružatelji Usluga
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                Pronađeno: <span className="font-semibold text-blue-600 dark:text-blue-400">{providers.length}</span> pružatelja
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Kliknite na pružatelja da vidite profil i recenzije
              </p>
            </div>
            
            {/* Provider Filter */}
            {platformInsights && (platformInsights.globalEtaFirstOfferMinutes != null || (platformInsights.topCategories && platformInsights.topCategories.length > 0)) && (
              <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50/90 dark:border-sky-800 dark:bg-sky-950/40 p-4 text-left text-sm text-slate-800 dark:text-slate-200">
                {platformInsights.globalEtaFirstOfferMinutes != null && (
                  <p>
                    <span className="font-semibold">Globalna procjena prve ponude (ETA):</span>{' '}
                    ~{platformInsights.globalEtaFirstOfferMinutes} min
                    {providerFilters.categoryId ? ' (za odabranu kategoriju iz baze)' : ' (prosjek aktivnih kategorija)'}
                  </p>
                )}
                {platformInsights.topCategories?.length > 0 && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Standardizirani orijentiri (top kategorije):</span>{' '}
                    {platformInsights.topCategories
                      .slice(0, 8)
                      .map((c) => {
                        const pr = [c.priceGuideMin, c.priceGuideMax].every((n) => n != null) ? ` ${c.priceGuideMin}–${c.priceGuideMax} €` : '';
                        const sum = c.standardPackageSummary ? ` — ${c.standardPackageSummary}` : '';
                        return `${c.name}${pr}${sum}`;
                      })
                      .join(' · ')}
                  </p>
                )}
              </div>
            )}

            <ProviderFilter
              filters={providerFilters}
              setFilters={setProviderFilters}
              categories={categories}
              onReset={() => {
                setProviderFilters({
                  search: null,
                  categoryId: null,
                  city: null,
                  minRating: null,
                  verified: null,
                  hasLicenses: null,
                  isAvailable: null,
                  sortBy: 'rating'
                });
                setProviderUserLocation(null);
              }}
              onUseMyLocation={() => {
                if (!navigator.geolocation) {
                  alert('Vaš preglednik ne podržava geolokaciju.');
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setProviderUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                    setProviderFilters((f) => ({ ...f, sortBy: 'distance' }));
                  },
                  () => alert('Nije moguće dohvatiti lokaciju. Provjerite dozvole preglednika.')
                );
              }}
            />
            
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setProvidersView('list')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${providersView === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                📋 Lista
              </button>
              <button
                type="button"
                onClick={() => setProvidersView('map')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${providersView === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                🗺️ Mapa
              </button>
            </div>
            
            {providersView === 'map' ? (
              <ProvidersMap
                providers={providers}
                onProviderClick={handleViewProviderProfile}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onViewProfile={handleViewProviderProfile}
                    onContact={handleContactProvider}
                  />
                ))}
              </div>
            )}
            
            {providers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nema pružatelja usluga</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {Object.values(providerFilters).some(v => v !== null && v !== 'rating')
                    ? 'Pokušajte promijeniti filtere ili ukloniti neke od kriterija pretrage'
                    : 'Trenutno nema registriranih pružatelja usluga'}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

              {tab === 'pricing' && (
          <section id="pricing" className="tab-section">
            <Pricing setTab={setTab} />
        </section>
      )}

      {tab === 'documentation' && (
        <section id="documentation" className="tab-section">
          <Documentation setTab={setTab} />
        </section>
      )}

      {tab === 'faq' && (
        <section id="faq" className="tab-section">
          <FAQ userType={isProvider() ? 'provider' : (token ? 'user' : 'guest')} />
        </section>
      )}

      {tab === 'about' && (
        <section id="about" className="tab-section">
          <About />
        </section>
      )}

      {tab === 'contact' && (
        <section id="contact" className="tab-section" aria-labelledby="contact-heading">
          <Contact />
        </section>
      )}

      {tab === 'user-types-flowcharts' && (
        <section id="user-types-flowcharts" className="tab-section">
          <UserTypesFlowcharts />
        </section>
      )}

      {tab === 'chat' && token && currentUserId && (
        <section id="chat" className="tab-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg"
              style={{ height: 'calc(100vh - 200px)', minHeight: '60vh' }}
            >
              <ChatList
                currentUserId={currentUserId}
                onClose={() => setTab('user')}
              />
            </div>
          </div>
        </section>
      )}

      {tab === 'chat' && !token && (
        <section id="chat" className="tab-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Morate se prijaviti</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Prijavite se da biste pristupili chatu.</p>
            <button
              onClick={() => setTab('login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Prijava
            </button>
          </div>
        </section>
      )}
      </main>

      {/* Job Detail Modal - otvara se kad korisnik klikne "Pregledaj detalje" */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedJob(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-detail-title"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 id="job-detail-title" className="text-xl font-semibold text-gray-900 dark:text-white pr-4">{selectedJob.title}</h2>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded"
                aria-label="Zatvori"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedJob.category && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Kategorija:</span>{' '}
                  <span>{getCategoryIcon(selectedJob.category)} {selectedJob.category.name}</span>
                </p>
              )}
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">Opis</p>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>
              {selectedJob.city && (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">📍 {selectedJob.city}</p>
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 mb-4">
                    <LocationMap
                      city={selectedJob.city}
                      latitude={selectedJob.latitude}
                      longitude={selectedJob.longitude}
                      label={selectedJob.title}
                      height="180px"
                    />
                  </div>
                </>
              )}
              {(selectedJob.budgetMin != null || selectedJob.budgetMax != null) && (
                <p className="text-gray-600 dark:text-gray-300">
                  💰 {selectedJob.budgetMin != null && selectedJob.budgetMax != null
                    ? `${selectedJob.budgetMin} - ${selectedJob.budgetMax} €`
                    : selectedJob.budgetMin != null
                      ? `Od ${selectedJob.budgetMin} €`
                      : `Do ${selectedJob.budgetMax} €`}
                </p>
              )}
              {selectedJob.deadline && (
                <p className="text-gray-600 dark:text-gray-300">
                  📅 Rok: {new Date(selectedJob.deadline).toLocaleDateString('hr-HR')}
                </p>
              )}
              {selectedJob.images && selectedJob.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(selectedJob.images) ? selectedJob.images : [])
                    .map((img) => (typeof img === 'string' ? img : img && img.url))
                    .filter(Boolean)
                    .map((url) => {
                      let src = url.startsWith('http') ? url : (api.defaults?.baseURL || '').replace(/\/api\/?$/, '') + (url.startsWith('/') ? url : '/' + url);
                      if (src.includes('/uploads/')) src = src.replace(/\/uploads\/([^/?#]+)/, '/api/upload/$1');
                      return src;
                    })
                    .map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Zatvori
              </button>
              {isProviderOrBusinessUser() && selectedJob.status === 'OPEN' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJob(null);
                    handleMakeOffer(selectedJob);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Pošalji ponudu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Offer Form Modal */}
      {showOfferForm && selectedJobForOffer && (
        <OfferForm
          job={selectedJobForOffer}
          onClose={() => {
            setShowOfferForm(false);
            setSelectedJobForOffer(null);
          }}
          onSuccess={() => {
            // Refresh jobs list if needed
            if (tab === 'user') {
              const params = {};
              if (q && String(q).trim()) params.q = String(q).trim();
              if (filters.categoryId) params.categoryId = filters.categoryId;
              if (filters.city && String(filters.city).trim()) params.city = String(filters.city).trim();
              if (filters.sortBy) params.sortBy = filters.sortBy;
              if (filters.budgetMin) params.minBudget = filters.budgetMin;
              if (filters.budgetMax) params.maxBudget = filters.budgetMax;
              if (filters.status) params.status = filters.status;
              if (filters.dateFrom) params.dateFrom = filters.dateFrom;
              if (filters.dateTo) params.dateTo = filters.dateTo;
              api.get('/jobs', { params }).then(r => setJobs(r.data)).catch(() => setJobs([]));
            }
          }}
        />
      )}

      {/* Provider Profile Modal */}
      {selectedProvider && (
        <ProviderProfileModal
          providerId={selectedProvider.userId || selectedProvider.user?.id}
          onClose={handleCloseProviderProfile}
          onNavigateToMyJobs={() => { handleCloseProviderProfile(); setTab('my-jobs'); }}
          scrollToAction={openProviderForContact}
        />
      )}

      {/* Session Expired Modal – zamjenjuje blocking alert, uvijek se može zatvoriti */}
      {showSessionExpiredModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-expired-title"
          onClick={() => setShowSessionExpiredModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4 border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="session-expired-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Sesija je istekla
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Vaša prijava je istekla. Radi sigurnosti se morate ponovno prijaviti prije nastavka.
            </p>
            <button
              type="button"
              onClick={() => setShowSessionExpiredModal(false)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              U redu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
