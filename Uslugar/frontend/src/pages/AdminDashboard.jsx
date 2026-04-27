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

const OPERATIONAL_ALARMS = [
  {
    key: 'support_backlog',
    title: 'Support backlog',
    what: 'Broj otvorenih upita/tiketa koji stoje predugo bez rjesavanja.',
    why: 'Ako stalno raste, tim kasni i povecava se rizik odlaska korisnika.',
    source: 'moderationPending',
    warning: 15,
    critical: 30
  },
  {
    key: 'sla_breach_rate',
    title: 'SLA breach rate',
    what: 'Postotak slucajeva koji su probili ciljano vrijeme odgovora/rjesavanja.',
    why: 'Signal da treba uvesti jasne SLA-ove, prioritete i eskalacije.',
    source: null,
    warning: null,
    critical: null
  },
  {
    key: 'repeat_contacts',
    title: 'Repeat contacts',
    what: 'Isti korisnik se javlja vise puta za isti problem u kratkom roku.',
    why: 'Obicno znaci da se problem zatvara povrsno i opet vraca.',
    source: null,
    warning: null,
    critical: null
  },
  {
    key: 'manual_interventions',
    title: 'Rucne admin intervencije',
    what: 'Koliko puta admin mora rucno popravljati tok koji bi trebao biti automatiziran.',
    why: 'Ako raste, vrijeme je za jacu ticket automatizaciju (CRM light/puni CRM).',
    source: 'errorLogsNewLast24h',
    warning: 5,
    critical: 12
  },
  {
    key: 'schedule_complexity',
    title: 'Kompleksna ponavljanja termina (RRULE signal)',
    what: 'Zahtjevi tipa "svaki ponedjeljak", "svaki drugi tjedan", "zadnji petak".',
    why: 'Kad ih je puno, jednokratni slotovi vise nisu dovoljni i treba RRULE.',
    source: null,
    warning: null,
    critical: null
  },
  {
    key: 'calendar_manual_edits',
    title: 'Rucne korekcije kalendara',
    what: 'Broj slucajeva gdje tim rucno prepise/prilagodi termine umjesto sustava.',
    why: 'Direktan indikator da kalendarski model treba naprednije ponavljanje.',
    source: null,
    warning: null,
    critical: null
  }
]

function getAlarmStatus(value, warning, critical) {
  if (typeof value !== 'number' || warning == null || critical == null) return { label: 'N/A', tone: 'bg-gray-100 text-gray-700' }
  if (value >= critical) return { label: 'Kriticno', tone: 'bg-red-100 text-red-700' }
  if (value >= warning) return { label: 'Upozorenje', tone: 'bg-amber-100 text-amber-700' }
  return { label: 'OK', tone: 'bg-emerald-100 text-emerald-700' }
}

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

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">Operativni alarmi (CRM / RRULE signali)</h2>
            <p className="mb-4 text-sm text-gray-600">
              Ova lista sluzi kao podsjetnik sto naziv znaci i kada je vrijeme za veci sustav (SLA/eskalacije ili napredni kalendar).
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {OPERATIONAL_ALARMS.map((alarm) => {
                const rawValue = alarm.source && data ? Number(data[alarm.source] ?? 0) : null
                const status = getAlarmStatus(rawValue, alarm.warning, alarm.critical)
                return (
                  <article key={alarm.key} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-gray-900">{alarm.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.tone}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium text-gray-700">Na sto se odnosi:</span> {alarm.what}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      <span className="font-medium text-gray-700">Zasto je bitno:</span> {alarm.why}
                    </p>
                    {rawValue != null && (
                      <p className="mt-2 text-xs text-gray-500">
                        Trenutna vrijednost: <span className="font-semibold text-gray-700">{rawValue}</span>
                        {alarm.warning != null && alarm.critical != null && (
                          <> · pragovi: upozorenje {alarm.warning}, kriticno {alarm.critical}</>
                        )}
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
