import React, { useState, useEffect } from 'react'
import api from '@/api'

export default function AdminDataCleanup(){
  const [loading, setLoading] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [preserveEmails, setPreserveEmails] = useState('')
  const [preview, setPreview] = useState(null)

  async function loadPreview(){
    setLoadingPreview(true)
    setError('')
    try{
      const emails = preserveEmails
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
      const params = emails.length > 0 ? { preserveEmails: emails.join(',') } : {}
      const { data } = await api.get('/admin/cleanup/non-master/preview', { params })
      if(data.success && data.counts){
        setPreview(data.counts)
      } else {
        setError('Greška pri učitavanju pregleda podataka')
      }
    }catch(e){
      console.error('Error loading preview:', e)
      setError(e?.response?.data?.error || e?.message || 'Greška pri učitavanju pregleda podataka')
    }finally{
      setLoadingPreview(false)
    }
  }

  useEffect(() => {
    loadPreview()
  }, [preserveEmails])

  async function runCleanup(){
    if(!confirm('Potvrdi čišćenje podataka (ne-matični). Ova akcija je nepovratna.')) return
    setLoading(true); setError(''); setResult(null)
    try{
      const emails = preserveEmails
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
      const { data } = await api.post('/admin/cleanup/non-master', { preserveEmails: emails })
      setResult(data)
    }catch(e){
      setError(e?.response?.data?.error || e?.message || String(e))
    }finally{ setLoading(false) }
  }

  function renderCount(label, val){
    const count = typeof val === 'object' && val !== null && 'count' in val ? val.count : (val?.count ?? val)
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{count ?? 0}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">🧹 Čišćenje podataka (ne-matični)</h2>
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <div className="text-yellow-800">
          <p className="font-semibold">Upozorenje</p>
          <ul className="list-disc ml-5 mt-1 text-sm">
            <li>Bit će obrisani transakcijski podaci: Chat (poruke, sobe, SLA, audit logovi), Poslovi i Ponude, Lead management (queue, purchases), Provider profili (licence, ROI, team lokacije), Pretplate (subscriptions, add-ons, billing), Fakture, Kreditne transakcije, Feature ownership, Client verifikacije, Support ticketi, WhiteLabel postavke, Push/SMS logovi, Chatbot sesije, Spremljene pretrage, Job alerts, API Request logovi, Error logovi i svi korisnici koji nisu ADMIN.</li>
            <li>Sačuvat će se: ADMIN korisnik, Kategorije, Pretplatnički planovi (SubscriptionPlan), Pravni statusi (LegalStatus), Dokumentacija (DocumentationCategory, DocumentationFeature), <strong>Testiranje (TestPlan, TestItem, TestRun, TestRunItem)</strong>.</li>
            <li>Akcija je nepovratna.</li>
          </ul>
        </div>
      </div>

      {loadingPreview ? (
        <div className="text-gray-600">Učitavam pregled podataka...</div>
      ) : preview && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <div className="font-semibold text-blue-800 mb-3">📊 Pregled podataka koji će biti obrisani:</div>
          <div className="space-y-1 text-sm">
            <div className="font-semibold text-blue-700 mb-2">Chat i poruke</div>
            {renderCount('Chat poruke', preview.chatMessages)}
            {renderCount('Chat sobe', preview.chatRooms)}
            {renderCount('Verzije poruka', preview.messageVersions)}
            {renderCount('SLA tracking', preview.messageSLAs)}
            {renderCount('Audit logovi', preview.auditLogs)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Recenzije i notifikacije</div>
            {renderCount('Recenzije', preview.reviews)}
            {renderCount('Notifikacije', preview.notifications)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Poslovi i ponude</div>
            {renderCount('Poslovi', preview.jobs)}
            {renderCount('Ponude', preview.offers)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Lead management</div>
            {renderCount('Kupljeni leadovi', preview.leadPurchases)}
            {renderCount('Lead queue', preview.leadQueues)}
            {renderCount('Company lead queue', preview.companyLeadQueues)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Provider podaci</div>
            {renderCount('Provider profili', preview.providerProfiles)}
            {renderCount('Provider licence', preview.providerLicenses)}
            {renderCount('Provider ROI', preview.providerROIs)}
            {renderCount('Team lokacije', preview.providerTeamLocations)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Pretplate i naplata</div>
            {renderCount('Pretplate', preview.subscriptions)}
            {renderCount('Povijest pretplata', preview.subscriptionHistories)}
            {renderCount('Trial engagement', preview.trialEngagements)}
            {renderCount('Add-on pretplate', preview.addonSubscriptions)}
            {renderCount('Add-on usage', preview.addonUsages)}
            {renderCount('Add-on event logovi', preview.addonEventLogs)}
            {renderCount('Billing planovi', preview.billingPlans)}
            {renderCount('Billing korekcije', preview.billingAdjustments)}
            {renderCount('Fakture', preview.invoices)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Krediti i transakcije</div>
            {renderCount('Kreditne transakcije', preview.creditTransactions)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Feature ownership</div>
            {renderCount('Company feature ownership', preview.companyFeatureOwnerships)}
            {renderCount('Feature ownership povijest', preview.featureOwnershipHistories)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Verifikacija i podrška</div>
            {renderCount('Client verifikacije', preview.clientVerifications)}
            {renderCount('Support ticketi', preview.supportTickets)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Ostalo</div>
            {preview.whiteLabels !== undefined && renderCount('WhiteLabel postavke', preview.whiteLabels)}
            {renderCount('Push pretplate', preview.pushSubscriptions)}
            {renderCount('SMS logovi', preview.smsLogs)}
            {renderCount('Chatbot sesije', preview.chatbotSessions)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Pretrage i alerti</div>
            {renderCount('Spremljene pretrage', preview.savedSearches)}
            {renderCount('Job alerts', preview.jobAlerts)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Logging tablice</div>
            {renderCount('API Request logovi', preview.apiRequestLogs)}
            {renderCount('Error logovi', preview.errorLogs)}
            
            <div className="font-semibold text-blue-700 mb-2 mt-3">Korisnici</div>
            {renderCount('Korisnici (bez ADMIN)', preview.users)}
          </div>
        </div>
      )}

      <label className="block">
        <div className="text-sm text-gray-700 mb-1">E-mailovi korisnika koje treba sačuvati (opcionalno, zarezom odvojeni)</div>
        <input
          type="text"
          value={preserveEmails}
          onChange={e=>setPreserveEmails(e.target.value)}
          placeholder="user1@example.com, user2@example.com"
          className="w-full border rounded px-3 py-2"
        />
      </label>

      <button onClick={runCleanup} disabled={loading || loadingPreview} className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50">
        {loading ? 'Čistim...' : 'Pokreni čišćenje'}
      </button>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <div className="font-semibold text-green-800 mb-2">Rezultat</div>
          <div className="space-y-1">
            <div className="font-semibold text-green-700 mb-2">Chat i poruke</div>
            {renderCount('Chat poruke', result.deleted?.chatMessages)}
            {renderCount('Chat sobe', result.deleted?.chatRooms)}
            {renderCount('Verzije poruka', result.deleted?.messageVersions)}
            {renderCount('SLA tracking', result.deleted?.messageSLAs)}
            {renderCount('Audit logovi', result.deleted?.auditLogs)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Recenzije i notifikacije</div>
            {renderCount('Recenzije', result.deleted?.reviews)}
            {renderCount('Notifikacije', result.deleted?.notifications)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Poslovi i ponude</div>
            {renderCount('Poslovi', result.deleted?.jobs)}
            {renderCount('Ponude', result.deleted?.offers)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Lead management</div>
            {renderCount('Kupljeni leadovi', result.deleted?.leadPurchases)}
            {renderCount('Lead queue', result.deleted?.leadQueues)}
            {renderCount('Company lead queue', result.deleted?.companyLeadQueues)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Provider podaci</div>
            {renderCount('Provider profili', result.deleted?.providerProfiles)}
            {renderCount('Provider licence', result.deleted?.providerLicenses)}
            {renderCount('Provider ROI', result.deleted?.providerROIs)}
            {renderCount('Team lokacije', result.deleted?.providerTeamLocations)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Pretplate i naplata</div>
            {renderCount('Pretplate', result.deleted?.subscriptions)}
            {renderCount('Povijest pretplata', result.deleted?.subscriptionHistories)}
            {renderCount('Trial engagement', result.deleted?.trialEngagements)}
            {renderCount('Add-on pretplate', result.deleted?.addonSubscriptions)}
            {renderCount('Add-on usage', result.deleted?.addonUsages)}
            {renderCount('Add-on event logovi', result.deleted?.addonEventLogs)}
            {renderCount('Billing planovi', result.deleted?.billingPlans)}
            {renderCount('Billing korekcije', result.deleted?.billingAdjustments)}
            {renderCount('Fakture', result.deleted?.invoices)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Krediti i transakcije</div>
            {renderCount('Kreditne transakcije', result.deleted?.creditTransactions)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Feature ownership</div>
            {renderCount('Company feature ownership', result.deleted?.companyFeatureOwnerships)}
            {renderCount('Feature ownership povijest', result.deleted?.featureOwnershipHistories)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Verifikacija i podrška</div>
            {renderCount('Client verifikacije', result.deleted?.clientVerifications)}
            {renderCount('Support ticketi', result.deleted?.supportTickets)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Ostalo</div>
            {result.deleted?.whiteLabels !== undefined && renderCount('WhiteLabel postavke', result.deleted?.whiteLabels)}
            {renderCount('Push pretplate', result.deleted?.pushSubscriptions)}
            {renderCount('SMS logovi', result.deleted?.smsLogs)}
            {renderCount('Chatbot sesije', result.deleted?.chatbotSessions)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Pretrage i alerti</div>
            {renderCount('Spremljene pretrage', result.deleted?.savedSearches)}
            {renderCount('Job alerts', result.deleted?.jobAlerts)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Logging tablice</div>
            {renderCount('API Request logovi', result.deleted?.apiRequestLogs)}
            {renderCount('Error logovi', result.deleted?.errorLogs)}
            
            <div className="font-semibold text-green-700 mb-2 mt-3">Korisnici</div>
            {renderCount('Korisnici obrisani (bez ADMIN)', result.deleted?.users)}
          </div>
        </div>
      )}
    </div>
  )
}
