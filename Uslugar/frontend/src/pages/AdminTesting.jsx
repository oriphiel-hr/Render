import React, { useEffect, useMemo, useState } from 'react'
import api from '../api'

const STATUS_BADGES = {
  PENDING: 'bg-gray-100 text-gray-700',
  PASS: 'bg-green-100 text-green-800',
  FAIL: 'bg-red-100 text-red-800',
  BLOCKED: 'bg-yellow-100 text-yellow-800',
  NOT_APPLICABLE: 'bg-slate-100 text-slate-800'
}

function Badge({ status }){
  const cls = STATUS_BADGES[status] || STATUS_BADGES.PENDING
  return <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{status}</span>
}

function PlanEditor({ onSaved }){
  const [name, setName] = useState('Test plan')
  const [description, setDescription] = useState('Upute i koraci testiranja')
  const [category, setCategory] = useState('Korisnik')
  const [items, setItems] = useState([
    // AUTH
    { title: 'Registracija korisnika usluge (osoba)', description: 'Registracija bez pravnog statusa', expectedResult: 'Uspješna registracija bez polja za tvrtku', dataVariations: { examples: ['ispravan email', 'neispravan email', 'slaba lozinka', 'duplikat email'] } },
    { title: 'Registracija korisnika usluge (tvrtka/obrt)', description: 'Registracija s pravnim statusom', expectedResult: 'Obavezni: pravni status ≠ INDIVIDUAL, OIB, (osim FREELANCER) naziv tvrtke', dataVariations: { examples: ['FREELANCER bez naziva tvrtke (dozvoljeno)', 'DOO bez naziva (greška)', 'neispravan OIB (greška)', 'ispravan OIB (prolazi)'] } },
    { title: 'Verifikacija emaila', description: 'Otvaranje linka za verifikaciju', expectedResult: 'Korisnik označen kao verified', dataVariations: { examples: ['link vrijedi', 'istekao link'] } },
    { title: 'Prijava i odjava', description: 'Login s ispravnim/neispravnim podacima', expectedResult: 'Ispravno: prijava, Neispravno: poruka o grešci', dataVariations: { examples: ['kriva lozinka', 'nepostojeći email'] } },
    { title: 'Zaboravljena lozinka i reset', description: 'Slanje emaila i promjena lozinke', expectedResult: 'Reset token radi, lozinka promijenjena', dataVariations: { examples: ['token nevažeći', 'token istekao'] } },

    // PROVIDER ONBOARDING
    { title: 'Nadogradnja na providera', description: 'Odabir pravnog statusa i unos OIB-a', expectedResult: 'INDIVIDUAL nije dopušten; OIB obavezan; validacija OIB-a', dataVariations: { examples: ['FREELANCER bez naziva firme (prolazi)', 'DOO bez naziva (greška)', 'neispravan OIB (greška)', 'ispravan OIB (prolazi)'] } },
    { title: 'Profil providera', description: 'Popunjavanje profila i odabir kategorija', expectedResult: 'Maksimalno 5 kategorija; profil spremljen', dataVariations: { examples: ['0 kategorija', '5 kategorija (prolazi)', '6 kategorija (blokirano)'] } },
    { title: 'Portfolio slike', description: 'Upload više slika u profil', expectedResult: 'Sve slike vidljive i spremne', dataVariations: { examples: ['bez slika', 'više slika'] } },

    // KYC
    { title: 'KYC: Upload dokumenta', description: 'Upload PDF/JPG/PNG + pristanak', expectedResult: 'Dokument spremljen; status pending/verified ovisno o provjeri', dataVariations: { examples: ['bez consent (greška)', 'nepodržan format (greška)', 'validan PDF (prolazi)'] } },
    { title: 'KYC: Ekstrakcija OIB-a', description: 'Uparen s profilom', expectedResult: 'OIB iz dokumenta odgovara profilu', dataVariations: { examples: ['OIB mismatch (napomena/admin review)', 'OIB match (verified)'] } },

    // JOBS (KLIJENT)
    { title: 'Objava posla', description: 'Kreiranje job-a s/bez slika', expectedResult: 'Posao kreiran i vidljiv na listi', dataVariations: { examples: ['bez slika', 's više slika', 'budžet unesen', 'bez budžeta'] } },
    { title: 'Filtri poslova i pretraga', description: 'Filtriranje po kategoriji, gradu, budžetu', expectedResult: 'Lista filtrirana', dataVariations: { examples: ['bez rezultata', 'više rezultata'] } },

    // LEADS I OFFERS (PROVIDER)
    { title: 'Pregled dostupnih leadova', description: 'Provider gleda available leadove', expectedResult: 'Lista dostupnih leadova s filterima', dataVariations: { examples: ['grad', 'kategorija', 'min/max budžet'] } },
    { title: 'Kupnja ekskluzivnog leada', description: 'Dedukcija kredita i pristup kontaktima', expectedResult: 'Krediti umanjeni, lead dodan u Moji leadovi', dataVariations: { examples: ['dovoljno kredita (prolazi)', 'nedovoljno kredita (greška)'] } },
    { title: 'Ponuda na posao', description: 'Provider šalje ponudu', expectedResult: 'Ponuda kreirana i notifikacija klijentu', dataVariations: { examples: ['cijena + pregovaranje', 'procijenjeni dani', 'insufficient credits (greška)'] } },
    { title: 'Označi lead kontaktiran/konvertiran', description: 'Statusi ROI-a', expectedResult: 'Statusi ažurirani, ROI statistika osvježena', dataVariations: { examples: ['kontaktiran', 'konvertiran', 'refund'] } },

    // CHAT & NOTIFIKACIJE
    { title: 'Chat: slanje poruke', description: 'Komunikacija između klijenta i providera', expectedResult: 'Poruka vidljiva u sobi', dataVariations: { examples: ['više poruka', 'prazna poruka (blokirano)'] } },
    { title: 'Notifikacije', description: 'Prikaz i označavanje pročitanim', expectedResult: 'Nove notifikacije za ponude/poslove vidljive', dataVariations: { examples: ['ponuda primljena', 'ponuda prihvaćena'] } },

    // SUBSCRIPTION & PAYMENTS
    { title: 'Pretplata: odabir plana', description: 'BASIC/PREMIUM/PRO', expectedResult: 'Plan odabran; krediti dodijeljeni', dataVariations: { examples: ['najpopularniji plan', 'nedostupni plan (skriven)'] } },
    { title: 'Plaćanje', description: 'Simulacija uspješnog/neet uspješnog plaćanja', expectedResult: 'Uspjeh: aktivna pretplata, Neuspjeh: nema promjene', dataVariations: { examples: ['success', 'fail', 'ponovno pokušaj'] } },

    // ADMIN
    { title: 'Admin: odobrenja providera', description: 'Approve/Reject/Inactive', expectedResult: 'Status providera ažuriran i notifikacija poslana', dataVariations: { examples: ['APPROVED', 'REJECTED', 'INACTIVE'] } },
    { title: 'Admin: KYC metrike', description: 'Provjera brojeva i prosječnog vremena', expectedResult: 'Metrike vratile valjane vrijednosti', dataVariations: { examples: ['bez verifikacija', 'više verificiranih'] } },
  ])

  const addItem = () => setItems(prev => [...prev, { title: '', description: '', expectedResult: '', dataVariations: { examples: [] } }])
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))
  const updateItem = (idx, key, val) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it))

  const handleSave = async () => {
    const payload = { name, description, category, items: items.map((it, idx) => ({ ...it, order: idx })) }
    const res = await api.post('/testing/plans', payload)
    onSaved?.(res.data)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input className="border rounded px-3 py-2" placeholder="Naziv plana" value={name} onChange={e => setName(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Kategorija (npr. KYC)" value={category} onChange={e => setCategory(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Opis" value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="border rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Stavka #{idx+1}</h4>
              <button onClick={() => removeItem(idx)} className="text-red-600 text-sm">Ukloni</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="border rounded px-3 py-2" placeholder="Naslov" value={it.title} onChange={e => updateItem(idx,'title',e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Očekivani rezultat" value={it.expectedResult} onChange={e => updateItem(idx,'expectedResult',e.target.value)} />
              <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Opis" value={it.description} onChange={e => updateItem(idx,'description',e.target.value)} />
              <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Primjeri (zarezom odvojeni, npr. ispravan OIB, neispravan OIB)" value={(it.dataVariations?.examples||[]).join(', ')} onChange={e => updateItem(idx,'dataVariations',{ examples: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={addItem} className="px-3 py-2 bg-gray-100 rounded">+ Dodaj stavku</button>
        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded">Spremi plan</button>
      </div>
    </div>
  )
}

function PresetPlanEditor({ preset, onSaved }){
  const base = {
    AUTH: [
      { title: 'Registracija korisnika usluge (osoba)', description: 'Registracija bez pravnog statusa', expectedResult: 'Uspješna registracija bez polja za tvrtku', dataVariations: { examples: ['ispravan email', 'neispravan email', 'slaba lozinka', 'duplikat email'] } },
      { title: 'Registracija korisnika usluge (tvrtka/obrt)', description: 'Registracija s pravnim statusom', expectedResult: 'Obavezni: pravni status ≠ INDIVIDUAL, OIB, (osim FREELANCER) naziv tvrtke', dataVariations: { examples: ['FREELANCER bez naziva tvrtke (dozvoljeno)', 'DOO bez naziva (greška)', 'neispravan OIB (greška)', 'ispravan OIB (prolazi)'] } },
      { title: 'Verifikacija emaila', description: 'Otvaranje linka za verifikaciju', expectedResult: 'Korisnik označen kao verified', dataVariations: { examples: ['link vrijedi', 'istekao link'] } },
      { title: 'Prijava i odjava', description: 'Login s ispravnim/neispr. podacima', expectedResult: 'Ispravno: prijava, Neispravno: greška', dataVariations: { examples: ['kriva lozinka', 'nepostojeći email'] } },
      { title: 'Zaboravljena lozinka i reset', description: 'Slanje emaila i promjena lozinke', expectedResult: 'Reset token radi, lozinka promijenjena', dataVariations: { examples: ['token nevažeći', 'token istekao'] } },
    ],
    ONBOARDING: [
      { title: 'Nadogradnja na providera', description: 'Odabir pravnog statusa i OIB', expectedResult: 'INDIVIDUAL nije dopušten; OIB obavezan; validacija', dataVariations: { examples: ['FREELANCER bez naziva (prolazi)', 'DOO bez naziva (greška)', 'neispravan OIB', 'ispravan OIB'] } },
      { title: 'Profil providera', description: 'Popunjavanje i kategorije', expectedResult: 'Maks 5 kategorija', dataVariations: { examples: ['0 kategorija', '5 kategorija', '6 kategorija (blok)'] } },
      { title: 'Portfolio slike', description: 'Upload više slika', expectedResult: 'Slike vidljive i spremljene', dataVariations: { examples: ['bez slika', 'više slika'] } },
    ],
    KYC: [
      { title: 'KYC: Upload dokumenta', description: 'PDF/JPG/PNG + consent', expectedResult: 'Status pending/verified', dataVariations: { examples: ['bez consent (greška)', 'nepodržan format', 'validan PDF'] } },
      { title: 'KYC: Ekstrakcija OIB-a', description: 'Uparen s profilom', expectedResult: 'OIB match => verified', dataVariations: { examples: ['mismatch (review)', 'match (verified)'] } },
    ],
    JOBS: [
      { title: 'Objava posla', description: 'Kreiranje sa/bez slika', expectedResult: 'Posao vidljiv na listi', dataVariations: { examples: ['bez slika', 'više slika', 's budžetom', 'bez budžeta'] } },
      { title: 'Filtri i pretraga posla', description: 'Kategorija/grad/budžet', expectedResult: 'Lista filtrirana', dataVariations: { examples: ['bez rezultata', 'više rezultata'] } },
    ],
    LEADS: [
      { title: 'Dostupni leadovi', description: 'Provider pregleda leadove', expectedResult: 'Lista s filterima', dataVariations: { examples: ['grad', 'kategorija', 'min/max budžet'] } },
      { title: 'Kupnja ekskluzivnog leada', description: 'Dedukcija kredita', expectedResult: 'Lead u Mojim leadovima', dataVariations: { examples: ['dovoljno kredita', 'nedovoljno (greška)'] } },
      { title: 'Ponuda na posao', description: 'Slanje ponude', expectedResult: 'Ponuda spremljena, notifikacija klijentu', dataVariations: { examples: ['cijena + pregovaranje', 'procijenjeni dani', 'insufficient credits'] } },
      { title: 'ROI statusi', description: 'Kontaktiran/konvertiran/refund', expectedResult: 'Statusevi i ROI se ažuriraju', dataVariations: { examples: ['kontaktiran', 'konvertiran', 'refund'] } },
    ],
    CHAT: [
      { title: 'Chat: slanje poruke', description: 'Korisnik ↔ Provider', expectedResult: 'Poruka vidljiva', dataVariations: { examples: ['više poruka', 'prazna poruka (blok)'] } },
      { title: 'Notifikacije', description: 'Prikaz i označavanje pročitanim', expectedResult: 'Nove notifikacije vidljive', dataVariations: { examples: ['ponuda primljena', 'ponuda prihvaćena'] } },
    ],
    SUBS: [
      { title: 'Pretplata: odabir plana', description: 'BASIC/PREMIUM/PRO', expectedResult: 'Plan odabran, krediti dodijeljeni', dataVariations: { examples: ['najpopularniji plan', 'skriven plan'] } },
      { title: 'Plaćanje', description: 'Simulacija uspjeh/neuspjeh', expectedResult: 'Uspjeh: aktivna, neuspjeh: bez promjene', dataVariations: { examples: ['success', 'fail', 'retry'] } },
    ],
    ADMIN: [
      { title: 'Admin: odobrenja providera', description: 'Approve/Reject/Inactive', expectedResult: 'Status ažuriran + notifikacija', dataVariations: { examples: ['APPROVED', 'REJECTED', 'INACTIVE'] } },
      { title: 'Admin: KYC metrike', description: 'Provjera brojeva/vremena', expectedResult: 'Metrike vraćaju vrijednosti', dataVariations: { examples: ['bez verifikacija', 'više verificiranih'] } },
    ],
  }

  const mapPresetToDefaults = (key) => {
    if (key === 'ALL') {
      return [
        ...base.AUTH,
        ...base.ONBOARDING,
        ...base.KYC,
        ...base.JOBS,
        ...base.LEADS,
        ...base.CHAT,
        ...base.SUBS,
        ...base.ADMIN,
      ]
    }
    return base[key] || []
  }

  const [items, setItems] = useState(() => mapPresetToDefaults(preset))
  const [name, setName] = useState(() => {
    if (preset==='ALL') return 'Sve domene - E2E'
    const labels = { AUTH:'Auth', ONBOARDING:'Onboarding', KYC:'KYC', JOBS:'Jobs', LEADS:'Leads i Ponude', CHAT:'Chat i Notifikacije', SUBS:'Pretplate i Plaćanja', ADMIN:'Admin' }
    return `Plan: ${labels[preset] || preset}`
  })
  const [description, setDescription] = useState('Automatski generiran plan prema odabranoj domeni')
  const [category, setCategory] = useState(() => preset)

  // Sync items on preset change
  React.useEffect(() => {
    setItems(mapPresetToDefaults(preset).map((it) => ({ ...it })))
    setCategory(preset)
    const labels = { AUTH:'Auth', ONBOARDING:'Onboarding', KYC:'KYC', JOBS:'Jobs', LEADS:'Leads i Ponude', CHAT:'Chat i Notifikacije', SUBS:'Pretplate i Plaćanja', ADMIN:'Admin' }
    setName(preset==='ALL' ? 'Sve domene - E2E' : `Plan: ${labels[preset] || preset}`)
  }, [preset])

  const handleSave = async () => {
    const payload = { name, description, category, items: items.map((it, idx) => ({ ...it, order: idx })) }
    const res = await api.post('/testing/plans', payload)
    onSaved?.(res.data)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input className="border rounded px-3 py-2" placeholder="Naziv plana" value={name} onChange={e => setName(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Kategorija" value={category} onChange={e => setCategory(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Opis" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="border rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Stavka #{idx+1}</h4>
              <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-600 text-sm">Ukloni</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="border rounded px-3 py-2" placeholder="Naslov" value={it.title} onChange={e => setItems(prev => prev.map((x, i) => i===idx ? { ...x, title: e.target.value } : x))} />
              <input className="border rounded px-3 py-2" placeholder="Očekivani rezultat" value={it.expectedResult} onChange={e => setItems(prev => prev.map((x, i) => i===idx ? { ...x, expectedResult: e.target.value } : x))} />
              <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Opis" value={it.description} onChange={e => setItems(prev => prev.map((x, i) => i===idx ? { ...x, description: e.target.value } : x))} />
              <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Primjeri (zarezom odvojeni)" value={(it.dataVariations?.examples||[]).join(', ')} onChange={e => setItems(prev => prev.map((x, i) => i===idx ? { ...x, dataVariations: { examples: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) } } : x))} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setItems(prev => [...prev, { title: '', description: '', expectedResult: '', dataVariations: { examples: [] } }])} className="px-3 py-2 bg-gray-100 rounded">+ Dodaj stavku</button>
        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded">Spremi plan</button>
      </div>
    </div>
  )
}

function RunExecutor({ plan, onClose }){
  const [run, setRun] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [fullPlan, setFullPlan] = useState(plan)

  // Učitaj puni plan s itemima ako ih nema
  useEffect(() => {
    const loadFullPlan = async () => {
      // Ako plan već ima iteme, ne treba ponovno učitati
      if (plan.items && plan.items.length > 0) {
        setFullPlan(plan)
        return
      }
      
      // Učitaj plan s itemima
      try {
        const res = await api.get(`/testing/plans`)
        const foundPlan = res.data.find(p => p.id === plan.id)
        if (foundPlan) {
          console.log('[TESTING] Loaded full plan:', {
            id: foundPlan.id,
            name: foundPlan.name,
            itemsCount: foundPlan.items?.length || 0
          })
          setFullPlan(foundPlan)
        } else {
          console.warn('[TESTING] Plan not found in response')
        }
      } catch (e) {
        console.error('[TESTING] Error loading plan:', e)
      }
    }
    loadFullPlan()
  }, [plan.id])

  const startRun = async () => {
    const planToUse = fullPlan || plan
    if (!planToUse.items || planToUse.items.length === 0) {
      alert('Plan nema stavki. Ne možete pokrenuti run bez stavki.')
      return
    }
    setCreating(true)
    try {
      const r = await api.post('/testing/runs', { planId: planToUse.id, name: `${planToUse.name} - ručno testiranje` })
      setRun(r.data)
    } catch (e) {
      alert(`Greška pri kreiranju run-a: ${e?.response?.data?.error || e?.message || String(e)}`)
    } finally {
      setCreating(false)
    }
  }

  const refresh = async () => {
    if (!run) return
    const r = await api.get(`/testing/runs/${run.id}`)
    setRun(r.data)
  }

  const updateItem = async (itemId, data) => {
    if (!run) return
    await api.patch(`/testing/runs/${run.id}/items/${itemId}`, data)
    await refresh()
  }

  const uploadImages = async (files) => {
    const form = new FormData()
    Array.from(files).forEach(f => form.append('images', f))
    setUploading(true)
    try {
      const res = await api.post('/upload/multiple', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data.images.map(x => x.url)
    } finally {
      setUploading(false)
    }
  }

  // Ako run još nije kreiran, prikaži plan preview
  if (!run) {
    const planToUse = fullPlan || plan
    const itemsCount = planToUse.items?.length || 0
    
    // Debug logging
    console.log('[TESTING] RunExecutor - Plan preview:', {
      planId: planToUse.id,
      planName: planToUse.name,
      itemsCount,
      hasItems: !!(planToUse.items && planToUse.items.length > 0),
      items: planToUse.items
    })
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-lg font-semibold">Plan: {planToUse.name}</h3>
            {planToUse.description && <p className="text-sm text-gray-600 mt-1">{planToUse.description}</p>}
            <div className="mt-2 text-sm text-gray-500">
              📋 Stavki u planu: <span className="font-semibold">{itemsCount}</span>
            </div>
          </div>
        </div>

        {itemsCount === 0 ? (
          <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
            <p className="text-lg font-medium mb-2">⚠️ Plan nema stavki</p>
            <p className="text-sm">Ovaj plan ne može biti pokrenut jer nema test stavki.</p>
            <p className="text-xs text-gray-400 mt-2">Provjerite da li je plan pravilno kreiran s test stavkama.</p>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Zatvori
            </button>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Pregled plana</h4>
                  <p className="text-sm text-blue-800">
                    Plan sadrži <strong>{itemsCount}</strong> test stavki. Kliknite "Pokreni run" da započnete testiranje.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview stavki */}
            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-gray-700 mb-3">Stavke u planu:</h4>
              {planToUse.items.map((item, idx) => (
                <div key={item.id || idx} className="bg-white border rounded p-3 text-sm">
                  <div className="font-medium text-gray-900">
                    {idx + 1}. {item.title}
                  </div>
                  {item.description && (
                    <div className="text-gray-600 mt-1 text-xs line-clamp-2">
                      {item.description.substring(0, 100)}{item.description.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Odustani
              </button>
              <button 
                onClick={startRun}
                disabled={creating}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creating && <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{creating ? 'Kreiranje...' : 'Pokreni run'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Izračunaj progress
  const totalItems = run.plan?.items?.length || 0
  const completedItems = (run.items || []).filter(item => 
    item.status === 'PASS' || item.status === 'FAIL' || item.status === 'NOT_APPLICABLE'
  ).length
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Run: {run.name}</h3>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progres: {completedItems} / {totalItems} završeno</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {run.status !== 'COMPLETED' && (
            <button 
              onClick={async () => {
                if (confirm('Jeste li sigurni da želite završiti ovaj run?')) {
                  await api.patch(`/testing/runs/${run.id}`, { status: 'COMPLETED' })
                  await refresh()
                }
              }} 
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-150"
            >
              Završi run
            </button>
          )}
          <button 
            onClick={async () => {
              if (confirm('Jeste li sigurni da želite obrisati ovaj run? Ova akcija je nepovratna.')) {
                try {
                  await api.delete(`/testing/runs/${run.id}`)
                  onClose()
                } catch (e) {
                  alert(`Greška pri brisanju: ${e?.response?.data?.error || e?.message || String(e)}`)
                }
              }
            }}
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-150"
          >
            🗑️ Obriši
          </button>
          <button 
            onClick={onClose} 
            className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-150"
          >
            Zatvori
          </button>
        </div>
      </div>

      {(run.plan?.items || []).map(it => {
        const ri = (run.items || []).find(x => x.itemId === it.id)
        const status = ri?.status || 'PENDING'
        
        // Parsiraj korake iz description polja (split po novim redovima)
        const steps = it.description ? it.description.split('\n').filter(s => s.trim()) : []
        const hasSteps = steps.length > 1 || (steps.length === 1 && steps[0].length > 100)
        
        return (
          <div key={it.id} className="border rounded p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{it.title}</h4>
                  <Badge status={status} />
                </div>
                
                {/* Koraci - formatirani kao checklista */}
                {hasSteps && (
                  <div className="mt-3 mb-3 bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                    <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📋</span>
                      <span>Koraci testiranja:</span>
                    </div>
                    <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700">
                      {steps.map((step, idx) => (
                        <li key={idx} className="pl-2 py-1 leading-relaxed">
                          {step.trim()}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {/* Opis (ako nema koraka ili je kratak) */}
                {!hasSteps && it.description && (
                  <p className="text-sm text-gray-600 mt-2 mb-2">{it.description}</p>
                )}
                
                {/* Očekivani rezultat */}
                {it.expectedResult && (
                  <div className="mt-3 mb-2 bg-green-50 rounded-lg p-3 border-l-4 border-green-500">
                    <div className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
                      <span>✅</span>
                      <span>Očekivani rezultat:</span>
                    </div>
                    <div className="text-sm text-green-700 whitespace-pre-line">
                      {it.expectedResult.split('\n').map((line, idx) => (
                        <div key={idx} className="py-0.5">{line.trim() || '\u00A0'}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Varijacije podataka */}
                {!!(it.dataVariations?.examples||[]).length && (
                  <div className="mt-2 mb-2">
                    <span className="text-xs font-medium text-gray-500">Varijacije: </span>
                    <span className="text-xs text-gray-600">
                      {(it.dataVariations.examples||[]).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Status gumbovi */}
              <div className="flex flex-col gap-1 ml-4">
                {['PASS','FAIL','BLOCKED','NOT_APPLICABLE','PENDING'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => updateItem(it.id, { status: s })} 
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                      status===s
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <textarea className="border rounded px-3 py-2" placeholder="Komentar" value={ri?.comment || ''} onChange={e => updateItem(it.id, { comment: e.target.value })} />
              <div>
                <label className="block text-sm font-medium mb-1">Upload screenshotova</label>
                <input type="file" multiple accept="image/*" onChange={async e => {
                  const urls = await uploadImages(e.target.files)
                  await updateItem(it.id, { addScreenshots: urls })
                  e.target.value = ''
                }} />
                {uploading && <div className="text-xs text-gray-500 mt-1">Učitavanje...</div>}
              </div>
            </div>

            {!!(ri?.screenshots||[]).length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(ri.screenshots||[]).map(url => (
                  <div key={url} className="relative">
                    <img src={url} alt="shot" className="w-28 h-28 object-cover rounded border" />
                    <button onClick={() => updateItem(it.id, { removeScreenshots: [url] })} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border shadow text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AdminTesting(){
  const [tab, setTab] = useState('plans') // 'plans' | 'runs' | 'new'
  const [plans, setPlans] = useState([])
  const [runs, setRuns] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [preset, setPreset] = useState('ALL')
  const [seeding, setSeeding] = useState(false)

  const load = async () => {
    try {
      const [p, r] = await Promise.all([
        api.get('/testing/plans'),
        api.get('/testing/runs')
      ])
      setPlans(p.data)
      setRuns(r.data)
      
      // Debug: provjeri ima li planovi iteme
      if (p.data && p.data.length > 0) {
        console.log('[TESTING] Loaded plans:', p.data.map(pl => ({
          id: pl.id,
          name: pl.name,
          itemsCount: pl.items?.length || 0,
          hasItems: !!(pl.items && pl.items.length > 0)
        })))
      }
    } catch (e) {
      console.error('[TESTING] Error loading:', e)
      alert(`Greška pri učitavanju: ${e?.response?.data?.error || e?.message || String(e)}`)
    }
  }
  useEffect(() => { load() }, [])

  const handleSeed = async () => {
    if (!confirm('Ovo će obrisati sve postojeće test planove i kreirati nove iz TEST-PLAN-FRONTEND.md i TEST-PLAN-ADMIN.md. Nastaviti?')) {
      return
    }
    setSeeding(true)
    try {
      const res = await api.post('/testing/seed')
      alert(`✅ Seed uspješan!\n\nKreirano ${res.data.plansCount} planova\nUkupno ${res.data.totalItems} test itema`)
      await load()
    } catch (e) {
      alert(`❌ Greška: ${e?.response?.data?.error || e?.message || String(e)}`)
    } finally {
      setSeeding(false)
    }
  }

  // Izračunaj statistike za badge-ove
  const plansCount = plans.length
  const runsCount = runs.length
  const activeRunsCount = runs.filter(r => r.status === 'IN_PROGRESS').length

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li><a href="/admin" className="hover:text-gray-700 transition-colors">Admin</a></li>
          <li>/</li>
          <li className="text-gray-900 font-medium">Testiranje</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Testiranje</h2>
        <button 
          onClick={load} 
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-150 flex items-center gap-2"
        >
          <span>🔄</span>
          <span>Osvježi</span>
        </button>
      </div>

      {/* Tabs with badges */}
      <div className="flex items-center gap-2 border-b">
        <button 
          onClick={() => setTab('plans')} 
          className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-150 flex items-center gap-2 ${
            tab==='plans'
              ? 'bg-indigo-600 text-white shadow-sm border-b-2 border-indigo-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Planovi</span>
          {plansCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              tab==='plans' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
            }`}>
              {plansCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setTab('runs')} 
          className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-150 flex items-center gap-2 ${
            tab==='runs'
              ? 'bg-indigo-600 text-white shadow-sm border-b-2 border-indigo-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Runovi</span>
          {runsCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              tab==='runs' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
            }`}>
              {runsCount}
            </span>
          )}
          {activeRunsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500 text-white animate-pulse">
              {activeRunsCount} aktivno
            </span>
          )}
        </button>
        <button 
          onClick={() => setTab('new')} 
          className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-150 ${
            tab==='new'
              ? 'bg-indigo-600 text-white shadow-sm border-b-2 border-indigo-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Novi plan
        </button>
        <button 
          onClick={handleSeed} 
          disabled={seeding} 
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ml-auto transition-all duration-150 ${
            seeding
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
          title="Briše postojeće planove i runove te kreira nove iz markdown fajlova"
        >
          {seeding && <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>🌱</span>
          <span>{seeding ? 'Seeding...' : 'Seed iz MD fajlova'}</span>
        </button>
      </div>

      {tab === 'plans' && (
        <div className="space-y-3">
          {plans.map(pl => (
            <div key={pl.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-150">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-lg">{pl.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{pl.description}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {!!pl.category && <span>📁 Kategorija: {pl.category}</span>}
                    <span>📋 Stavki: <strong>{pl.items?.length || 0}</strong></span>
                  </div>
                  {/* Prikaz prvih nekoliko stavki */}
                  {pl.items && pl.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs font-medium text-gray-500 mb-2">Stavke:</div>
                      <div className="space-y-1">
                        {pl.items.slice(0, 3).map((item, idx) => (
                          <div key={item.id || idx} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>{item.title}</span>
                          </div>
                        ))}
                        {pl.items.length > 3 && (
                          <div className="text-xs text-gray-400 italic">
                            + još {pl.items.length - 3} stavki...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => setActivePlan(pl)} 
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-150"
                  >
                    ▶️ Pokreni run
                  </button>
                </div>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nema planova.</p>
              <button 
                onClick={() => setTab('new')} 
                className="mt-2 text-indigo-600 hover:text-indigo-700"
              >
                Kreiraj novi plan →
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'runs' && (
        <div className="space-y-3">
          {runs.map(r => {
            const totalItems = r.plan?.items?.length || 0
            const completedItems = (r.items || []).filter(item => 
              item.status === 'PASS' || item.status === 'FAIL' || item.status === 'NOT_APPLICABLE'
            ).length
            const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
            
            return (
              <div key={r.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-150">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{r.name}</div>
                    <div className="text-sm text-gray-600 mt-1">Plan: {r.plan?.name}</div>
                  </div>
                  <Badge status={r.status} />
                </div>
                {totalItems > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progres: {completedItems} / {totalItems}</span>
                      <span className="font-medium">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          r.status === 'COMPLETED' ? 'bg-green-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={async () => {
                      if (confirm(`Jeste li sigurni da želite obrisati run "${r.name}"?`)) {
                        try {
                          await api.delete(`/testing/runs/${r.id}`)
                          await load()
                        } catch (e) {
                          alert(`Greška pri brisanju: ${e?.response?.data?.error || e?.message || String(e)}`)
                        }
                      }
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    🗑️ Obriši
                  </button>
                  {r.status !== 'COMPLETED' && (
                    <button
                      onClick={async () => {
                        if (confirm(`Jeste li sigurni da želite završiti run "${r.name}"?`)) {
                          try {
                            await api.patch(`/testing/runs/${r.id}`, { status: 'COMPLETED' })
                            await load()
                          } catch (e) {
                            alert(`Greška: ${e?.response?.data?.error || e?.message || String(e)}`)
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                    >
                      ✅ Završi
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {runs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nema runova.</p>
              <p className="text-sm mt-1">Kreiraj run iz taba "Planovi"</p>
            </div>
          )}
        </div>
      )}

      {tab === 'new' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              {key:'ALL',label:'Sve domene'},
              {key:'AUTH',label:'Auth'},
              {key:'ONBOARDING',label:'Onboarding'},
              {key:'KYC',label:'KYC'},
              {key:'JOBS',label:'Jobs'},
              {key:'LEADS',label:'Leads/Offers'},
              {key:'CHAT',label:'Chat/Notifikacije'},
              {key:'SUBS',label:'Pretplate/Plaćanja'},
              {key:'ADMIN',label:'Admin'}
            ].map(p => (
              <button key={p.key} onClick={() => setPreset(p.key)} className={`px-3 py-2 rounded ${preset===p.key?'bg-indigo-600 text-white':'bg-gray-100'}`}>{p.label}</button>
            ))}
          </div>

          <PresetPlanEditor preset={preset} onSaved={() => { setTab('plans'); load(); }} />
        </div>
      )}

      {activePlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 max-w-5xl w-full max-h-[90vh] overflow-auto">
            <RunExecutor plan={activePlan} onClose={() => { setActivePlan(null); load(); }} />
          </div>
        </div>
      )}
    </div>
  )
}


