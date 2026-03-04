/* src/admin/Layout.jsx */
import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { MODELS } from './router'

const MODEL_LABELS = {
  User: 'Korisnici',
  ProviderProfile: 'Profili pružatelja',
  Category: 'Kategorije',
  Job: 'Poslovi',
  Offer: 'Ponude',
  Review: 'Recenzije',
  Notification: 'Notifikacije',
  ChatRoom: 'Chat sobe',
  ChatMessage: 'Chat poruke',
  Subscription: 'Pretplate',
  SubscriptionPlan: 'Pretplatnički planovi',
  LegalStatus: 'Pravni status'
}

// Funkcionalne grupe linkova
const NAVIGATION_GROUPS = [
  {
    title: 'Korisnici i Profili',
    icon: '👥',
    items: [
      { to: '/admin/User', label: 'Korisnici', model: 'User' },
      { to: '/admin/ProviderProfile', label: 'Profili pružatelja', model: 'ProviderProfile' },
      { to: '/admin/provider-approvals', label: 'Odobrenja pružatelja', icon: '✅' },
      { to: '/admin/verification-documents', label: 'Dokumenti za verifikaciju', icon: '📄' },
      { to: '/admin/users-overview', label: 'Pregled korisnika', icon: '📊' }
    ]
  },
  {
    title: 'Sadržaj',
    icon: '📝',
    items: [
      { to: '/admin/Category', label: 'Kategorije', model: 'Category' },
      { to: '/admin/Job', label: 'Poslovi', model: 'Job' },
      { to: '/admin/Offer', label: 'Ponude', model: 'Offer' },
      { to: '/admin/Review', label: 'Recenzije', model: 'Review' },
      { to: '/admin/ChatRoom', label: 'Chat sobe', model: 'ChatRoom' },
      { to: '/admin/ChatMessage', label: 'Chat poruke', model: 'ChatMessage' },
      { to: '/admin/Notification', label: 'Notifikacije', model: 'Notification' },
      { to: '/admin/moderation', label: 'Moderacija sadržaja', icon: '🛡️' }
    ]
  },
  {
    title: 'Pretplate i Plaćanja',
    icon: '💰',
    items: [
      { to: '/admin/Subscription', label: 'Pretplate', model: 'Subscription' },
      { to: '/admin/SubscriptionPlan', label: 'Pretplatnički planovi', model: 'SubscriptionPlan' },
      { to: '/admin/payments', label: 'Plaćanja', icon: '💳' },
      { to: '/admin/invoices', label: 'Fakture', icon: '📄' }
    ]
  },
  {
    title: 'Sigurnost i Verifikacija',
    icon: '🔒',
    items: [
      { to: '/admin/kyc-metrics', label: 'KYC Metrike', icon: '📊' }
    ]
  },
  {
    title: 'Statistike i Analitika',
    icon: '📈',
    items: [
      { to: '/admin/platform-stats', label: 'Statistike platforme', icon: '📊' }
    ]
  },
  {
    title: 'Razvoj i Alati',
    icon: '🛠️',
    items: [
      { to: '/admin/testing', label: 'Testiranje', icon: '🧪' },
      { to: '/admin/testing-blocks', label: 'Blokovski testovi', icon: '🧱' },
      { to: '/admin/database', label: 'Database Editor', icon: '🗄️' },
      { to: '/admin/api-reference', label: 'API Reference', icon: '📚' },
      { to: '/admin/documentation', label: 'Dokumentacija', icon: '📖' },
      { to: '/admin/user-types', label: 'Tipovi korisnika', icon: '👥' },
      { to: '/admin/cleanup', label: 'Čišćenje podataka', icon: '🧹' }
    ]
  },
  {
    title: 'Logovi i Monitoring',
    icon: '📋',
    items: [
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
      { to: '/admin/api-request-logs', label: 'API Request Logs', icon: '🌐' },
      { to: '/admin/error-logs', label: 'Error Logs', icon: '❌' },
      { to: '/admin/addon-event-logs', label: 'Addon Event Logs', icon: '📦' },
      { to: '/admin/sms-logs', label: 'SMS Logs', icon: '📱' }
    ]
  },
  {
    title: 'Support',
    icon: '💬',
    items: [
      { to: '/admin/contact-inquiries', label: 'Kontakt upiti', icon: '📩' }
    ]
  },
  {
    title: 'Ostalo',
    icon: '⚙️',
    items: [
      { to: '/admin/LegalStatus', label: 'Pravni status', model: 'LegalStatus' }
    ]
  }
]

// Funkcija za dobivanje naslova stranice
function getPageTitle(pathname) {
  const path = pathname.replace('/admin/', '')
  
  // Provjeri modele
  for (const [model, label] of Object.entries(MODEL_LABELS)) {
    if (path === model) return label
  }
  
  // Provjeri posebne stranice
  const specialPages = {
    'provider-approvals': 'Odobrenja pružatelja',
    'verification-documents': 'Dokumenti za verifikaciju',
    'kyc-metrics': 'KYC Metrike',
    'platform-stats': 'Statistike platforme',
    'moderation': 'Moderacija sadržaja',
    'sms-logs': 'SMS Logs',
    'invoices': 'Fakture',
    'users-overview': 'Pregled korisnika',
    'documentation': 'Dokumentacija',
    'database': 'Database Editor',
    'api-reference': 'API Reference',
    'payments': 'Plaćanja',
    'cleanup': 'Čišćenje podataka',
    'testing': 'Testiranje',
    'testing-blocks': 'Blokovski testovi',
    'user-types': 'Tipovi korisnika',
    'audit-logs': 'Audit Logs',
    'api-request-logs': 'API Request Logs',
    'error-logs': 'Error Logs',
    'addon-event-logs': 'Addon Event Logs',
    'contact-inquiries': 'Kontakt upiti'
  }
  
  return specialPages[path] || 'Admin Panel'
}

export default function Layout({ user, onLogout }){
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Uslugar Admin</h1>
              {/* Breadcrumb */}
              <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
                <span className="text-gray-400">/</span>
                <span className="ml-2 font-medium text-gray-700">{pageTitle}</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user?.fullName}</span>
                <span className="text-gray-500 ml-2">({user?.email})</span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Odjava
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-4 py-6">
        <div className="flex min-h-[70vh] bg-white border rounded-lg shadow overflow-hidden">
          <aside className="w-64 flex-shrink-0 border-r bg-gray-50 dark:bg-gray-800 p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
            <nav className="space-y-4">
              {NAVIGATION_GROUPS.map((group, groupIdx) => (
                <div key={groupIdx}>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2 px-2">
                    <span>{group.icon}</span>
                    <span>{group.title}</span>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const label = item.label || MODEL_LABELS[item.model] || item.model
                      const icon = item.icon || ''
                      
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({isActive}) =>
                            `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                              isActive 
                                ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
                                : 'text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white'
                            }`
                          }
                        >
                          {icon && <span>{icon}</span>}
                          <span>{label}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
