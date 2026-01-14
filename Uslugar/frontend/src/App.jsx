import React, { useEffect, useState } from 'react';
import api from '@/api'
import { AdminRouter } from './admin';
import JobCard from './components/JobCard';
import JobForm from './components/JobForm';
import ProviderCard from './components/ProviderCard';
import ProviderFilter from './components/ProviderFilter';
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
import UserTypesOverview from './pages/UserTypesOverview';
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
import { useDarkMode } from './contexts/DarkModeContext.jsx';

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  function saveToken(t) { localStorage.setItem('token', t); setToken(t); }
  function logout(){ localStorage.removeItem('token'); setToken(null); }
  return { token, saveToken, logout };
}

export default function App(){
  const { token, saveToken, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
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

  // TAB: 'user' | 'admin' | 'login' | 'register-user' | 'upgrade-to-provider' | 'verify' | 'forgot-password' | 'reset-password' | 'leads' | 'my-leads' | 'roi' | 'subscription' | 'pricing' | 'providers' | 'documentation' | 'faq'
  // Note: 'register-provider' is kept in validTabs for backward compatibility but redirects to 'register-user'
  const [tab, setTab] = useState(() => {
    // Provjeri pathname za admin panel (BrowserRouter koristi pathname, ne hash)
    const pathname = window.location.pathname;
    if (pathname.startsWith('/admin/')) {
      return 'admin';
    }
    
    // Inače koristi hash-based routing
    const hash = window.location.hash?.slice(1).split('?')[0];
    // Obfuscated admin panel pristup: #adm -> admin
    const normalizedHash = hash === 'adm' ? 'admin' : hash;
    const validTabs = ['admin', 'login', 'register-user', 'register-provider', 'provider-profile', 'user-profile', 'upgrade-to-provider', 'verify', 'forgot-password', 'reset-password', 'leads', 'my-leads', 'my-jobs', 'roi', 'subscription', 'subscription-success', 'pricing', 'providers', 'documentation', 'faq', 'about', 'contact', 'time-landing', 'team-locations', 'invoices', 'user', 'user-types', 'user-types-flowcharts', 'director', 'chat'];
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
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (tab !== 'user') return;
    
    // Dohvati poslove s filterima (samo za prijavljene korisnike)
    if (token) {
      const params = { q, ...filters };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      api.get('/jobs', { params }).then(r => setJobs(r.data)).catch(() => setJobs([]));
    } else {
      // Za neregistrirane korisnike - dohvati samo preview (prvih 6 najnovijih)
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

  useEffect(() => {
    if (tab !== 'providers') return;
    
    // Dohvati providere s API-ja s filterima
    const params = { ...providerFilters };
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });
    
    api.get('/providers', { params })
      .then(r => {
        setProviders(r.data);
      })
      .catch(err => {
        console.error('Error fetching providers:', err);
        setProviders([]);
      });
  }, [tab, providerFilters]);

  const handleJobSubmit = async (jobData) => {
    try {
      const response = await api.post('/jobs', jobData);
      setJobs(prev => [response.data, ...prev]);
      setShowJobForm(false);
      alert('Posao uspješno objavljen!');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Greška pri objavljivanju posla');
    }
  };

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
  };

  const handleViewProviderProfile = (provider) => {
    setSelectedProvider(provider);
  };

  const handleCloseProviderProfile = () => {
    setSelectedProvider(null);
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
    // TODO: Implementirati chat ili kontakt
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
      const validTabs = ['admin', 'login', 'register-user', 'register-provider', 'provider-profile', 'user-profile', 'upgrade-to-provider', 'verify', 'forgot-password', 'reset-password', 'leads', 'my-leads', 'my-jobs', 'roi', 'subscription', 'subscription-success', 'pricing', 'providers', 'documentation', 'faq', 'about', 'contact', 'time-landing', 'team-locations', 'invoices', 'user', 'user-types', 'user-types-flowcharts', 'director', 'chat'];
      
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

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="skip-link"
        aria-label="Preskoči na glavni sadržaj"
      >
        Preskoči na glavni sadržaj
      </a>

      <header className="flex items-center justify-between" role="banner">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Uslugar <span className="text-green-600 dark:text-green-400">EXCLUSIVE</span>
        </h1>
        <div className="flex items-center gap-3">
          {token && isProviderOrBusinessUser() && <CreditsWidget />}
          {token ? (
            <button 
              className="px-4 py-2 border rounded hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors" 
              onClick={logout}
              aria-label="Odjavi se"
            >
              Logout
            </button>
          ) : null}
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="mt-6 mb-4" role="navigation" aria-label="Glavna navigacija">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Main Navigation */}
          <button
            className={'px-3 py-2 border rounded transition-colors ' + (tab==='user' ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300')}
            onClick={() => {
              if (window.location.pathname.startsWith('/admin/')) {
                window.location.replace('/#user');
              } else {
                setTab('user');
              }
            }}
            aria-label="Početna stranica"
            aria-current={tab === 'user' ? 'page' : undefined}
          >
            🏠 Početna
          </button>
          <button
            className={'px-3 py-2 border rounded transition-colors ' + (tab==='pricing' ? 'bg-orange-600 text-white' : 'border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-900/20')}
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
            💰 Cjenik
          </button>
          <button
            className={'px-3 py-2 border rounded transition-colors ' + (tab==='faq' ? 'bg-purple-600 text-white' : 'border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-purple-900/20')}
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
            ❓ FAQ
          </button>
          <button
            className={'px-3 py-2 border rounded transition-colors ' + (tab==='documentation' ? 'bg-indigo-600 text-white' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/20')}
            onClick={() => {
              if (window.location.pathname.startsWith('/admin/')) {
                window.location.replace('/#documentation');
              } else {
                setTab('documentation');
              }
            }}
            aria-label="Dokumentacija"
            aria-current={tab === 'documentation' ? 'page' : undefined}
          >
            📚 Dokumentacija
          </button>
          <button
            className={'px-3 py-2 border rounded transition-colors ' + (tab==='about' ? 'bg-green-600 text-white' : 'border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/20')}
            onClick={() => {
              if (window.location.pathname.startsWith('/admin/')) {
                window.location.replace('/#about');
              } else {
                setTab('about');
              }
            }}
            aria-label="O nama"
            aria-current={tab === 'about' ? 'page' : undefined}
          >
            🏢 O nama
          </button>
          <button
            className={'px-3 py-2 border rounded transition-colors ' + (tab==='contact' ? 'bg-blue-600 text-white' : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20')}
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
            📞 Kontakt
          </button>
          <button
            className={'px-3 py-2 border rounded transition-colors ' + (tab==='user-types' ? 'bg-teal-600 text-white' : 'border-teal-600 text-teal-600 hover:bg-teal-50 dark:border-teal-500 dark:text-teal-400 dark:hover:bg-teal-900/20')}
            onClick={() => {
              if (window.location.pathname.startsWith('/admin/')) {
                window.location.replace('/#user-types');
              } else {
                setTab('user-types');
              }
            }}
            aria-label="Tipovi korisnika"
            aria-current={tab === 'user-types' ? 'page' : undefined}
          >
            👥 Tipovi Korisnika
          </button>
          <button
            className={'px-3 py-2 border rounded transition-colors ' + (tab==='user-types-flowcharts' ? 'bg-indigo-600 text-white' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/20')}
            onClick={() => {
              if (window.location.pathname.startsWith('/admin/')) {
                window.location.replace('/#user-types-flowcharts');
              } else {
                setTab('user-types-flowcharts');
              }
            }}
            aria-label="Dijagrami procesa"
            aria-current={tab === 'user-types-flowcharts' ? 'page' : undefined}
          >
            📊 Dijagrami Procesa
          </button>

          {/* Dropdown Menus */}
          {!token && (
            <>
              <DropdownMenu title="👤 Korisnik" icon="👤">
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
              </DropdownMenu>

              <DropdownMenu title="🛠️ Usluge" icon="🛠️">
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
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-150"
                  onClick={() => {
                    if (window.location.pathname.startsWith('/admin/')) {
                      window.location.replace('/#providers');
                    } else {
                      setTab('providers');
                    }
                  }}
                >
                  👥 Pružatelji ({providers.length})
                </button>
              </DropdownMenu>
            </>
          )}

          {token && (
            <>
              {/* Leadovi dropdown - samo za PROVIDER-e i USER-e koji su tvrtke/obrti */}
              {isProviderOrBusinessUser() && (
                <DropdownMenu title="🛒 Leadovi" icon="🛒">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { setTab('leads'); }}
                  >
                    🛒 Leadovi
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { setTab('my-leads'); }}
                  >
                    📋 Moji Leadovi
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { setTab('team-locations'); }}
                  >
                    📍 Tim Lokacije
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { setTab('roi'); }}
                  >
                    📊 ROI
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { setTab('subscription'); }}
                  >
                    💳 Pretplata
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { setTab('invoices'); }}
                  >
                    📄 Fakture
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { setTab('director'); }}
                  >
                    👔 Direktor Dashboard
                  </button>
                </DropdownMenu>
              )}

              {/* Korisnik usluge linkovi - samo za USER-e bez legalStatusId */}
              {token && !isProviderOrBusinessUser() && (
                <>
                  <button
                    className={'px-3 py-2 border rounded ' + (tab==='user' ? 'bg-green-600 text-white' : 'border-green-600 text-green-600 hover:bg-green-50')}
                    onClick={() => setTab('user')}
                  >
                    🏠 Traži usluge
                  </button>
                  <button
                    className={'px-3 py-2 border rounded ' + (tab==='my-jobs' ? 'bg-blue-600 text-white' : 'border-blue-600 text-blue-600 hover:bg-blue-50')}
                    onClick={() => setTab('my-jobs')}
                  >
                    📋 Moji poslovi
                  </button>
                  <button
                    className={'px-3 py-2 border rounded ' + (tab==='providers' ? 'bg-purple-600 text-white' : 'border-purple-600 text-purple-600 hover:bg-purple-50')}
                    onClick={() => setTab('providers')}
                  >
                    👥 Pružatelji
                  </button>
                </>
              )}

              {/* Chat gumb - za sve prijavljene korisnike */}
              {token && (
                <button
                  className={'px-3 py-2 border rounded transition-colors ' + (tab==='chat' ? 'bg-indigo-600 text-white' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/20')}
                  onClick={() => setTab('chat')}
                  aria-label="Chat"
                >
                  💬 Chat
                </button>
              )}

              <button
                className={'px-3 py-2 border rounded ' + ((tab==='provider-profile' || tab==='user-profile') ? 'bg-blue-600 text-white' : 'border-blue-600 text-blue-600 hover:bg-blue-50')}
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
                }}
              >
                👤 Moj profil
              </button>
              
              {/* Postani pružatelj - samo za USER-e bez legalStatusId */}
              {token && !isProviderOrBusinessUser() && (
                <button
                  className={'px-3 py-2 border rounded ' + (tab==='upgrade-to-provider' ? 'bg-purple-600 text-white' : 'border-purple-600 text-purple-600 hover:bg-purple-50')}
                  onClick={() => setTab('upgrade-to-provider')}
                >
                  🏢 Postani pružatelj
                </button>
              )}
            </>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="px-3 py-2 border rounded dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100 transition-colors"
            title={isDarkMode ? 'Prebaci na svijetli način' : 'Prebaci na tamni način'}
            aria-label={isDarkMode ? 'Disable dark mode' : 'Enable dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Admin Panel - skriven, pristup preko Ctrl+Shift+A ili #adm */}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className={'px-3 py-2 border rounded ' + (tab==='user' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100')}
              onClick={() => navigateToTab('user')}
            >
              🏠
            </button>
            <button
              className={'px-3 py-2 border rounded ' + (tab==='pricing' ? 'bg-orange-600 text-white' : 'border-orange-600 text-orange-600')}
              onClick={() => navigateToTab('pricing')}
            >
              💰
            </button>
            <button
              className={'px-3 py-2 border rounded ' + (tab==='faq' ? 'bg-purple-600 text-white' : 'border-purple-600 text-purple-600')}
              onClick={() => navigateToTab('faq')}
            >
              ❓
            </button>
            <button
              className={'px-3 py-2 border rounded ' + (tab==='documentation' ? 'bg-indigo-600 text-white' : 'border-indigo-600 text-indigo-600')}
              onClick={() => navigateToTab('documentation')}
            >
              📚
            </button>
            <button
              className={'px-3 py-2 border rounded ' + (tab==='about' ? 'bg-green-600 text-white' : 'border-green-600 text-green-600')}
              onClick={() => navigateToTab('about')}
            >
              🏢
            </button>
            <button
              className={'px-3 py-2 border rounded ' + (tab==='contact' ? 'bg-blue-600 text-white' : 'border-blue-600 text-blue-600')}
              onClick={() => navigateToTab('contact')}
            >
              📞
            </button>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="px-3 py-2 border rounded hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            ☰
          </button>
          {/* Dark Mode Toggle - Mobile */}
          <button
            onClick={toggleDarkMode}
            className="px-3 py-2 border rounded dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100 transition-colors"
            title={isDarkMode ? 'Prebaci na svijetli način' : 'Prebaci na tamni način'}
            aria-label={isDarkMode ? 'Disable dark mode' : 'Enable dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

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
                className={'w-full text-left px-3 py-2 rounded transition-colors ' + (tab==='user' ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300')}
                onClick={() => { navigateToTab('user'); setIsMobileMenuOpen(false); }}
              >
                🏠 Početna
              </button>
              <button
                className={'w-full text-left px-3 py-2 rounded ' + (tab==='pricing' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100')}
                onClick={() => { navigateToTab('pricing'); setIsMobileMenuOpen(false); }}
              >
                💰 Cjenik
              </button>
              <button
                className={'w-full text-left px-3 py-2 rounded ' + (tab==='faq' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100')}
                onClick={() => { navigateToTab('faq'); setIsMobileMenuOpen(false); }}
              >
                ❓ FAQ
              </button>
              <button
                className={'w-full text-left px-3 py-2 rounded ' + (tab==='documentation' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100')}
                onClick={() => { navigateToTab('documentation'); setIsMobileMenuOpen(false); }}
              >
                📚 Dokumentacija
              </button>
              <button
                className={'w-full text-left px-3 py-2 rounded ' + (tab==='about' ? 'bg-green-600 text-white' : 'hover:bg-gray-100')}
                onClick={() => { navigateToTab('about'); setIsMobileMenuOpen(false); }}
              >
                🏢 O nama
              </button>
              <button
                className={'w-full text-left px-3 py-2 rounded ' + (tab==='contact' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100')}
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
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Usluge</h3>
              <div className="space-y-1">
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('categories'); setIsMobileMenuOpen(false); }}
                >
                  🛠️ Kategorije ({categories.length})
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('providers'); setIsMobileMenuOpen(false); }}
                >
                  👥 Pružatelji ({providers.length})
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
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('team-locations'); setIsMobileMenuOpen(false); }}
                >
                  📍 Tim Lokacije
                </button>
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
              </div>
            </div>
          )}

          {/* Dark Mode Toggle - Mobile Menu */}
          <div className="pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => { toggleDarkMode(); }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
            >
              {isDarkMode ? '☀️' : '🌙'}
              <span>{isDarkMode ? 'Svijetli način' : 'Tamni način'}</span>
            </button>
          </div>

          {/* Korisnik usluge sekcija - samo za USER-e bez legalStatusId */}
          {token && !isProviderOrBusinessUser() && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Moji Poslovi</h3>
              <div className="space-y-1">
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => { setTab('user'); setIsMobileMenuOpen(false); }}
                >
                  🏠 Traži usluge
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

          {/* Chat sekcija - za sve prijavljene korisnike */}
          {token && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Komunikacija</h3>
              <div className="space-y-1">
                <button
                  className={'w-full text-left px-3 py-2 rounded transition-colors ' + (tab==='chat' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300')}
                  onClick={() => { setTab('chat'); setIsMobileMenuOpen(false); }}
                >
                  💬 Chat
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
                
                {/* Postani pružatelj - samo za USER-e bez legalStatusId */}
                {!isProviderOrBusinessUser() && (
                  <button
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                    onClick={() => { setTab('upgrade-to-provider'); setIsMobileMenuOpen(false); }}
                  >
                    🏢 Postani pružatelj
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Admin Panel - skriven, pristup preko Ctrl+Shift+A ili #adm */}
        </div>
      </MobileMenu>

      <main id="main-content" role="main" aria-label="Glavni sadržaj">
      {tab === 'user' && (
        <section id="user" className="tab-section dark:text-gray-100" aria-labelledby="user-heading">
          <h2 id="user-heading" className="sr-only">Početna stranica</h2>
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
                  <p>✓ Ekskluzivni leadovi ✓ Refund sistem ✓ ROI statistika ✓ AI prioritet</p>
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
                          <div className="text-3xl mb-2">{category.icon || '🔧'}</div>
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
                              <span className="text-2xl">{category?.icon || '🔧'}</span>
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

          {/* Moderna tražilica - glavni fokus za prijavljene korisnike */}
          {token && (
            <div className="mb-8">
              {/* Hero Search Bar - sticky na vrhu */}
              <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 -mx-6 px-6 pt-4">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      🔍 Pretraži poslove
                    </h1>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="px-3 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={viewMode === 'grid' ? 'Lista' : 'Grid'}
                      >
                        {viewMode === 'grid' ? '📋' : '🔲'}
                      </button>
                      <button
                        onClick={() => setShowJobForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        + Objavi posao
                      </button>
                    </div>
                  </div>

                  {/* Glavna tražilica */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 pl-12 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                          placeholder="Pretraži poslove po naslovu, opisu, kategoriji..."
                          value={q}
                          onChange={e => setQ(e.target.value)}
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                      </div>
                      <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                      >
                        {showAdvancedFilters ? '✕ Zatvori' : '⚙️ Filteri'}
                      </button>
                    </div>

                    {/* Quick filters */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <select
                        className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm"
                        value={filters.categoryId}
                        onChange={e => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                      >
                        <option value="">🏷️ Sve kategorije</option>
                        {categories.filter(cat => cat.isActive && !cat.parentId).map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                      <input
                        className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm"
                        placeholder="📍 Grad"
                        value={filters.city}
                        onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
                      />
                      <select
                        className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm"
                        value={filters.sortBy}
                        onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      >
                        <option value="newest">🕐 Najnoviji</option>
                        <option value="oldest">📅 Najstariji</option>
                        <option value="budgetHigh">💰 Budžet: Visok → Nizak</option>
                        <option value="budgetLow">💰 Budžet: Nizak → Visok</option>
                      </select>
                      {savedSearches.length > 0 && (
                        <select
                          className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm"
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
                          <option value="">💾 Spremljene pretrage</option>
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
                              await api.post('/saved-searches', {
                                name,
                                searchQuery: q,
                                filters
                              });
                              alert('Pretraga spremljena!');
                              const response = await api.get('/saved-searches');
                              setSavedSearches(response.data);
                            } catch (err) {
                              alert('Greška pri spremanju pretrage');
                            }
                          }
                        }}
                        className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm font-medium"
                        title="Spremi trenutnu pretragu"
                      >
                        💾 Spremi pretragu
                      </button>
                    </div>
                  </div>

                  {/* Napredni filteri */}
                  {showAdvancedFilters && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Napredni filteri</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min budžet (€)</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                            placeholder="0"
                            value={filters.budgetMin}
                            onChange={e => setFilters(prev => ({ ...prev, budgetMin: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max budžet (€)</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                            placeholder="∞"
                            value={filters.budgetMax}
                            onChange={e => setFilters(prev => ({ ...prev, budgetMax: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                          <select
                            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                            value={filters.status}
                            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="">Svi statusi</option>
                            <option value="OPEN">🟢 Otvoren</option>
                            <option value="IN_PROGRESS">🟡 U tijeku</option>
                            <option value="COMPLETED">✅ Završen</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum od</label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                            value={filters.dateFrom}
                            onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rezultati pretrage */}
                  <div className="mb-4 flex items-center justify-between mt-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Pronađeno: <strong className="text-gray-900 dark:text-gray-100">{jobs.length}</strong> poslova
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  categories={categories}
                />
              </div>
            </div>
          )}

          {/* Jobs grid/list - samo za prijavljene korisnike */}
          {token && (
            <>
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
                    <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{job.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{job.description}</p>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                            {job.city && <span>📍 {job.city}</span>}
                            {job.category && <span>🏷️ {job.category.name}</span>}
                            {job.budgetMin && job.budgetMax && (
                              <span>💰 {job.budgetMin}-{job.budgetMax} €</span>
                            )}
                            <span>📅 {new Date(job.createdAt).toLocaleDateString('hr-HR')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewJobDetails(job)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Detalji
                          </button>
                          {isProviderOrBusinessUser() && job.status === 'OPEN' && (
                            <button
                              onClick={() => handleMakeOffer(job)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Pošalji ponudu
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {jobs.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Nema pronađenih poslova</p>
                  <p className="text-gray-400 dark:text-gray-500 mb-4">Pokušajte promijeniti filtere ili objavite novi posao</p>
                  <button
                    onClick={() => {
                      setQ('');
                      setFilters({ categoryId: '', city: '', budgetMin: '', budgetMax: '', status: '', sortBy: 'newest', dateFrom: '', dateTo: '' });
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Očisti filtere
                  </button>
                </div>
              )}
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

      {tab === 'login' && (
        <section id="login" className="tab-section">
          <Login onSuccess={(token, user) => {
            saveToken(token);
            setTab('user');
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
          <MyLeads />
        </section>
      )}

      {tab === 'my-jobs' && (
        <section id="my-jobs" className="tab-section">
          <MyJobs onNavigate={(tabName) => setTab(tabName)} />
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
                Kliknite na kategoriju da vidite detalje ili filtrirate poslove
              </p>
            </div>
            
            {/* Glavne kategorije (bez parentId) */}
            <div className="space-y-8">
              {categories
                .filter(category => !category.parentId)
                .map(parentCategory => {
                  const subcategories = categories.filter(cat => cat.parentId === parentCategory.id);
                  
                  return (
                    <div key={parentCategory.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      {/* Glavna kategorija */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-3xl">
                          {parentCategory.icon || '🛠️'}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {parentCategory.name}
                          </h2>
                          <p className="text-gray-600 mb-2">
                            {parentCategory.description}
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
                          onClick={() => setFilters(prev => ({ ...prev, categoryId: parentCategory.id }))}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Filtrirati poslove
                        </button>
                      </div>
                      
                      {/* Podkategorije */}
                      {subcategories.length > 0 && (
                        <div className="border-t pt-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            📂 Podkategorije ({subcategories.length})
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {subcategories.map(subcategory => (
                              <div 
                                key={subcategory.id} 
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setFilters(prev => ({ ...prev, categoryId: subcategory.id }))}
                              >
                                <div className="text-center">
                                  <div className="text-xl mb-1">
                                    {subcategory.icon || '🔧'}
                                  </div>
                                  <h4 className="font-semibold text-xs text-gray-800 mb-1">
                                    {subcategory.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 overflow-hidden" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                    {subcategory.description}
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
            <ProviderFilter
              filters={providerFilters}
              setFilters={setProviderFilters}
              categories={categories}
              onReset={() => setProviderFilters({
                search: null,
                categoryId: null,
                city: null,
                minRating: null,
                verified: null,
                hasLicenses: null,
                isAvailable: null,
                sortBy: 'rating'
              })}
            />
            
            {/* Providers grid */}
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
          <Documentation />
        </section>
      )}

      {tab === 'faq' && (
        <section id="faq" className="tab-section">
          <FAQ />
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

      {tab === 'user-types' && (
        <section id="user-types" className="tab-section">
          <UserTypesOverview />
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
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
              const params = { q, ...filters };
              Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
              });
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
        />
      )}
    </div>
  );
}
