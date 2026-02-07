/**
 * Blokovski testovi - pregled prema TEST-BLOCKS-MANIFEST-SPEC.md
 * Kontejner = test slučaj. Test je uspješan ako svaki blok uspio.
 */
import React, { useEffect, useState } from 'react'
import api from '../api'

const SECTORS = [
  { num: 1, title: 'Registracija i Autentifikacija', tests: [
    { id: '1.1', name: 'Registracija korisnika usluge', desc: 'Testira registraciju korisnika bez pravnog statusa', userSteps: 'Ispunite formu registracije (email, lozinka, ime, telefon, grad). Kliknite Registracija. Provjerite Mailpit za verifikacijski mail.' },
    { id: '1.2', name: 'Registracija pružatelja usluga', desc: 'Testira registraciju providera s pravnim statusom', userSteps: 'Odaberite tip Pružatelj, ispunite formu s OIB-om i pravnim statusom. Provjerite Mailpit.' },
    { id: '1.3', name: 'Prijava korisnika', desc: 'Testira login s ispravnim i neispravnim podacima', userSteps: 'Unesite email i lozinku test korisnika (npr. test.client@uslugar.hr). Kliknite Prijava.' },
    { id: '1.4', name: 'Email verifikacija', desc: 'Testira otvaranje linka i verifikaciju emaila', userSteps: 'Registrirajte se, provjerite Mailpit za verifikacijski mail, kliknite link u mailu.' },
    { id: '1.5', name: 'Resetiranje lozinke', desc: 'Testira slanje emaila i promjenu lozinke', userSteps: 'Na #forgot-password unesite admin@uslugar.hr. Provjerite Mailpit za reset link.' },
    { id: '1.6', name: 'JWT token autentifikacija', desc: 'Testira token autentifikaciju i pristup API-ju' }
  ]},
  { num: 2, title: 'Upravljanje Kategorijama', tests: [
    { id: '2.1', name: 'Dinamičko učitavanje kategorija', desc: 'Testira učitavanje kategorija iz baze' },
    { id: '2.2', name: 'Hijerarhijska struktura kategorija', desc: 'Testira parent-child odnose' },
    { id: '2.3', name: 'Filtriranje poslova po kategorijama', desc: 'Testira filteriranje u pretrazi' }
  ]},
  { num: 3, title: 'Upravljanje Poslovima', tests: [
    { id: '3.1', name: 'Objavljivanje novih poslova', desc: 'Testira kreiranje i čuvanje posla' },
    { id: '3.2', name: 'Detaljni opis posla', desc: 'Testira prikaz svih detalja' },
    { id: '3.3', name: 'Postavljanje budžeta', desc: 'Testira min-max budžet' },
    { id: '3.4', name: 'Lokacija i Geolokacija', desc: 'Testira MapPicker i AddressAutocomplete' },
    { id: '3.5', name: 'Status posla', desc: 'Testira OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN' },
    { id: '3.6', name: 'Pretraživanje poslova', desc: 'Testira search funkcionalnost' },
    { id: '3.7', name: 'Napredni filteri', desc: 'Testira filtriranje po više parametara' },
    { id: '3.8', name: 'Sortiranje poslova', desc: 'Testira sortiranje po relevantnosti' }
  ]},
  { num: 4, title: 'Sustav Ponuda', tests: [
    { id: '4.1', name: 'Slanje ponuda za poslove', desc: 'Testira slanje ponude i dedukciju kredita' },
    { id: '4.2', name: 'Status ponude', desc: 'Testira NA ČEKANJU, PRIHVAĆENA, ODBIJENA' },
    { id: '4.3', name: 'Prihvaćanje/odbijanje ponuda', desc: 'Testira akcije na ponudu' }
  ]},
  { num: 14, title: 'Pravni Status i Verifikacija', tests: [
    { id: '14.1', name: 'Verifikacija Sudski/Obrtni registar', desc: 'Testira provjeru da li je tvrtka/obrt stvarno u službenom registru' }
  ]},
  { num: 6, title: 'Profili Pružatelja', tests: [
    { id: '6.1', name: 'Detaljni profil pružatelja', desc: 'Testira prikaz profila' },
    { id: '6.2', name: 'Biografija pružatelja', desc: 'Testira ažuriranje biografije' },
    { id: '6.3', name: 'Kategorije u kojima radi', desc: 'Testira odabir kategorija' },
    { id: '6.4', name: 'Team Locations', desc: 'Testira MapPicker za lokacije tima' }
  ]},
  { num: 18, title: 'Plaćanja i Stripe', tests: [
    { id: '18.1', name: 'Stripe Checkout integracija', desc: 'Testira Stripe Checkout za plaćanje pretplate' },
    { id: '18.2', name: 'Stripe Payment Intent', desc: 'Testira plaćanje s karticom za leadove' },
    { id: '18.3', name: 'Stripe Webhook', desc: 'Testira potvrdu plaćanja s webhooka' },
    { id: '18.4', name: 'Stripe Refund', desc: 'Testira povrat novca na karticu' }
  ]},
  { num: 19, title: 'Tvrtke i Timovi', tests: [
    { id: '19.1', name: 'Direktor Dashboard', desc: 'Testira upravljanje timovima' },
    { id: '19.2', name: 'Interna distribucija leadova', desc: 'Testira dodjelu leadova timu' }
  ]},
  { num: 20, title: 'Chat Sustav', tests: [
    { id: '20.1', name: 'PUBLIC chat', desc: 'Testira komunikaciju Klijent ↔ Tvrtka' },
    { id: '20.2', name: 'INTERNAL chat', desc: 'Testira interni chat tima' }
  ]},
  { num: 21, title: 'SMS (Infobip)', tests: [
    { id: '21.1', name: 'SMS verifikacija telefona', desc: 'Testira Infobip SMS verifikaciju' },
    { id: '21.2', name: 'SMS - nova ponuda', desc: 'Testira slanje SMS-a za novu ponudu' },
    { id: '21.3', name: 'SMS - nov posao', desc: 'Testira slanje SMS-a za novi posao' },
    { id: '21.4', name: 'SMS error handling', desc: 'Testira rukovanje SMS greškama' }
  ]},
  { num: 22, title: 'KYC i Verifikacija', tests: [
    { id: '22.1', name: 'Upload KYC dokumenta', desc: 'Testira upload PDF/JPG za KYC' },
    { id: '22.2', name: 'Verifikacija OIB-a', desc: 'Testira provjeru OIB-a iz dokumenta' },
    { id: '22.3', name: 'KYC status', desc: 'Testira pending/approved status' },
    { id: '22.4', name: 'KYC rejection', desc: 'Testira odbijanje KYC-a s razlogom' }
  ]},
  { num: 23, title: 'Portfolio i Certifikati', tests: [
    { id: '23.1', name: 'Upload portfolio slika', desc: 'Testira upload više portfolio slika' },
    { id: '23.2', name: 'Upload certifikata/licenci', desc: 'Testira upload licence (PDF)' },
    { id: '23.3', name: 'Prikaz na profilu', desc: 'Testira prikaz portfolio na profilu' },
    { id: '23.4', name: 'Galerija i preview', desc: 'Testira galeriju i lightbox' }
  ]},
  { num: 24, title: 'Email Notifikacije', tests: [
    { id: '24.1', name: 'Email - nova ponuda', desc: 'Testira email za novu ponudu' },
    { id: '24.2', name: 'Email - novi posao', desc: 'Testira email za novi posao' },
    { id: '24.3', name: 'Email - trial expiry', desc: 'Testira email 3 dana prije isteka triala' },
    { id: '24.4', name: 'Email - inactivity', desc: 'Testira email za neaktivnost >14 dana' }
  ]},
  { num: 25, title: 'Saved Searches i Job Alerts', tests: [
    { id: '25.1', name: 'Spremanje pretraga', desc: 'Testira spremanje filter pretraga' },
    { id: '25.2', name: 'Job alerts - kreiranje', desc: 'Testira kreiranje job alert-a' },
    { id: '25.3', name: 'Job alerts - frekvencije', desc: 'Testira DAILY, WEEKLY, INSTANT' },
    { id: '25.4', name: 'Job alerts - notifikacije', desc: 'Testira slanje email notifikacija' }
  ]},
  { num: 26, title: 'Admin - Upravljanje', tests: [
    { id: '26.1', name: 'Approve provider', desc: 'Testira odobrenje novog providera' },
    { id: '26.2', name: 'Reject provider', desc: 'Testira odbijanje providera s razlogom' },
    { id: '26.3', name: 'Ban/Suspend korisnika', desc: 'Testira suspenziju ili ban' },
    { id: '26.4', name: 'KYC metrics', desc: 'Testira prikaz KYC statistike' }
  ]},
  { num: 27, title: 'Wizard Registracije', tests: [
    { id: '27.1', name: 'Odabir kategorija', desc: 'Testira multi-select kategorija' },
    { id: '27.2', name: 'Odabir regija', desc: 'Testira odabir radnih regija' },
    { id: '27.3', name: 'Wizard status', desc: 'Testira progres kroz wizard' },
    { id: '27.4', name: 'Wizard completion', desc: 'Testira završetak i spremanje' }
  ]},
  { num: 28, title: 'Upravljanje Pretplatom', tests: [
    { id: '28.1', name: 'Upgrade pretplate', desc: 'Testira nadogradnju s prorated billingom' },
    { id: '28.2', name: 'Downgrade pretplate', desc: 'Testira sniženje pretplate' },
    { id: '28.3', name: 'Cancel pretplate', desc: 'Testira otkazivanje pretplate' },
    { id: '28.4', name: 'Trial aktivacija', desc: 'Testira automatsku aktivaciju trial-a' }
  ]},
  { num: 29, title: 'ROI Dashboard', tests: [
    { id: '29.1', name: 'ROI dashboard', desc: 'Testira prikaz ROI metrika' },
    { id: '29.2', name: 'ROI grafici', desc: 'Testira grafičke prikaze' },
    { id: '29.3', name: 'Konverzija leadova', desc: 'Testira conversion rate' },
    { id: '29.4', name: 'Izvještaji', desc: 'Testira mjesečne/godišnje izvještaje' }
  ]},
  { num: 30, title: 'Credit Sustav', tests: [
    { id: '30.1', name: 'Credit kupnja', desc: 'Testira dodjeljivanje kredita' },
    { id: '30.2', name: 'Credit trošenje', desc: 'Testira oduzimanje pri kupnji leada' },
    { id: '30.3', name: 'Credit history', desc: 'Testira prikaz transakcija' },
    { id: '30.4', name: 'Credit refund', desc: 'Testira vraćanje kredita' }
  ]},
  { num: 31, title: 'Security', tests: [
    { id: '31.1', name: 'CORS policy', desc: 'Testira CORS headers' },
    { id: '31.2', name: 'CSRF protection', desc: 'Testira CSRF token validaciju' },
    { id: '31.3', name: 'Rate limiting', desc: 'Testira rate limiting na API-ju' },
    { id: '31.4', name: 'SQL injection', desc: 'Testira zaštitu od SQL injection-a' }
  ]}
]

const STATUS_BADGES = {
  PASS: 'bg-green-100 text-green-800',
  FAIL: 'bg-red-100 text-red-800',
  PENDING: 'bg-gray-100 text-gray-700'
}

function loadTestResultsFromStorage() {
  try {
    const saved = localStorage.getItem('adminTestResults')
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return {}
}

function getScreenshotBaseUrl() {
  try {
    const base = (typeof api !== 'undefined' && api?.defaults?.baseURL) ? api.defaults.baseURL : ''
    if (base) return base.replace(/\/api\/?$/, '')
  } catch (_) {}
  return ''
}

export default function AdminTestingBlocks() {
  const [expandedSector, setExpandedSector] = useState(null)
  const [expandedDetails, setExpandedDetails] = useState({})
  const [runningTest, setRunningTest] = useState(null)
  const [testResults, setTestResults] = useState(loadTestResultsFromStorage)
  const [testData, setTestData] = useState(null)
  const [blocksByTest, setBlocksByTest] = useState({})

  useEffect(() => {
    api.get('/testing/test-data', { timeout: 10000 })
      .then(r => setTestData(r.data || {}))
      .catch(() => setTestData({ users: {} }))
  }, [])

  useEffect(() => {
    api.get('/testing/blocks-manifest', { timeout: 5000 })
      .then(r => setBlocksByTest(r.data?.blocksByTest || {}))
      .catch(() => setBlocksByTest({}))
  }, [])

  const runTest = async (test) => {
    setRunningTest(test.id)
    try {
      const testUser = testData?.users?.provider || testData?.users?.client || testData?.users?.user
      const userDataForTest = testUser ? (test.id === '14.1'
        ? { oib: testUser.oib, companyName: testUser.companyName, legalStatus: testUser.legalStatus || testUser.legalStatusId }
        : { email: testUser.email, password: testUser.password, fullName: testUser.fullName, phone: testUser.phone, city: testUser.city, role: testUser.role, ...testUser }
      ) : null

      const mailpitBaseUrl = testData?.email?.testService?.baseUrl
      const reqApiBase = api?.defaults?.baseURL ? new URL(api.defaults.baseURL.replace(/\/api\/?$/, '')).origin : undefined

      const res = await api.post('/testing/run-single', {
        testId: test.id,
        testName: test.name,
        userData: userDataForTest,
        apiBaseUrl: reqApiBase,
        mailpitBaseUrl: mailpitBaseUrl,
        testData: { email: { linkExtraction: testData?.email?.linkExtraction || null } }
      })

      setTestResults(prev => {
        const updated = {
          ...prev,
          [test.id]: {
            status: res.data.success ? 'PASS' : 'FAIL',
            auto: true,
            timestamp: new Date().toISOString(),
            message: res.data.message,
            duration: res.data.duration,
            error: res.data.error,
            screenshots: res.data.screenshots || [],
            emailScreenshots: res.data.emailScreenshots || [],
            checkpointDelta: res.data.checkpointDelta || null,
            apiCalls: res.data.apiCalls || [],
            blocks: res.data.blocks || [],
            assert: res.data.assert || [],
            blockStatuses: res.data.blockStatuses || []
          }
        }
        try { localStorage.setItem('adminTestResults', JSON.stringify(updated)) } catch (e) {}
        return updated
      })
    } catch (e) {
      setTestResults(prev => {
        const updated = { ...prev, [test.id]: { status: 'FAIL', error: e?.response?.data?.error || e?.message, timestamp: new Date().toISOString() } }
        try { localStorage.setItem('adminTestResults', JSON.stringify(updated)) } catch (err) {}
        return updated
      })
    } finally {
      setRunningTest(null)
    }
  }

  const runAllInSector = async (sector) => {
    for (const test of sector.tests) {
      await runTest(test)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🧱 Blokovski testovi</h2>
          <p className="text-gray-600 mt-1">Kontejner = test slučaj. Test je uspješan ako svaki blok uspio. Spec: <code className="text-sm bg-gray-100 px-1 rounded">docs/TEST-BLOCKS-MANIFEST-SPEC.md</code> | Blokovi: <code className="text-sm bg-gray-100 px-1 rounded">docs/blocks/</code></p>
        </div>
        <a
          href="/admin/testing#detailed-tests"
          className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Detaljni testovi (klasični pregled)
        </a>
      </div>

      <div className="space-y-3">
        {SECTORS.map((sector, idx) => (
          <div key={idx} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSector(expandedSector === sector.num ? null : sector.num)}
              className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 flex items-center justify-between font-semibold text-left transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">🧱</span>
                <span className="text-gray-900">{sector.title}</span>
                <span className="text-xs text-gray-600">({sector.tests.length} kontejnera)</span>
              </span>
              <span className={`transform transition-transform ${expandedSector === sector.num ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {expandedSector === sector.num && (
              <div className="bg-white border-t divide-y">
                {sector.tests.map((test, testIdx) => {
                  const result = testResults[test.id]
                  const statusCls = STATUS_BADGES[result?.status] || STATUS_BADGES.PENDING
                  const manifest = blocksByTest[test.id]
                  const blocks = result?.blocks ?? manifest?.blocks ?? []
                  const assertList = result?.assert ?? manifest?.assert ?? []
                  const blockStatuses = result?.blockStatuses || []
                  return (
                    <div key={testIdx} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {test.id} - {test.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{test.desc}</div>
                          {/* Blokovi: prikaz kompozicije */}
                          {blocks.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1 items-center">
                              <span className="text-xs text-gray-500">Blokovi:</span>
                              {blocks.map((b, i) => {
                                const bs = blockStatuses.find(x => x.id === b)
                                const ok = bs?.status === 'ok'
                                const fail = bs?.status === 'fail'
                                const statusCls = bs
                                  ? (ok ? 'bg-green-50 text-green-800' : fail ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800')
                                  : 'bg-gray-100 text-gray-700'
                                const statusTitle = bs ? (ok ? 'Prošao' : fail ? `Pao: ${bs.error || ''}` : 'Nepoznato') : 'Nije pokrenuto'
                                return (
                                  <span
                                    key={i}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${statusCls}`}
                                    title={statusTitle}
                                  >
                                    {i > 0 && <span className="text-gray-400">→</span>}
                                    {bs && (ok ? '✓' : fail ? '✗' : '?')}
                                    <span>{b}</span>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                          {assertList.length > 0 && blocks.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1 items-center">
                              <span className="text-xs text-gray-500">Assert:</span>
                              {assertList.map((a, i) => (
                                <span key={i} className="inline-block px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-800 font-mono">
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedDetails(prev => ({ ...prev, [test.id]: !prev[test.id] }))}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            {expandedDetails[test.id] ? '▼ Detalji' : '▶ Detalji'}
                          </button>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusCls}`}>
                            {result?.status || '—'}
                          </span>
                          <button
                            onClick={() => runTest(test)}
                            disabled={runningTest === test.id}
                            className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {runningTest === test.id ? '⏳' : '🤖 Automatski'}
                          </button>
                        </div>
                      </div>
                      {expandedDetails[test.id] && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-700 mb-1">Čemu služi test</h4>
                            <p className="text-sm text-slate-600">{test.desc}</p>
                          </div>
                          {test.userSteps && (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-700 mb-1">Što korisnik treba napraviti</h4>
                              <p className="text-sm text-slate-600">{test.userSteps}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-700 mb-1">Definicija</h4>
                            <p className="text-xs text-slate-600">
                              Blokovi: {blocks.length ? blocks.join(' → ') : '—'}. Assert: {assertList.length ? assertList.join(', ') : '—'}
                            </p>
                            <a href="/docs/TEST-BLOCKS-MANIFEST-SPEC.md" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">Spec: docs/TEST-BLOCKS-MANIFEST-SPEC.md</a>
                          </div>
                          {result?.screenshots?.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-700 mb-1">Screenshotovi</h4>
                              <div className="flex flex-wrap gap-2">
                                {result.screenshots.map((s, i) => (
                                  <a key={i} href={s.url?.startsWith('http') ? s.url : getScreenshotBaseUrl() + s.url} target="_blank" rel="noopener noreferrer" className="block">
                                    <img src={s.url?.startsWith('http') ? s.url : getScreenshotBaseUrl() + s.url} alt={s.step} className="max-w-[200px] max-h-[120px] object-contain border rounded" />
                                    <span className="text-[10px] text-slate-500 block">{s.step}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          {result?.emailScreenshots?.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-700 mb-1">Poslani mailovi</h4>
                              <div className="space-y-2">
                                {result.emailScreenshots.map((em, i) => (
                                  <div key={i} className="text-xs bg-white p-2 rounded border">
                                    <div><strong>Subject:</strong> {em.subject}</div>
                                    <div><strong>From:</strong> {em.from}</div>
                                    {em.clickedLink && <div><strong>Kliknuti link:</strong> {em.clickedLink}</div>}
                                    {em.screenshotUrl && (
                                      <a href={em.screenshotUrl?.startsWith('http') ? em.screenshotUrl : getScreenshotBaseUrl() + em.screenshotUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={em.screenshotUrl?.startsWith('http') ? em.screenshotUrl : getScreenshotBaseUrl() + em.screenshotUrl} alt="Email" className="max-w-[280px] mt-1 border rounded" />
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {result?.apiCalls?.length > 0 && (
                            <details className="text-xs">
                              <summary className="cursor-pointer font-medium text-indigo-700">📡 API pozivi ({result.apiCalls.length})</summary>
                              <div className="mt-1 space-y-1 pl-2 border-l-2 border-indigo-200">
                                {result.apiCalls.map((ac, i) => (
                                  <div key={i} className="bg-indigo-50/50 rounded p-2 font-mono">
                                    <div><strong>Ulaz:</strong> {ac.input?.method} {ac.input?.path}</div>
                                    {ac.input?.body && <div className="text-gray-600">body: {JSON.stringify(ac.input.body).slice(0, 120)}…</div>}
                                    <div><strong>Rezultat:</strong> {ac.result?.status} {ac.result?.ok ? '✓' : '✗'}</div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                          {result?.checkpointDelta && (
                            <details className="text-xs">
                              <summary className="cursor-pointer font-medium text-emerald-700">🗄️ Promjene u bazi</summary>
                              <pre className="mt-1 p-2 bg-emerald-50 rounded overflow-x-auto text-[10px] font-mono">
                                {JSON.stringify(result.checkpointDelta, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}
                      {result && (result.error || result.message) && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                          {result.error || result.message}
                          {result.duration != null && <span className="ml-2">({(result.duration / 1000).toFixed(1)}s)</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="p-3 bg-gray-50">
                  <button
                    onClick={() => runAllInSector(sector)}
                    disabled={!!runningTest}
                    className="px-4 py-2 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 disabled:bg-gray-400"
                  >
                    Pokreni sve u sektoru ({sector.tests.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
