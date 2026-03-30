import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/api'

function KpiCard({ title, value, hint, to, warn }) {
  const inner = (
    <div
      className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
        warn && Number(value) > 0
          ? 'border-amber-300 bg-amber-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="mt-1 text-3xl font-bold tabular-nums text-gray-900">{value}</div>
      {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
    </div>
  )
  if (to) {
    return (
      <Link to={to} className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl">
        {inner}
      </Link>
    )
  }
  return inner
}

const SHORTCUTS = [
  { to: '/admin/provider-approvals', label: 'Odobrenja pružatelja', icon: '✅' },
  { to: '/admin/users-overview', label: 'Pregled korisnika', icon: '📊' },
  { to: '/admin/Subscription', label: 'Pretplate (tablica)', icon: '📋' },
  { to: '/admin/addon-event-logs', label: 'Dnevnik add-on događaja', icon: '📦' },
  { to: '/admin/moderation', label: 'Moderacija', icon: '🛡️' },
  { to: '/admin/contact-inquiries', label: 'Kontakt upiti', icon: '📩' },
  { to: '/admin/error-logs', label: 'Zapisnik grešaka', icon: '❌' },
  { to: '/admin/payments', label: 'Plaćanja', icon: '💳' },
  { to: '/admin/platform-stats', label: 'Statistike platforme', icon: '📈' }
]

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const { data: d } = await api.get('/admin/dashboard-summary')
        if (!cancelled) setData(d)
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.error || e?.message || 'Učitavanje nadzorne ploče nije uspjelo.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Početna</h1>
        <p className="mt-1 text-gray-600">
          Sažetak stanja platforme i brzi pristup čestim zadacima.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-gray-600">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          Učitavanje…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">Ključni pokazatelji</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <KpiCard
                title="Pružatelji čekaju odobrenje"
                value={data.pendingProviders}
                hint="Zahtijevaju akciju u odobrenjima"
                to="/admin/provider-approvals"
                warn
              />
              <KpiCard
                title="Sadržaj čeka moderaciju"
                value={data.moderationPending}
                hint="Poslovi, ponude, recenzije, poruke"
                to="/admin/moderation"
                warn
              />
              <KpiCard
                title="TRIAL bez kompletnih add-ona"
                value={data.trialsMissingAddons}
                hint="Manje od 3 trial add-aona (2 kat. + regija)"
                to="/admin/addon-event-logs"
                warn
              />
              <KpiCard
                title="Pretplate: plaćanje u tijeku"
                value={data.subscriptionsPaymentPending}
                hint="Čekaju Stripe potvrdu uplate"
                to="/admin/payments"
                warn={false}
              />
              <KpiCard
                title="Zapelo PAYMENT_PENDING > 30 min"
                value={data.subscriptionsPaymentPendingStuck}
                hint="Mogući webhook/naplata problem"
                to="/admin/payments"
                warn
              />
              <KpiCard
                title="Aktivnih TRIAL pretplata"
                value={data.activeTrials}
                to="/admin/Subscription"
              />
              <KpiCard
                title="Otvorenih poslova"
                value={data.openJobs}
                to="/admin/Job"
              />
              <KpiCard
                title="Korisnika u sustavu"
                value={data.usersTotal}
                to="/admin/User"
              />
              <KpiCard
                title="Kontakt upita (7 dana)"
                value={data.contactInquiriesLast7Days}
                to="/admin/contact-inquiries"
              />
              <KpiCard
                title="Novih grešaka (24 h, status NEW)"
                value={data.errorLogsNewLast24h}
                to="/admin/error-logs"
                warn
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">Brzi linkovi</h2>
            <div className="flex flex-wrap gap-2">
              {SHORTCUTS.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-300"
                >
                  <span>{s.icon}</span>
                  {s.label}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
