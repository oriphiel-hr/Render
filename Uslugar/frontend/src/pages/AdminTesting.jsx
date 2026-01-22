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
      { title: 'Status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN)', description: 'Ažuriranje statusa posla', expectedResult: 'Status ažuriran, notifikacija poslana', dataVariations: { examples: ['OTVOREN', 'U TIJEKU', 'ZAVRŠEN', 'OTKAZAN'] } },
      { title: 'Pregled detalja posla', description: 'Svi podaci o poslu vidljivi', expectedResult: 'Detalji prikazani (opis, slike, budžet, status)', dataVariations: { examples: ['kompletan posao', 'posao bez slika', 'posao u statusu ZAVRŠEN'] } },
      { title: 'Uređivanje posla', description: 'Promjena podataka o poslu', expectedResult: 'Posao ažuriran, promjene vidljive', dataVariations: { examples: ['promjena budžeta', 'promjena opisa', 'dodavanje slika'] } },
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
    REVIEWS: [
      { title: 'Ocjenjivanje providera (1-5 zvjezdica)', description: 'Ocjena nakon završenog posla', expectedResult: 'Ocjena prikazana na profilu, prosjek ažuriran', dataVariations: { examples: ['1 zvjezdica', '5 zvjezdica', 'duplikat ocjene (blok)'] } },
      { title: 'Komentiranje iskustva', description: 'Pisanje recenzije uz ocjenu', expectedResult: 'Recenzija vidljiva na profilu', dataVariations: { examples: ['pozitivna recenzija', 'negativna recenzija', 'recenzija s editovanjem'] } },
      { title: 'Bilateralno ocjenjivanje', description: 'Korisnik ↔ Provider', expectedResult: 'Obe strane mogu ocijeniti jedna drugu', dataVariations: { examples: ['obje strane ocijenile', 'jedna strana nije ocijenila'] } },
      { title: 'Uređivanje recenzija', description: 'Promjena ocjene ili komentara', expectedResult: 'Recenzija ažurirana, oznaka "uređeno"', dataVariations: { examples: ['promjena ocjene', 'promjena komentara', 'brisanje recenzije'] } },
    ],
    PROFILES: [
      { title: 'Detaljni profil providera', description: 'Prikaz svih informacija o provideru', expectedResult: 'Sve sekcije vidljive (biografija, portfolio, recenzije)', dataVariations: { examples: ['kompletan profil', 'nepotpun profil', 'verificiran profil'] } },
      { title: 'Portfolio upload', description: 'Upload slika radova', expectedResult: 'Slike vidljive u portfoliju', dataVariations: { examples: ['više slika', 'jedna slika', 'nema slika'] } },
      { title: 'Specijalizacije', description: 'Odabir područja rada', expectedResult: 'Specijalizacije prikazane na profilu', dataVariations: { examples: ['jedna specijalizacija', 'više specijalizacija'] } },
      { title: 'Godine iskustva', description: 'Unos godina rada', expectedResult: 'Iskustvo prikazano na profilu', dataVariations: { examples: ['0-2 godine', '5+ godina'] } },
    ],
    QUEUE: [
      { title: 'Red čekanja za leadove', description: 'Pozicija u redu za kategoriju', expectedResult: 'Pozicija prikazana u dashboardu', dataVariations: { examples: ['pozicija #1', 'pozicija #10', 'nema pozicije'] } },
      { title: 'Automatska distribucija leadova', description: 'Lead dodijeljen provideru', expectedResult: 'Lead u Mojim leadovima', dataVariations: { examples: ['lead prihvaćen', 'lead odbijen', 'lead istekao'] } },
      { title: 'Rok za odgovor (24h)', description: 'Vrijeme za reagiranje na lead', expectedResult: 'Lead vraćen ako nema odgovora', dataVariations: { examples: ['odgovor u roku', 'odgovor nakon roka', 'nema odgovora'] } },
      { title: 'Statusi u redu', description: 'WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED', expectedResult: 'Status ažuriran kroz proces', dataVariations: { examples: ['WAITING', 'ACCEPTED', 'EXPIRED'] } },
    ],
    REFUND: [
      { title: 'Refund kredita', description: 'Vraćanje internih kredita', expectedResult: 'Krediti vraćeni na račun', dataVariations: { examples: ['automatski refund', 'ručni refund'] } },
      { title: 'Stripe refund', description: 'Vraćanje na karticu', expectedResult: 'Novac vraćen na karticu', dataVariations: { examples: ['uspješan refund', 'neuspješan refund (fallback)'] } },
      { title: 'Refund ako klijent ne odgovori', description: 'Automatski refund nakon 48h', expectedResult: 'Lead refundiran, vraćen na tržište', dataVariations: { examples: ['refund zbog NO_RESPONSE', 'refund zbog EXPIRED'] } },
      { title: 'Povijest refund transakcija', description: 'Prikaz svih refundova', expectedResult: 'Lista refundova s detaljima', dataVariations: { examples: ['refund kredita', 'refund kartice'] } },
    ],
    LICENSES: [
      { title: 'Upload licence', description: 'PDF/JPG/PNG dokument', expectedResult: 'Dokument uploadan, status pending', dataVariations: { examples: ['validan PDF', 'nepodržan format', 'prevelika datoteka'] } },
      { title: 'Verifikacija licence', description: 'Admin odobrenje', expectedResult: 'Licenca verified, badge prikazan', dataVariations: { examples: ['verified', 'rejected', 'pending'] } },
      { title: 'Praćenje isteka licenci', description: 'Notifikacije prije isteka', expectedResult: 'Upozorenje 30/14/7/1 dan prije', dataVariations: { examples: ['licenca istekla', 'licenca važeća', 'licenca uskoro ističe'] } },
      { title: 'Tipovi licenci po kategorijama', description: 'Elektrotehnička, Građevinska, itd.', expectedResult: 'Licenca vezana za kategoriju', dataVariations: { examples: ['elektrotehnička', 'građevinska', 'nije potrebna'] } },
    ],
    REPUTATION: [
      { title: 'Reputacijski bodovi', description: 'Izračun bodova na osnovu aktivnosti', expectedResult: 'Bodovi prikazani na profilu', dataVariations: { examples: ['visoki bodovi', 'niski bodovi', 'novi korisnik'] } },
      { title: 'Identity badges', description: 'Verifikacijski badgevi', expectedResult: 'Badgeovi prikazani na profilu', dataVariations: { examples: ['email verified', 'phone verified', 'license verified', 'KYC verified'] } },
      { title: 'Trust score', description: 'Ocjena povjerenja', expectedResult: 'Trust score izračunat i prikazan', dataVariations: { examples: ['visok trust score', 'nizak trust score'] } },
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
        ...base.REVIEWS,
        ...base.PROFILES,
        ...base.QUEUE,
        ...base.REFUND,
        ...base.LICENSES,
        ...base.REPUTATION,
      ]
    }
    return base[key] || []
  }

  const [items, setItems] = useState(() => mapPresetToDefaults(preset))
  const [name, setName] = useState(() => {
    if (preset==='ALL') return 'Sve domene - E2E'
    const labels = { 
      AUTH:'Auth', 
      ONBOARDING:'Onboarding', 
      KYC:'KYC', 
      JOBS:'Jobs', 
      LEADS:'Leads i Ponude', 
      CHAT:'Chat i Notifikacije', 
      SUBS:'Pretplate i Plaćanja', 
      ADMIN:'Admin',
      REVIEWS:'Recenzije i Ocjene',
      PROFILES:'Profili Providera',
      QUEUE:'Queue Sustav',
      REFUND:'Refund i Povrat',
      LICENSES:'Licence',
      REPUTATION:'Reputacija'
    }
    return `Plan: ${labels[preset] || preset}`
  })
  const [description, setDescription] = useState('Automatski generiran plan prema odabranoj domeni')
  const [category, setCategory] = useState(() => preset)

  // Sync items on preset change
  React.useEffect(() => {
    setItems(mapPresetToDefaults(preset).map((it) => ({ ...it })))
    setCategory(preset)
    const labels = { 
      AUTH:'Auth', 
      ONBOARDING:'Onboarding', 
      KYC:'KYC', 
      JOBS:'Jobs', 
      LEADS:'Leads i Ponude', 
      CHAT:'Chat i Notifikacije', 
      SUBS:'Pretplate i Plaćanja', 
      ADMIN:'Admin',
      REVIEWS:'Recenzije i Ocjene',
      PROFILES:'Profili Providera',
      QUEUE:'Queue Sustav',
      REFUND:'Refund i Povrat',
      LICENSES:'Licence',
      REPUTATION:'Reputacija'
    }
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
  // Čitaj hash iz URL-a pri inicijalizaciji
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      // Mapiranje hash-a na tab-ove
      const hashToTab = {
        'admin': 'test-data', // #admin -> test-data tab
        'test-data': 'test-data',
        'plans': 'plans',
        'runs': 'runs',
        'new': 'new'
      }
      return hashToTab[hash] || 'plans'
    }
    return 'plans'
  }
  
  const [tab, setTab] = useState(getInitialTab) // 'plans' | 'runs' | 'new' | 'test-data'
  const [plans, setPlans] = useState([])
  const [runs, setRuns] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [preset, setPreset] = useState('ALL')
  const [seeding, setSeeding] = useState(false)
  const [runningAutomated, setRunningAutomated] = useState(false)
  const [automatedTestResult, setAutomatedTestResult] = useState(null)
  const [testResults, setTestResults] = useState(null)
  const [loadingTestResults, setLoadingTestResults] = useState(false)
  const [testData, setTestData] = useState(null)
  const [savingTestData, setSavingTestData] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  
  // Slušaj promjene hash-a u URL-u
  useEffect(() => {
    let isHandlingHash = false // Flag da izbjegnemo beskonačnu petlju
    
    const handleHashChange = () => {
      if (isHandlingHash) return // Ako već obrađujemo hash change, ignoriraj
      
      try {
        isHandlingHash = true
        const hash = window.location.hash.replace('#', '')
        const hashToTab = {
          'admin': 'test-data',
          'test-data': 'test-data',
          'plans': 'plans',
          'runs': 'runs',
          'new': 'new'
        }
        const newTab = hashToTab[hash]
        if (newTab && newTab !== tab) {
          console.log('[TESTING] Hash change detected:', hash, '-> tab:', newTab)
          setTab(newTab)
        }
      } catch (e) {
        console.error('[TESTING] Error handling hash change:', e)
      } finally {
        // Reset flag nakon kratkog delay-a
        setTimeout(() => {
          isHandlingHash = false
        }, 100)
      }
    }
    
    // Provjeri hash pri učitavanju (nakon kratkog delay-a da se komponenta učita)
    setTimeout(() => {
      handleHashChange()
    }, 100)
    
    // Slušaj promjene hash-a
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [tab]) // Vratimo dependency na tab, ali koristimo flag da izbjegnemo petlju

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

  const loadTestData = async () => {
    try {
      console.log('[TEST DATA] Loading test data...')
      // Dodaj timeout za request (10 sekundi)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - test data loading took too long')), 10000)
      )
      
      const apiPromise = api.get('/testing/test-data')
      
      const res = await Promise.race([apiPromise, timeoutPromise])
      console.log('[TEST DATA] Loaded successfully:', res.data)
      // Debug: log user data to see invalidData/missingData
      if (res.data?.users) {
        console.log(`[TEST DATA] Total users found: ${Object.keys(res.data.users).length}`)
        Object.keys(res.data.users).forEach(key => {
          const user = res.data.users[key]
          console.log(`[TEST DATA] User ${key}:`, {
            invalidData: user.invalidData,
            missingData: user.missingData,
            mailtrapEmail: user.mailtrapEmail || 'MISSING',
            mailtrapEmailInvalid: user.mailtrapEmailInvalid || 'MISSING',
            mailtrapEmailMissing: user.mailtrapEmailMissing || 'MISSING',
            emailConfig: user.emailConfig?.inboxId || 'MISSING'
          })
        })
      } else {
        console.warn('[TEST DATA] No users found in response!')
      }
      setTestData(res.data || {
        users: {},
        documents: {},
        email: {
          testService: {
            apiKey: '',
            inboxId: '0'
          }
        },
        api: {
          baseUrl: 'https://api.uslugar.eu',
          frontendUrl: 'https://www.uslugar.eu'
        }
      })
    } catch (e) {
      console.error('[TEST DATA] Error loading:', e)
      console.error('[TEST DATA] Error details:', {
        message: e?.message,
        response: e?.response?.data,
        status: e?.response?.status,
        code: e?.code
      })
      // Umjesto alert-a, postavi default strukturu
      setTestData({
        users: {},
        documents: {},
        email: {
          testService: {
            apiKey: '',
            inboxId: '0'
          }
        },
        api: {
          baseUrl: 'https://api.uslugar.eu',
          frontendUrl: 'https://www.uslugar.eu'
        }
      })
      // Prikaži grešku samo u konzoli, ne blokiraj UI
      console.warn('[TEST DATA] Using default test data structure due to load error')
    }
  }

  useEffect(() => {
    if (tab === 'test-data') {
      loadTestData()
    }
  }, [tab])

  const saveTestData = async () => {
    if (!testData) return
    setSavingTestData(true)
    try {
      // Deep clone testData to ensure all nested changes are included
      const dataToSave = JSON.parse(JSON.stringify(testData))
      console.log('[TEST DATA] Saving:', JSON.stringify(dataToSave, null, 2))
      await api.post('/testing/test-data', dataToSave)
      alert('✅ Test podaci uspješno spremljeni')
      // Reload test data to ensure UI is in sync
      await loadTestData()
    } catch (e) {
      console.error('[TEST DATA] Save error:', e)
      alert(`❌ Greška pri spremanju: ${e?.response?.data?.error || e?.message || String(e)}`)
    } finally {
      setSavingTestData(false)
    }
  }

  const uploadTestDocument = async (file, key, description) => {
    setUploadingDocument(true)
    try {
      const formData = new FormData()
      formData.append('document', file)
      formData.append('key', key)
      formData.append('description', description || '')
      
      const res = await api.post('/testing/test-data/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Ažuriraj testData s novim dokumentom
      if (res.data.document && testData) {
        const updatedTestData = { ...testData }
        if (!updatedTestData.documents) {
          updatedTestData.documents = {}
        }
        updatedTestData.documents[key] = res.data.document
        setTestData(updatedTestData)
      }
      
      alert('✅ Dokument uspješno uploadan')
      return res.data
    } catch (e) {
      alert(`❌ Greška pri uploadu: ${e?.response?.data?.error || e?.message || String(e)}`)
      throw e
    } finally {
      setUploadingDocument(false)
    }
  }

  const updateTestDataField = (path, value) => {
    if (!testData) {
      // Ako testData ne postoji, kreiraj osnovnu strukturu
      const defaultData = {
        users: {},
        documents: {},
        testData: {},
        api: {
          baseUrl: (typeof window !== 'undefined' && window.location?.origin?.includes('localhost')) 
            ? 'http://localhost:4000' 
            : 'https://api.uslugar.eu',
          frontendUrl: (typeof window !== 'undefined' && window.location?.origin) || 'https://www.uslugar.eu',
          timeout: 30000,
          waitForNavigation: 3000
        },
        assertions: {}
      }
      setTestData(defaultData)
      // Nakon kreiranja default strukture, ažuriraj vrijednost
      setTimeout(() => {
        const keys = path.split('.')
        const updated = { ...defaultData }
        let current = updated
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {}
          } else {
            current[keys[i]] = { ...current[keys[i]] }
          }
          current = current[keys[i]]
        }
        
        current[keys[keys.length - 1]] = value
        setTestData(updated)
      }, 0)
      return
    }
    
    const keys = path.split('.')
    const updated = { ...testData }
    let current = updated
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      } else {
        current[keys[i]] = { ...current[keys[i]] }
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    setTestData(updated)
  }

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

  const handleRunAutomated = async (planId = null, testType = 'all') => {
    setRunningAutomated(true)
    setAutomatedTestResult(null)
    try {
      const res = await api.post('/testing/run-automated', { planId, testType })
      setAutomatedTestResult({
        success: true,
        message: res.data.message,
        command: res.data.command,
        note: res.data.note
      })
      // Pokaži toast ili poruku
      setTimeout(() => {
        setAutomatedTestResult(null)
      }, 10000)
    } catch (e) {
      console.error('[AUTOMATED TESTS] Error:', e)
      console.error('[AUTOMATED TESTS] Response data:', e?.response?.data)
      const errorData = e?.response?.data || {}
      setAutomatedTestResult({
        success: false,
        error: errorData.error || e?.message || String(e),
        message: errorData.message || 'Greška pri pokretanju automatskih testova',
        errors: Array.isArray(errorData.errors) ? errorData.errors : (errorData.error ? [errorData.error] : []),
        details: errorData.details || null
      })
      // Prikaži alert za testiranje
      if (errorData.errors && errorData.errors.length > 0) {
        alert(`Greške u test podacima:\n\n${errorData.errors.join('\n')}\n\n${errorData.details || ''}`)
      } else {
        alert(`Greška: ${errorData.error || e?.message || String(e)}`)
      }
      setTimeout(() => {
        setAutomatedTestResult(null)
      }, 20000) // Još duže prikazivanje za greške
    } finally {
      setRunningAutomated(false)
    }
  }

  // Učitaj rezultate testova
  const loadTestResults = async () => {
    setLoadingTestResults(true)
    try {
      const res = await api.get('/testing/test-results')
      setTestResults(res.data)
    } catch (e) {
      console.error('[TEST RESULTS] Error loading test results:', e)
      setTestResults({ exists: false, error: e?.response?.data?.error || e?.message })
    } finally {
      setLoadingTestResults(false)
    }
  }

  // Automatski učitaj rezultate nakon što su testovi pokrenuti
  useEffect(() => {
    if (automatedTestResult?.success) {
      // Pričekaj 5 sekundi prije prvog učitavanja (testovi trebaju vremena da se pokrenu)
      const timer = setTimeout(() => {
        loadTestResults()
      }, 5000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automatedTestResult?.success])

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

      {/* Automated Test Result Banner */}
      {automatedTestResult && (
        <div className={`p-4 rounded-lg border ${
          automatedTestResult.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{automatedTestResult.success ? '✅' : '❌'}</span>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">
                {automatedTestResult.success ? 'Automatski testovi pokrenuti' : 'Greška pri pokretanju testova'}
              </h4>
              <p className="text-sm">{automatedTestResult.message || automatedTestResult.error}</p>
              {automatedTestResult.errors && automatedTestResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold mb-1">Detalji grešaka:</p>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    {automatedTestResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {automatedTestResult.details && (
                <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                  <p className="font-semibold mb-1">💡 Upute:</p>
                  <p>{automatedTestResult.details}</p>
                </div>
              )}
              {automatedTestResult.command && (
                <p className="text-xs mt-2 font-mono bg-white/50 p-2 rounded">
                  {automatedTestResult.command}
                </p>
              )}
              {automatedTestResult.note && (
                <p className="text-xs mt-1 text-gray-600 italic">{automatedTestResult.note}</p>
              )}
              {/* Gumb za učitavanje rezultata */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={loadTestResults}
                  disabled={loadingTestResults}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingTestResults ? '⏳' : '🔄'} {loadingTestResults ? 'Učitavanje...' : 'Osvježi rezultate'}
                </button>
              </div>
            </div>
            <button 
              onClick={() => setAutomatedTestResult(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Test Results Display */}
      {testResults && (
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📊 Rezultati automatskih testova</h3>
            <button
              onClick={loadTestResults}
              disabled={loadingTestResults}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
            >
              {loadingTestResults ? '⏳' : '🔄'} Osvježi
            </button>
          </div>

          {!testResults.exists && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              <p className="text-sm">{testResults.message || 'Rezultati testova još nisu dostupni. Testovi se možda još izvršavaju.'}</p>
            </div>
          )}

          {testResults.exists && (
            <div className="space-y-4">
              {/* Statistike */}
              {testResults.stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">{testResults.stats.total}</div>
                    <div className="text-xs text-blue-600 mt-1">Ukupno testova</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <div className="text-2xl font-bold text-green-700">{testResults.stats.passed}</div>
                    <div className="text-xs text-green-600 mt-1">Uspješno</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <div className="text-2xl font-bold text-red-700">{testResults.stats.failed}</div>
                    <div className="text-xs text-red-600 mt-1">Neuspješno</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="text-2xl font-bold text-gray-700">{testResults.stats.skipped}</div>
                    <div className="text-xs text-gray-600 mt-1">Preskočeno</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">
                      {testResults.stats.duration ? `${Math.round(testResults.stats.duration / 1000)}s` : '-'}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">Trajanje</div>
                  </div>
                </div>
              )}

              {/* JSON Report Info */}
              {testResults.hasJsonReport && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                  <span className="font-semibold text-green-800">✅ JSON Report:</span>
                  <span className="text-green-700 ml-2">Dostupan</span>
                  {testResults.jsonReport && (
                    <div className="mt-2 text-xs text-green-600">
                      {testResults.jsonReport.suites} test suite-ova
                    </div>
                  )}
                </div>
              )}

              {/* HTML Report Info */}
              {testResults.hasHtmlReport && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <span className="font-semibold text-blue-800">📄 HTML Report:</span>
                  <span className="text-blue-700 ml-2">Dostupan</span>
                  <p className="text-xs text-blue-600 mt-1">
                    HTML report je generiran u <code className="bg-white px-1 rounded">playwright-report/</code> folderu.
                    Provjeri server logs za pristup reportu.
                  </p>
                </div>
              )}

              {/* Screenshotovi */}
              {testResults.screenshotsCount > 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">📸 Screenshotovi ({testResults.screenshotsCount})</span>
                  </div>
                  {testResults.screenshots && testResults.screenshots.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                      {testResults.screenshots.slice(0, 8).map((screenshot, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={`/api/testing/test-results/screenshot/${screenshot.path}`}
                            alt={`Screenshot ${idx + 1}`}
                            className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => window.open(`/api/testing/test-results/screenshot/${screenshot.path}`, '_blank')}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                            {screenshot.path.split('/').pop()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {testResults.screenshotsCount > 8 && (
                    <p className="text-xs text-gray-600 mt-2">
                      Prikazano prvih 8 od {testResults.screenshotsCount} screenshotova. Provjeri server logs za sve screenshotove.
                    </p>
                  )}
                </div>
              )}

              {!testResults.hasJsonReport && !testResults.hasHtmlReport && testResults.screenshotsCount === 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                  Rezultati testova su pronađeni, ali još nisu potpuno generirani. Pričekaj nekoliko sekundi i osvježi rezultate.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabs with badges */}
      <div className="flex items-center gap-2 border-b">
        <button 
          onClick={() => {
            const newHash = 'plans'
            // Ažuriraj hash bez redirecta - koristi history API da zadržiš /admin/testing
            if (window.location.hash !== `#${newHash}`) {
              window.history.pushState(null, '', `/admin/testing#${newHash}`)
              window.dispatchEvent(new HashChangeEvent('hashchange'))
            }
            setTab('plans')
          }} 
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
          onClick={() => {
            const newHash = 'runs'
            // Ažuriraj hash bez redirecta - koristi history API da zadržiš /admin/testing
            if (window.location.hash !== `#${newHash}`) {
              window.history.pushState(null, '', `/admin/testing#${newHash}`)
              window.dispatchEvent(new HashChangeEvent('hashchange'))
            }
            setTab('runs')
          }} 
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
          onClick={() => {
            const newHash = 'test-data'
            // Ažuriraj hash bez redirecta - koristi history API da zadržiš /admin/testing
            if (window.location.hash !== `#${newHash}`) {
              window.history.pushState(null, '', `/admin/testing#${newHash}`)
              window.dispatchEvent(new HashChangeEvent('hashchange'))
            }
            setTab('test-data')
          }} 
          className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-150 ${
            tab==='test-data'
              ? 'bg-indigo-600 text-white shadow-sm border-b-2 border-indigo-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Test Podaci
        </button>
        <button 
          onClick={() => {
            const newHash = 'new'
            // Ažuriraj hash bez redirecta - koristi history API da zadržiš /admin/testing
            if (window.location.hash !== `#${newHash}`) {
              window.history.pushState(null, '', `/admin/testing#${newHash}`)
              window.dispatchEvent(new HashChangeEvent('hashchange'))
            }
            setTab('new')
          }} 
          className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-150 ${
            tab==='new'
              ? 'bg-indigo-600 text-white shadow-sm border-b-2 border-indigo-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Novi plan
        </button>
        <div className="relative">
          <button 
            onClick={() => handleRunAutomated(null, 'all')} 
            disabled={runningAutomated} 
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-150 ${
              runningAutomated
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            title="Pokreće automatske E2E testove (Playwright)"
          >
            {runningAutomated && <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>🤖</span>
            <span>{runningAutomated ? 'Pokretanje...' : 'Pokreni automatske testove'}</span>
          </button>
          {/* Dropdown za pojedinačne testove */}
          <div className="absolute right-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50 hidden group-hover:block">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-700 mb-2 px-2">Pojedinačni testovi:</div>
              <div className="space-y-1">
                <button
                  onClick={() => handleRunAutomated(null, 'all', 'Registracija korisnika usluge')}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  📝 Registracija korisnika
                </button>
                <button
                  onClick={() => handleRunAutomated(null, 'all', 'Prijava i odjava')}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  🔐 Prijava i odjava
                </button>
                <button
                  onClick={() => handleRunAutomated(null, 'all', 'KYC: Upload dokumenta')}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  📄 KYC Upload
                </button>
                <button
                  onClick={() => handleRunAutomated(null, 'all', 'Objava posla')}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  💼 Objava posla
                </button>
                <button
                  onClick={() => handleRunAutomated(null, 'all', 'Kompletni E2E flow')}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  🎯 Kompletni E2E flow
                </button>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSeed} 
          disabled={seeding} 
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-150 ${
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
                <div className="flex flex-col gap-2 ml-4">
                  <button 
                    onClick={() => setActivePlan(pl)} 
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-150 text-sm"
                  >
                    ▶️ Pokreni run
                  </button>
                  <button 
                    onClick={() => handleRunAutomated(pl.id, 'all')} 
                    disabled={runningAutomated}
                    className={`px-4 py-2 rounded hover:transition-colors duration-150 text-sm flex items-center gap-2 justify-center ${
                      runningAutomated
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    title="Pokreće automatske testove za ovaj plan"
                  >
                    {runningAutomated && <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
                    <span>🤖 Auto test</span>
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

      {tab === 'test-data' && (
        <div className="space-y-6">
          {!testData ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">Učitavanje test podataka...</p>
            </div>
          ) : (
            <>
              {/* Test Korisnici */}
              <div className="border rounded-lg p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Test Korisnici</h3>
                  <div className="text-sm text-gray-600">
                    💡 Dodaj više korisnika po ulogama za kompleksnije testove
                  </div>
                </div>
                
                {/* Grupe korisnika po ulogama */}
                {[
                  { key: 'client', label: 'Klijenti (Clients)', role: 'USER', canAddMultiple: true },
                  { key: 'provider', label: 'Pružatelji (Providers)', role: 'PROVIDER', canAddMultiple: true },
                  { key: 'admin', label: 'Administratori', role: 'ADMIN', canAddMultiple: true }
                ].map(group => {
                  // Pronađi sve korisnike koji pripadaju ovoj grupi
                  const groupUsers = testData && testData.users ? Object.keys(testData.users)
                    .filter(key => {
                      if (group.key === 'client') {
                        // client, clientInvalid, client1, client2, ...
                        return key === 'client' || key === 'clientInvalid' || (key.startsWith('client') && /client\d+/.test(key));
                      } else                       if (group.key === 'provider') {
                        // provider, providerNoLicense, providerNoKYC, providerDirector, providerTeamMember, provider1, provider2, ... (ali ne providerCompany)
                        return (key === 'provider' || key === 'providerNoLicense' || key === 'providerNoKYC' || 
                                key === 'providerDirector' || key === 'providerTeamMember' ||
                                (key.startsWith('provider') && /provider\d+/.test(key))) && key !== 'providerCompany';
                      } else if (group.key === 'admin') {
                        return key === 'admin' || key.startsWith('admin') && /admin\d+/.test(key);
                      }
                      return false;
                    })
                    .sort((a, b) => {
                      // Prvo osnovni (client, provider, admin), zatim edge case (clientInvalid, providerNoLicense, providerNoKYC), zatim numerirani (client1, client2, ...)
                      if (a === group.key) return -1;
                      if (b === group.key) return 1;
                      
                      // Edge case korisnici idu odmah nakon osnovnog
                      const edgeCaseOrder = {
                        'clientInvalid': 1,
                        'providerNoLicense': 1,
                        'providerNoKYC': 2,
                        'providerDirector': 3,
                        'providerTeamMember': 4
                      };
                      const edgeA = edgeCaseOrder[a] || 999;
                      const edgeB = edgeCaseOrder[b] || 999;
                      if (edgeA !== 999 || edgeB !== 999) {
                        return edgeA - edgeB;
                      }
                      
                      // Zatim numerirani
                      const numA = parseInt(a.match(/\d+/)?.[0] || '999');
                      const numB = parseInt(b.match(/\d+/)?.[0] || '999');
                      return numA - numB;
                    }) : [];
                  
                  // Ako nema korisnika u grupi, dodaj osnovnog
                  if (groupUsers.length === 0 && testData && testData.users) {
                    groupUsers.push(group.key);
                  }
                  
                  return (
                    <div key={group.key} className="mb-6 border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-base">{group.label}</h4>
                        {group.canAddMultiple && (
                          <button
                            onClick={() => {
                              if (!testData) return
                              const updated = JSON.parse(JSON.stringify(testData))
                              if (!updated.users) updated.users = {}
                              
                              // Pronađi sve numerirane korisnike iz ove grupe
                              const numberedUsers = groupUsers
                                .filter(k => k !== group.key && !['clientInvalid', 'providerNoLicense', 'providerNoKYC', 'providerDirector', 'providerTeamMember'].includes(k))
                                .map(k => {
                                  const match = k.match(/\d+/)
                                  return match ? parseInt(match[0]) : 0
                                })
                                .filter(n => n > 0)
                              
                              // Pronađi sljedeći broj
                              const nextNum = numberedUsers.length > 0 
                                ? Math.max(...numberedUsers) + 1
                                : 1
                              
                              const newKey = `${group.key}${nextNum}`
                              
                              console.log('[TEST DATA] Adding new user:', {
                                group: group.key,
                                groupUsers,
                                numberedUsers,
                                nextNum,
                                newKey
                              })
                              
                              // Kreiraj novog korisnika s default vrijednostima
                              updated.users[newKey] = {
                                email: `test.${newKey}@uslugar.hr`,
                                password: 'Test123456!',
                                fullName: `Test ${group.key.charAt(0).toUpperCase() + group.key.slice(1)} ${nextNum}`,
                                phone: `+38599${String(1000 + nextNum).slice(-7)}`,
                                city: 'Zagreb',
                                ...(group.role === 'PROVIDER' && {
                                  legalStatus: 'FREELANCER',
                                  oib: `${12345678900 + nextNum}`,
                                  companyName: null
                                }),
                                emailAccess: true,
                                emailConfig: {}
                              }
                              
                              setTestData(updated)
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <span>+</span>
                            <span>Dodaj {group.key === 'client' ? 'klijenta' : group.key === 'provider' ? 'pružatelja' : 'admina'}</span>
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {groupUsers.map(userKey => (
                          <div key={userKey} className="border rounded p-4 bg-white">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-sm capitalize">
                                {userKey === group.key 
                                  ? `${group.key === 'client' ? 'Glavni klijent' : group.key === 'provider' ? 'Glavni pružatelj' : 'Glavni admin'} (${userKey})`
                                  : userKey === 'clientInvalid'
                                  ? 'Klijent s neispravnim podacima (clientInvalid)'
                                  : userKey === 'providerNoLicense'
                                  ? 'Pružatelj bez licence (providerNoLicense)'
                                  : userKey === 'providerNoKYC'
                                  ? 'Pružatelj bez KYC (providerNoKYC)'
                                  : `${userKey.replace(/([A-Z])/g, ' $1').trim()}`
                                }
                                {userKey === 'clientInvalid' && (
                                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">Neispravni podaci</span>
                                )}
                                {userKey === 'providerNoLicense' && (
                                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">Bez licence</span>
                                )}
                                {userKey === 'providerNoKYC' && (
                                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">Bez KYC</span>
                                )}
                                {userKey === 'providerDirector' && (
                                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">Direktor</span>
                                )}
                                {userKey === 'providerTeamMember' && (
                                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">Izvođač</span>
                                )}
                              </h5>
                              {(userKey !== group.key && userKey !== 'clientInvalid' && userKey !== 'providerNoLicense' && userKey !== 'providerNoKYC' && userKey !== 'providerDirector' && userKey !== 'providerTeamMember') && (
                                <button
                                  onClick={() => {
                                    if (!testData || !confirm(`Jeste li sigurni da želite obrisati korisnika "${userKey}"?`)) return
                                    const updated = { ...testData }
                                    if (updated.users) {
                                      delete updated.users[userKey]
                                      setTestData(updated)
                                    }
                                  }}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                >
                                  🗑️ Obriši
                                </button>
                              )}
                              {(userKey === 'clientInvalid' || userKey === 'providerNoLicense' || userKey === 'providerNoKYC') && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  📌 Predefinirani edge case
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input
                            type="email"
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={testData && testData.users && testData.users[userKey] && testData.users[userKey].email ? testData.users[userKey].email : ''}
                            onChange={e => {
                              if (!testData) return
                              const updated = { ...testData }
                              if (!updated.users) updated.users = {}
                              if (!updated.users[userKey]) updated.users[userKey] = {}
                              setTestData({
                                ...updated,
                                users: {
                                  ...updated.users,
                                  [userKey]: { ...updated.users[userKey], email: e.target.value }
                                }
                              })
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Lozinka
                            <span className="text-xs text-gray-500 ml-2">(za prijavu u aplikaciju, ne za Mailtrap)</span>
                          </label>
                          <input
                            type="password"
                            className="w-full border rounded px-3 py-2 text-sm"
                            placeholder="Test123456!"
                            value={testData && testData.users && testData.users[userKey] && testData.users[userKey].password ? testData.users[userKey].password : ''}
                            onChange={e => {
                              if (!testData) return
                              const updated = { ...testData }
                              if (!updated.users) updated.users = {}
                              if (!updated.users[userKey]) updated.users[userKey] = {}
                              setTestData({
                                ...updated,
                                users: {
                                  ...updated.users,
                                  [userKey]: { ...updated.users[userKey], password: e.target.value }
                                }
                              })
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            💡 Ovo je lozinka za prijavu test korisnika u aplikaciju. <strong>Mailtrap ne koristi lozinku</strong> - koristi se samo API Key i Inbox ID.
                          </p>
                        </div>
                        {userKey !== 'admin' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium mb-1">Puno Ime</label>
                              <input
                                type="text"
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="Ime Prezime"
                                value={testData && testData.users && testData.users[userKey] && testData.users[userKey].fullName ? testData.users[userKey].fullName : ''}
                                onChange={e => {
                                  if (!testData) return
                                  const updated = { ...testData }
                                  if (!updated.users) updated.users = {}
                                  if (!updated.users[userKey]) updated.users[userKey] = {}
                                  setTestData({
                                    ...updated,
                                    users: {
                                      ...updated.users,
                                      [userKey]: { ...updated.users[userKey], fullName: e.target.value }
                                    }
                                  })
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Telefon</label>
                              <input
                                type="text"
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="+385991234567"
                                value={testData && testData.users && testData.users[userKey] && testData.users[userKey].phone ? testData.users[userKey].phone : ''}
                                onChange={e => {
                                  if (!testData) return
                                  const updated = { ...testData }
                                  if (!updated.users) updated.users = {}
                                  if (!updated.users[userKey]) updated.users[userKey] = {}
                                  setTestData({
                                    ...updated,
                                    users: {
                                      ...updated.users,
                                      [userKey]: { ...updated.users[userKey], phone: e.target.value }
                                    }
                                  })
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Grad</label>
                              <input
                                type="text"
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="Zagreb"
                                value={testData && testData.users && testData.users[userKey] && testData.users[userKey].city ? testData.users[userKey].city : ''}
                                onChange={e => {
                                  if (!testData) return
                                  const updated = { ...testData }
                                  if (!updated.users) updated.users = {}
                                  if (!updated.users[userKey]) updated.users[userKey] = {}
                                  setTestData({
                                    ...updated,
                                    users: {
                                      ...updated.users,
                                      [userKey]: { ...updated.users[userKey], city: e.target.value }
                                    }
                                  })
                                }}
                              />
                            </div>
                            {(group.key === 'provider' || userKey.startsWith('provider')) && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Pravni Status *</label>
                                  <select
                                    className="w-full border rounded px-3 py-2 text-sm"
                                    value={testData && testData.users && testData.users[userKey] && testData.users[userKey].legalStatus ? testData.users[userKey].legalStatus : ''}
                                    onChange={e => {
                                      if (!testData) return
                                      const updated = { ...testData }
                                      if (!updated.users) updated.users = {}
                                      if (!updated.users[userKey]) updated.users[userKey] = {}
                                      setTestData({
                                        ...updated,
                                        users: {
                                          ...updated.users,
                                          [userKey]: { ...updated.users[userKey], legalStatus: e.target.value }
                                        }
                                      })
                                    }}
                                  >
                                    <option value="">Odaberi pravni status...</option>
                                    <option value="FREELANCER">FREELANCER - Samostalni djelatnik</option>
                                    <option value="SOLE_TRADER">SOLE_TRADER - Obrt</option>
                                    <option value="DOO">DOO - Društvo s ograničenom odgovornošću</option>
                                    <option value="D.O.O.">D.O.O. - Društvo s ograničenom odgovornošću</option>
                                  </select>
                                  <p className="text-xs text-gray-500 mt-0.5">* Obavezno za providere</p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">OIB / Porezni Broj *</label>
                                  <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2 text-sm"
                                    placeholder="12345678901"
                                    value={testData && testData.users && testData.users[userKey] && testData.users[userKey].oib ? testData.users[userKey].oib : ''}
                                    onChange={e => {
                                      if (!testData) return
                                      const updated = { ...testData }
                                      if (!updated.users) updated.users = {}
                                      if (!updated.users[userKey]) updated.users[userKey] = {}
                                      setTestData({
                                        ...updated,
                                        users: {
                                          ...updated.users,
                                          [userKey]: { ...updated.users[userKey], oib: e.target.value }
                                        }
                                      })
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-0.5">* Obavezno za providere (11 znamenki)</p>
                                </div>
                                {/* Naziv Tvrtke - za sve providere (obavezno za DOO i direktore) */}
                                {(group.key === 'provider' || userKey.startsWith('provider')) && userKey !== 'admin' && (
                                  <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">
                                      Naziv Tvrtke
                                      {(testData?.users?.[userKey]?.legalStatus === 'DOO' || testData?.users?.[userKey]?.legalStatus === 'D.O.O.' || testData?.users?.[userKey]?.isDirector) && (
                                        <span className="text-red-500"> *</span>
                                      )}
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full border rounded px-3 py-2 text-sm"
                                      placeholder="Primjer: Test DOO"
                                      value={testData && testData.users && testData.users[userKey] && testData.users[userKey].companyName ? testData.users[userKey].companyName : ''}
                                      onChange={e => {
                                        if (!testData) return
                                        const updated = { ...testData }
                                        if (!updated.users) updated.users = {}
                                        if (!updated.users[userKey]) updated.users[userKey] = {}
                                        setTestData({
                                          ...updated,
                                          users: {
                                            ...updated.users,
                                            [userKey]: { ...updated.users[userKey], companyName: e.target.value }
                                          }
                                        })
                                      }}
                                    />
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {testData?.users?.[userKey]?.legalStatus === 'DOO' || testData?.users?.[userKey]?.legalStatus === 'D.O.O.' || testData?.users?.[userKey]?.isDirector
                                        ? '* Obavezno za tvrtke (DOO, OBRT) i direktore'
                                        : 'Opcionalno za samostalne djelatnike (FREELANCER)'}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Direktor i Company ID - za providere */}
                                {(group.key === 'provider' || userKey.startsWith('provider')) && userKey !== 'admin' && (
                                  <>
                                    <div className="col-span-2">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={!!testData?.users?.[userKey]?.isDirector}
                                          onChange={e => {
                                            if (!testData) return
                                            const updated = { ...testData }
                                            if (!updated.users) updated.users = {}
                                            if (!updated.users[userKey]) updated.users[userKey] = {}
                                            if (e.target.checked) {
                                              updated.users[userKey].isDirector = true
                                              // Ako je direktor, obriši companyId
                                              delete updated.users[userKey].companyId
                                              // Ako je direktor, naziv tvrtke je obavezan
                                              if (!updated.users[userKey].companyName) {
                                                updated.users[userKey].companyName = `Test DOO ${Date.now()}`
                                              }
                                              // Ako je direktor, postavi legalStatus na DOO ako nije već postavljen
                                              if (!updated.users[userKey].legalStatus || updated.users[userKey].legalStatus === 'FREELANCER') {
                                                updated.users[userKey].legalStatus = 'DOO'
                                              }
                                            } else {
                                              delete updated.users[userKey].isDirector
                                            }
                                            setTestData(updated)
                                          }}
                                          className="text-indigo-600"
                                        />
                                        <span className="text-sm font-medium">Direktor (vlasnik tvrtke)</span>
                                      </label>
                                      <p className="text-xs text-gray-500 mt-0.5 ml-6">Direktor ima naziv tvrtke i može imati izvođače (team members)</p>
                                    </div>
                                    {!testData?.users?.[userKey]?.isDirector && (
                                      <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Company ID (ID direktora)</label>
                                        <input
                                          type="text"
                                          className="w-full border rounded px-3 py-2 text-sm"
                                          placeholder="Email direktora ili ID tvrtke (npr. test.director@uslugar.hr)"
                                          value={testData && testData.users && testData.users[userKey] && testData.users[userKey].companyId ? testData.users[userKey].companyId : ''}
                                          onChange={e => {
                                            if (!testData) return
                                            const updated = { ...testData }
                                            if (!updated.users) updated.users = {}
                                            if (!updated.users[userKey]) updated.users[userKey] = {}
                                            setTestData({
                                              ...updated,
                                              users: {
                                                ...updated.users,
                                                [userKey]: { ...updated.users[userKey], companyId: e.target.value }
                                              }
                                            })
                                          }}
                                        />
                                        <p className="text-xs text-gray-500 mt-0.5">Za izvođače koji rade za direktora (npr. email direktora ili ID tvrtke)</p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </>
                        )}
                        {userKey === 'admin' && (
                          <div className="col-span-2">
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                              <strong>💡 Napomena:</strong> Admin korisnik koristi samo email i lozinku za prijavu.
                            </div>
                          </div>
                        )}
                        
                        {/* Dokumenti i Portfolio (za providere) */}
                        {((group.key === 'provider' || userKey.startsWith('provider')) && userKey !== 'admin') && (
                          <div className="col-span-2 mt-3 pt-3 border-t">
                            <label className="block text-xs font-medium mb-2 text-gray-700">
                              📄 Dokumenti i Portfolio
                            </label>
                            <div className="space-y-2 mb-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!testData?.users?.[userKey]?.skipLicense}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    if (e.target.checked) {
                                      updated.users[userKey].skipLicense = true
                                    } else {
                                      delete updated.users[userKey].skipLicense
                                    }
                                    setTestData(updated)
                                  }}
                                  className="text-indigo-600"
                                />
                                <span className="text-xs">⚠️ Preskoči upload licence (korisnik bez licence)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!testData?.users?.[userKey]?.skipKYC}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    if (e.target.checked) {
                                      updated.users[userKey].skipKYC = true
                                    } else {
                                      delete updated.users[userKey].skipKYC
                                    }
                                    setTestData(updated)
                                  }}
                                  className="text-indigo-600"
                                />
                                <span className="text-xs">⚠️ Preskoči upload KYC dokumenta (korisnik bez KYC)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!testData?.users?.[userKey]?.skipPortfolio}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    if (e.target.checked) {
                                      updated.users[userKey].skipPortfolio = true
                                    } else {
                                      delete updated.users[userKey].skipPortfolio
                                    }
                                    setTestData(updated)
                                  }}
                                  className="text-indigo-600"
                                />
                                <span className="text-xs">⚠️ Preskoči upload portfolio slika (korisnik bez portfolija)</span>
                              </label>
                            </div>
                            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200 mb-3">
                              <strong>💡 Objašnjenje:</strong>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                <li><strong>Preskoči upload licence:</strong> Korisnik će biti kreiran bez licence (testiranje funkcionalnosti bez licence)</li>
                                <li><strong>Preskoči upload KYC dokumenta:</strong> Korisnik će biti kreiran bez KYC dokumenta (testiranje funkcionalnosti bez KYC)</li>
                                <li><strong>Preskoči upload portfolio slika:</strong> Korisnik će biti kreiran bez portfolio slika (testiranje funkcionalnosti bez portfolija)</li>
                                <li>Ako checkbox nije označen, dokumenti će biti uploadani automatski (koristi se per-korisnik dokument ako postoji, inače globalni)</li>
                              </ul>
                            </div>
                            
                            {/* Per-korisnik dokumenti (opcionalno override globalnih) */}
                            <details className="mt-3 pt-3 border-t cursor-pointer">
                              <summary className="text-xs font-medium text-gray-700 mb-2">
                                📄 Per-korisnik dokumenti (opcionalno - override globalnih)
                              </summary>
                              <div className="mt-2 space-y-2 bg-green-50 p-3 rounded text-xs text-green-800 mb-3">
                                <strong>💡 Objašnjenje:</strong>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                  <li>Ovo su dokumenti specifični za ovog korisnika</li>
                                  <li>Ako postaveš dokument ovdje, koristi se umjesto globalnog dokumenta</li>
                                  <li>Ako nema dokumenta ovdje, koristi se globalni dokument iz sekcije "Test Dokumenti"</li>
                                  <li>Korisno za edge case testove (npr. različita licenca za različite testove)</li>
                                </ul>
                              </div>
                              <div className="space-y-3">
                                {['license', 'kycDocument', 'portfolioImage1', 'portfolioImage2'].map(docKey => {
                                  const userDoc = testData?.users?.[userKey]?.documents?.[docKey];
                                  const globalDoc = testData?.documents?.[docKey];
                                  return (
                                    <div key={docKey} className="border rounded p-3 bg-gray-50">
                                      <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-medium capitalize">{docKey.replace(/([A-Z])/g, ' $1').trim()}</label>
                                        {globalDoc && !userDoc && (
                                          <span className="text-xs text-gray-500">(koristi globalni)</span>
                                        )}
                                        {userDoc && (
                                          <span className="text-xs text-green-600 font-medium">(per-korisnik)</span>
                                        )}
                                      </div>
                                      {userDoc && userDoc.url && (
                                        <div className="mb-2">
                                          <a href={userDoc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                            📄 {userDoc.originalName || docKey} ({userDoc.type})
                                          </a>
                                        </div>
                                      )}
                                      <input
                                        type="file"
                                        accept={docKey.includes('Image') ? '.jpg,.jpeg,.png' : '.pdf,.jpg,.jpeg,.png'}
                                        className="w-full text-xs"
                                        onChange={async (e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            if (!testData) return;
                                            const formData = new FormData();
                                            formData.append('document', file);
                                            formData.append('key', docKey);
                                            formData.append('description', `${docKey} for ${userKey}`);
                                            
                                            try {
                                              const res = await api.post('/testing/test-data/upload-document', formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                              });
                                              
                                              // Dodaj dokument u per-korisnik dokumente
                                              const updated = { ...testData };
                                              if (!updated.users) updated.users = {};
                                              if (!updated.users[userKey]) updated.users[userKey] = {};
                                              if (!updated.users[userKey].documents) updated.users[userKey].documents = {};
                                              
                                              updated.users[userKey].documents[docKey] = res.data.document || {
                                                url: res.data.document.url,
                                                filename: res.data.document.filename,
                                                originalName: res.data.document.originalName,
                                                type: res.data.document.type
                                              };
                                              
                                              setTestData(updated);
                                              alert(`✅ Dokument uploadan za korisnika ${userKey}`);
                                            } catch (error) {
                                              alert(`❌ Greška pri upload-u: ${error?.response?.data?.error || error?.message}`);
                                            }
                                            e.target.value = '';
                                          }
                                        }}
                                      />
                                      {userDoc && (
                                        <button
                                          onClick={() => {
                                            if (!testData || !confirm(`Obrisati per-korisnik dokument ${docKey}?`)) return;
                                            const updated = { ...testData };
                                            if (updated.users?.[userKey]?.documents) {
                                              delete updated.users[userKey].documents[docKey];
                                              if (Object.keys(updated.users[userKey].documents).length === 0) {
                                                delete updated.users[userKey].documents;
                                              }
                                            }
                                            setTestData(updated);
                                          }}
                                          className="mt-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                                        >
                                          Obriši
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          </div>
                        )}

                            {/* Tip korisnika za testiranje (valid/invalid/missing) */}
                            <div className="col-span-2 mt-3 pt-3 border-t">
                              <label className="block text-xs font-medium mb-2 text-gray-700">
                                🎯 Tip Test Korisnika
                              </label>
                              <div className="flex flex-wrap gap-3 mb-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`userType_${userKey}`}
                                    checked={testData?.users?.[userKey] ? !(testData.users[userKey].invalidData || testData.users[userKey].missingData) : true}
                                    onChange={() => {
                                      if (!testData) return
                                      const updated = JSON.parse(JSON.stringify(testData))
                                      if (!updated.users) updated.users = {}
                                      if (!updated.users[userKey]) updated.users[userKey] = {}
                                      delete updated.users[userKey].invalidData
                                      delete updated.users[userKey].missingData
                                      setTestData(updated)
                                    }}
                                    className="text-indigo-600"
                                  />
                                  <span className="text-xs">✅ Ispravni podaci (standardni test)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`userType_${userKey}`}
                                    checked={testData?.users?.[userKey]?.invalidData === true || testData?.users?.[userKey]?.invalidData === 'true'}
                                    onChange={() => {
                                      if (!testData) return
                                      const updated = JSON.parse(JSON.stringify(testData))
                                      if (!updated.users) updated.users = {}
                                      if (!updated.users[userKey]) updated.users[userKey] = {}
                                      updated.users[userKey].invalidData = true
                                      delete updated.users[userKey].missingData
                                      setTestData(updated)
                                    }}
                                    className="text-red-600"
                                  />
                                  <span className="text-xs">❌ Neispravni podaci (test validacije)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`userType_${userKey}`}
                                    checked={testData?.users?.[userKey]?.missingData === true || testData?.users?.[userKey]?.missingData === 'true'}
                                    onChange={() => {
                                      if (!testData) return
                                      const updated = JSON.parse(JSON.stringify(testData))
                                      if (!updated.users) updated.users = {}
                                      if (!updated.users[userKey]) updated.users[userKey] = {}
                                      updated.users[userKey].missingData = true
                                      delete updated.users[userKey].invalidData
                                      setTestData(updated)
                                    }}
                                    className="text-orange-600"
                                  />
                                  <span className="text-xs">⚠️ Nedostajući podaci (test validacije)</span>
                                </label>
                              </div>
                              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200 mb-3">
                                <strong>💡 Objašnjenje:</strong>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                  <li><strong>Ispravni podaci:</strong> Standardni korisnik s ispravnim emailom, OIB-om, itd.</li>
                                  <li><strong>Neispravni podaci:</strong> Korisnik s neispravnim emailom (npr. invalid-email), prekratkim OIB-om, itd.</li>
                                  <li><strong>Nedostajući podaci:</strong> Korisnik s nedostajućim obaveznim poljima (npr. bez imena, bez grada)</li>
                                  <li>Svaki tip korisnika koristi različite Mailtrap email adrese (vidi Email Pristup ispod)</li>
                                </ul>
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                  <strong>⚠️ Važno:</strong> Nakon promjene tipa korisnika, klikni <strong>"💾 Spremi test podatke"</strong> (na dnu stranice) da se promjena sačuva!
                                </div>
                              </div>
                            </div>

                            {/* Email Konfiguracija za korisnika (opcionalno) */}
                            <div className="col-span-2 mt-3 pt-3 border-t">
                              {/* Pregled email adresa - uvijek vidljiv */}
                              <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                                <div className="text-sm font-semibold text-gray-700 mb-2">
                                  📧 Mailtrap Email Adrese za {userKey.replace(/([A-Z])/g, ' $1').trim()}:
                                </div>
                                <div className="space-y-1 text-xs">
                                  {testData?.users?.[userKey]?.invalidData ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <span className="text-red-600 font-medium">❌ Neispravni podaci:</span>
                                        <span className="font-mono bg-white px-2 py-1 rounded border border-red-200">
                                          {testData?.users?.[userKey]?.mailtrapEmailInvalid || '(nije postavljeno)'}
                                        </span>
                                      </div>
                                      {testData?.users?.[userKey]?.emailConfigInvalid?.inboxId && (
                                        <div className="text-gray-600 ml-4">
                                          📥 Inbox ID: <span className="font-mono">{testData.users[userKey].emailConfigInvalid.inboxId}</span>
                                        </div>
                                      )}
                                    </>
                                  ) : testData?.users?.[userKey]?.missingData ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <span className="text-orange-600 font-medium">⚠️ Nedostajući podaci:</span>
                                        <span className="font-mono bg-white px-2 py-1 rounded border border-orange-200">
                                          {testData?.users?.[userKey]?.mailtrapEmailMissing || '(nije postavljeno)'}
                                        </span>
                                      </div>
                                      {testData?.users?.[userKey]?.emailConfigMissing?.inboxId && (
                                        <div className="text-gray-600 ml-4">
                                          📥 Inbox ID: <span className="font-mono">{testData.users[userKey].emailConfigMissing.inboxId}</span>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <span className="text-green-600 font-medium">✅ Ispravni podaci:</span>
                                        <span className="font-mono bg-white px-2 py-1 rounded border border-green-200">
                                          {testData?.users?.[userKey]?.mailtrapEmail || '(nije postavljeno)'}
                                        </span>
                                      </div>
                                      {testData?.users?.[userKey]?.emailConfig?.inboxId && (
                                        <div className="text-gray-600 ml-4">
                                          📥 Inbox ID: <span className="font-mono">{testData.users[userKey].emailConfig.inboxId}</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                                {(!testData?.users?.[userKey]?.mailtrapEmail && !testData?.users?.[userKey]?.mailtrapEmailInvalid && !testData?.users?.[userKey]?.mailtrapEmailMissing) && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                    <strong>💡 Kako postaviti:</strong>
                                    <ol className="list-decimal list-inside mt-1 space-y-1 ml-2">
                                      <li>Klikni na <strong>"⚙️ Uredi Email Konfiguraciju"</strong> ispod</li>
                                      <li>Unesi Mailtrap email adresu (npr. <code className="bg-white px-1 rounded">test.client@mailtrap.io</code>)</li>
                                      <li>Unesi Mailtrap Inbox ID (npr. <code className="bg-white px-1 rounded">12345</code>)</li>
                                      <li>Klikni <strong>"💾 Spremi test podatke"</strong> na dnu stranice</li>
                                    </ol>
                                  </div>
                                )}
                              </div>
                              <details className="cursor-pointer" open>
                                <summary className="text-sm font-medium text-gray-700 mb-2">
                                  ⚙️ Uredi Email Konfiguraciju za {userKey.replace(/([A-Z])/g, ' $1').trim()}
                                </summary>
                                <div className="mt-2 space-y-2 bg-blue-50 p-3 rounded text-xs text-blue-800 mb-3">
                                  <strong>💡 Objašnjenje:</strong>
                                  <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li><strong>Email za ispravne podatke:</strong> Email adresa za standardne testove (npr. test.client@mailtrap.io)</li>
                                    <li><strong>Email za neispravne podatke:</strong> Email adresa za testove s neispravnim podacima (npr. test.client.invalid@mailtrap.io)</li>
                                    <li><strong>Email za nedostajuće podatke:</strong> Email adresa za testove s nedostajućim podacima (npr. test.client.missing@mailtrap.io)</li>
                                    <li><strong>Mailtrap Inbox ID:</strong> ID inbox-a u Mailtrap-u za ovu grupu korisnika</li>
                                    <li>Ako ne postaviš inbox ID, koristi se globalni inbox iz Email Konfiguracije (gore)</li>
                                  </ul>
                                </div>
                                <div className="space-y-3">
                                  {/* Email za ispravne podatke */}
                                  {(!testData?.users?.[userKey]?.invalidData && !testData?.users?.[userKey]?.missingData) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-xs font-medium mb-1">
                                          ✅ Mailtrap Email (za ispravne podatke)
                                        </label>
                                        <input
                                          type="email"
                                          className="w-full border rounded px-2 py-1.5 text-xs"
                                          placeholder="test.client@mailtrap.io"
                                          value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].mailtrapEmail) || ''}
                                          onChange={e => {
                                            if (!testData) return
                                            const updated = { ...testData }
                                            if (!updated.users) updated.users = {}
                                            if (!updated.users[userKey]) updated.users[userKey] = {}
                                            setTestData({
                                              ...updated,
                                              users: {
                                                ...updated.users,
                                                [userKey]: {
                                                  ...updated.users[userKey],
                                                  mailtrapEmail: e.target.value
                                                }
                                              }
                                            })
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1">Mailtrap Inbox ID</label>
                                        <input
                                          type="text"
                                          className="w-full border rounded px-2 py-1.5 text-xs"
                                          placeholder="npr. 12345 (ili ostavi prazno za globalni)"
                                          value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].emailConfig && testData.users[userKey].emailConfig.inboxId) || ''}
                                          onChange={e => {
                                            if (!testData) return
                                            const updated = { ...testData }
                                            if (!updated.users) updated.users = {}
                                            if (!updated.users[userKey]) updated.users[userKey] = {}
                                            if (!updated.users[userKey].emailConfig) updated.users[userKey].emailConfig = {}
                                            setTestData({
                                              ...updated,
                                              users: {
                                                ...updated.users,
                                                [userKey]: {
                                                  ...updated.users[userKey],
                                                  emailConfig: {
                                                    ...updated.users[userKey].emailConfig,
                                                    inboxId: e.target.value
                                                  }
                                                }
                                              }
                                            })
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Email za neispravne podatke */}
                                  {testData?.users?.[userKey]?.invalidData && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-xs font-medium mb-1">
                                          ❌ Mailtrap Email (za neispravne podatke)
                                        </label>
                                        <input
                                          type="email"
                                          className="w-full border rounded px-2 py-1.5 text-xs border-red-300"
                                          placeholder="test.client.invalid@mailtrap.io"
                                          value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].mailtrapEmailInvalid) || ''}
                                          onChange={e => {
                                            if (!testData) return
                                            const updated = { ...testData }
                                            if (!updated.users) updated.users = {}
                                            if (!updated.users[userKey]) updated.users[userKey] = {}
                                            setTestData({
                                              ...updated,
                                              users: {
                                                ...updated.users,
                                                [userKey]: {
                                                  ...updated.users[userKey],
                                                  mailtrapEmailInvalid: e.target.value
                                                }
                                              }
                                            })
                                          }}
                                        />
                                        <p className="text-xs text-gray-500 mt-0.5">Koristi se za testove s neispravnim podacima</p>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1">Mailtrap Inbox ID (Invalid)</label>
                                        <input
                                          type="text"
                                          className="w-full border rounded px-2 py-1.5 text-xs border-red-300"
                                          placeholder="npr. 12346 (ili ostavi prazno za globalni)"
                                          value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].emailConfigInvalid && testData.users[userKey].emailConfigInvalid.inboxId) || ''}
                                          onChange={e => {
                                            if (!testData) return
                                            const updated = { ...testData }
                                            if (!updated.users) updated.users = {}
                                            if (!updated.users[userKey]) updated.users[userKey] = {}
                                            if (!updated.users[userKey].emailConfigInvalid) updated.users[userKey].emailConfigInvalid = {}
                                            setTestData({
                                              ...updated,
                                              users: {
                                                ...updated.users,
                                                [userKey]: {
                                                  ...updated.users[userKey],
                                                  emailConfigInvalid: {
                                                    ...updated.users[userKey].emailConfigInvalid,
                                                    inboxId: e.target.value
                                                  }
                                                }
                                              }
                                            })
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Email za nedostajuće podatke */}
                                  {testData?.users?.[userKey]?.missingData && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-xs font-medium mb-1">
                                          ⚠️ Mailtrap Email (za nedostajuće podatke)
                                        </label>
                                        <input
                                          type="email"
                                          className="w-full border rounded px-2 py-1.5 text-xs border-orange-300"
                                          placeholder="test.client.missing@mailtrap.io"
                                          value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].mailtrapEmailMissing) || ''}
                                          onChange={e => {
                                            if (!testData) return
                                            const updated = { ...testData }
                                            if (!updated.users) updated.users = {}
                                            if (!updated.users[userKey]) updated.users[userKey] = {}
                                            setTestData({
                                              ...updated,
                                              users: {
                                                ...updated.users,
                                                [userKey]: {
                                                  ...updated.users[userKey],
                                                  mailtrapEmailMissing: e.target.value
                                                }
                                              }
                                            })
                                          }}
                                        />
                                        <p className="text-xs text-gray-500 mt-0.5">Koristi se za testove s nedostajućim podacima</p>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1">Mailtrap Inbox ID (Missing)</label>
                                        <input
                                          type="text"
                                          className="w-full border rounded px-2 py-1.5 text-xs border-orange-300"
                                          placeholder="npr. 12347 (ili ostavi prazno za globalni)"
                                          value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].emailConfigMissing && testData.users[userKey].emailConfigMissing.inboxId) || ''}
                                          onChange={e => {
                                            if (!testData) return
                                            const updated = { ...testData }
                                            if (!updated.users) updated.users = {}
                                            if (!updated.users[userKey]) updated.users[userKey] = {}
                                            if (!updated.users[userKey].emailConfigMissing) updated.users[userKey].emailConfigMissing = {}
                                            setTestData({
                                              ...updated,
                                              users: {
                                                ...updated.users,
                                                [userKey]: {
                                                  ...updated.users[userKey],
                                                  emailConfigMissing: {
                                                    ...updated.users[userKey].emailConfigMissing,
                                                    inboxId: e.target.value
                                                  }
                                                }
                                              }
                                            })
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                                  <strong>📝 Napomena:</strong> Email adresa ovog korisnika ({testData?.users?.[userKey]?.email || 'nepostavljeno'}) treba biti konfigurirana u aplikaciji da šalje emailove na Mailtrap email adresu ({testData?.users?.[userKey]?.mailtrapEmail || 'nepostavljeno'}) ili koristi Mailtrap inbox direktno.
                                </div>
                              </details>
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  )
                })}
                
                {/* Provider Company (posebna grupa) */}
                {testData?.users?.providerCompany && (
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-base">Pružatelj kao Tvrtka (Provider Company)</h4>
                    </div>
                    <div className="border rounded p-4 bg-white">
                      {(() => {
                        const userKey = 'providerCompany'
                        return (
                          <>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-sm">Provider Company</h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                  type="email"
                                  className="w-full border rounded px-3 py-2 text-sm"
                                  value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].email) || ''}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    setTestData({
                                      ...updated,
                                      users: {
                                        ...updated.users,
                                        [userKey]: { ...updated.users[userKey], email: e.target.value }
                                      }
                                    })
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Lozinka</label>
                                <input
                                  type="password"
                                  className="w-full border rounded px-3 py-2 text-sm"
                                  value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].password) || ''}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    setTestData({
                                      ...updated,
                                      users: {
                                        ...updated.users,
                                        [userKey]: { ...updated.users[userKey], password: e.target.value }
                                      }
                                    })
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Puno Ime</label>
                                <input
                                  type="text"
                                  className="w-full border rounded px-3 py-2 text-sm"
                                  placeholder="Ime Prezime"
                                  value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].fullName) || ''}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    setTestData({
                                      ...updated,
                                      users: {
                                        ...updated.users,
                                        [userKey]: { ...updated.users[userKey], fullName: e.target.value }
                                      }
                                    })
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Telefon</label>
                                <input
                                  type="text"
                                  className="w-full border rounded px-3 py-2 text-sm"
                                  placeholder="+385991234567"
                                  value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].phone) || ''}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    setTestData({
                                      ...updated,
                                      users: {
                                        ...updated.users,
                                        [userKey]: { ...updated.users[userKey], phone: e.target.value }
                                      }
                                    })
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Grad</label>
                                <input
                                  type="text"
                                  className="w-full border rounded px-3 py-2 text-sm"
                                  placeholder="Zagreb"
                                  value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].city) || ''}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    setTestData({
                                      ...updated,
                                      users: {
                                        ...updated.users,
                                        [userKey]: { ...updated.users[userKey], city: e.target.value }
                                      }
                                    })
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Pravni Status *</label>
                                <select
                                  className="w-full border rounded px-3 py-2 text-sm"
                                  value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].legalStatus) || ''}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    setTestData({
                                      ...updated,
                                      users: {
                                        ...updated.users,
                                        [userKey]: { ...updated.users[userKey], legalStatus: e.target.value }
                                      }
                                    })
                                  }}
                                >
                                  <option value="">Odaberi pravni status...</option>
                                  <option value="DOO">DOO - Društvo s ograničenom odgovornošću</option>
                                  <option value="D.O.O.">D.O.O. - Društvo s ograničenom odgovornošću</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">OIB / Porezni Broj *</label>
                                <input
                                  type="text"
                                  className="w-full border rounded px-3 py-2 text-sm"
                                  placeholder="12345678901"
                                  value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].oib) || ''}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    setTestData({
                                      ...updated,
                                      users: {
                                        ...updated.users,
                                        [userKey]: { ...updated.users[userKey], oib: e.target.value }
                                      }
                                    })
                                  }}
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Naziv Tvrtke *</label>
                                <input
                                  type="text"
                                  className="w-full border rounded px-3 py-2 text-sm"
                                  placeholder="Primjer: Test DOO"
                                  value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].companyName) || ''}
                                  onChange={e => {
                                    if (!testData) return
                                    const updated = { ...testData }
                                    if (!updated.users) updated.users = {}
                                    if (!updated.users[userKey]) updated.users[userKey] = {}
                                    setTestData({
                                      ...updated,
                                      users: {
                                        ...updated.users,
                                        [userKey]: { ...updated.users[userKey], companyName: e.target.value }
                                      }
                                    })
                                  }}
                                />
                              </div>
                              {/* Email Konfiguracija za providerCompany */}
                              <div className="col-span-2 mt-3 pt-3 border-t">
                                {/* Pregled email adresa - uvijek vidljiv */}
                                <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                                  <div className="text-sm font-semibold text-gray-700 mb-2">
                                    📧 Mailtrap Email Adresa za Provider Company:
                                  </div>
                                  <div className="text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 font-medium">✅ Email:</span>
                                      <span className="font-mono bg-white px-2 py-1 rounded border border-green-200">
                                        {testData?.users?.providerCompany?.mailtrapEmail || '(nije postavljeno)'}
                                      </span>
                                    </div>
                                    {testData?.users?.providerCompany?.emailConfig?.inboxId && (
                                      <div className="text-gray-600 mt-1 ml-4">
                                        📥 Inbox ID: <span className="font-mono">{testData.users.providerCompany.emailConfig.inboxId}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <details className="cursor-pointer" open>
                                  <summary className="text-sm font-medium text-gray-700 mb-2">
                                    ⚙️ Uredi Email Konfiguraciju za Provider Company
                                  </summary>
                                  <div className="mt-2 space-y-2 bg-blue-50 p-3 rounded text-xs text-blue-800 mb-3">
                                    <strong>💡 Objašnjenje:</strong>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                      <li><strong>Email adresa:</strong> Email adresa ovog korisnika koja će primati test emailove (npr. test.company@mailtrap.io)</li>
                                      <li><strong>Mailtrap Inbox ID:</strong> ID inbox-a u Mailtrap-u za provider companies (npr. 12347)</li>
                                    </ul>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Mailtrap Email Adresa</label>
                                      <input
                                        type="email"
                                        className="w-full border rounded px-2 py-1.5 text-xs"
                                        placeholder="test.company@mailtrap.io"
                                        value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].mailtrapEmail) || ''}
                                        onChange={e => {
                                          if (!testData) return
                                          const updated = { ...testData }
                                          if (!updated.users) updated.users = {}
                                          if (!updated.users[userKey]) updated.users[userKey] = {}
                                          setTestData({
                                            ...updated,
                                            users: {
                                              ...updated.users,
                                              [userKey]: { ...updated.users[userKey], mailtrapEmail: e.target.value }
                                            }
                                          })
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Mailtrap Inbox ID</label>
                                      <input
                                        type="text"
                                        className="w-full border rounded px-2 py-1.5 text-xs"
                                        placeholder="npr. 12347"
                                        value={(testData && testData.users && testData.users[userKey] && testData.users[userKey].emailConfig && testData.users[userKey].emailConfig.inboxId) || ''}
                                        onChange={e => {
                                          if (!testData) return
                                          const updated = { ...testData }
                                          if (!updated.users) updated.users = {}
                                          if (!updated.users[userKey]) updated.users[userKey] = {}
                                          if (!updated.users[userKey].emailConfig) updated.users[userKey].emailConfig = {}
                                          setTestData({
                                            ...updated,
                                            users: {
                                              ...updated.users,
                                              [userKey]: {
                                                ...updated.users[userKey],
                                                emailConfig: {
                                                  ...updated.users[userKey].emailConfig,
                                                  inboxId: e.target.value
                                                }
                                              }
                                            }
                                          })
                                        }}
                                      />
                                    </div>
                                  </div>
                                </details>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Test Dokumenti (Globalni - Default) */}
              <div className="border rounded-lg p-6 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Test Dokumenti</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    🌐 Globalni (default za sve korisnike)
                  </span>
                </div>
                <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                  <strong>💡 Objašnjenje:</strong> Ovi dokumenti se koriste kao default za sve korisnike. Ako korisnik ima svoje per-korisnik dokumente (vidi unutar svakog korisnika u sekciji "📄 Per-korisnik dokumenti"), oni se koriste umjesto globalnih.
                </div>
                <div className="space-y-4">
                  {['license', 'kycDocument', 'portfolioImage1', 'portfolioImage2'].map(docKey => {
                    const doc = testData && testData.documents && testData.documents[docKey] ? testData.documents[docKey] : null
                    return (
                      <div key={docKey} className="border rounded p-4 bg-gray-50">
                        <h4 className="font-medium mb-3 capitalize">{docKey.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        {doc && doc.url && (
                          <div className="mb-3">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              📄 {doc.originalName || docKey} ({doc.type})
                            </a>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="flex-1 text-sm"
                            onChange={async (e) => {
                              const file = e.target.files[0]
                              if (file) {
                                await uploadTestDocument(file, docKey, `Test dokument: ${docKey}`)
                                e.target.value = ''
                              }
                            }}
                            disabled={uploadingDocument}
                          />
                          {doc && doc.url && (
                            <button
                              onClick={() => {
                                if (!testData) return
                                const updated = { ...testData }
                                if (updated.documents) {
                                  delete updated.documents[docKey]
                                  setTestData(updated)
                                }
                              }}
                              className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Obriši
                            </button>
                          )}
                        </div>
                        {uploadingDocument && (
                          <div className="mt-2 text-sm text-gray-500">Učitavanje...</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Email Konfiguracija */}
              <div className="border rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold mb-4">Email Konfiguracija</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-800">
                      <strong>Preporučeno:</strong> Koristite test email servis (Mailtrap) za automatske testove.
                      <br />
                      <a href="https://mailtrap.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        Registriraj se na Mailtrap.io (besplatno)
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Test Email Servis (Mailtrap API Key)</label>
                    <input
                      type="password"
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="Mailtrap API Key"
                      value={(testData && testData.email && testData.email.testService && testData.email.testService.apiKey) || ''}
                      onChange={e => {
                        if (!testData) return
                        const updated = { ...testData }
                        if (!updated.email) updated.email = {}
                        if (!updated.email.testService) updated.email.testService = {}
                        setTestData({
                          ...updated,
                          email: {
                            ...updated.email,
                            testService: {
                              ...updated.email.testService,
                              apiKey: e.target.value
                            }
                          }
                        })
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">API Key iz Mailtrap.io Settings → API Tokens</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Mailtrap Inbox ID</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="0 (default inbox)"
                      value={(testData && testData.email && testData.email.testService && testData.email.testService.inboxId) || '0'}
                      onChange={e => {
                        if (!testData) return
                        const updated = { ...testData }
                        if (!updated.email) updated.email = {}
                        if (!updated.email.testService) updated.email.testService = {}
                        setTestData({
                          ...updated,
                          email: {
                            ...updated.email,
                            testService: {
                              ...updated.email.testService,
                              inboxId: e.target.value || '0'
                            }
                          }
                        })
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Inbox ID iz Mailtrap.io (obično "0" za default inbox)</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">Alternativa: IMAP Pristup (Gmail, itd.)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">IMAP Host</label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="imap.gmail.com"
                          value={(testData && testData.email && testData.email.imap && testData.email.imap.host) || ''}
                          onChange={e => {
                            if (!testData) return
                            const updated = { ...testData }
                            if (!updated.email) updated.email = {}
                            if (!updated.email.imap) updated.email.imap = {}
                            setTestData({
                              ...updated,
                              email: {
                                ...updated.email,
                                imap: {
                                  ...updated.email.imap,
                                  host: e.target.value
                                }
                              }
                            })
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">IMAP User (Email)</label>
                        <input
                          type="email"
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="test@example.com"
                          value={(testData && testData.email && testData.email.imap && testData.email.imap.user) || ''}
                          onChange={e => {
                            if (!testData) return
                            const updated = { ...testData }
                            if (!updated.email) updated.email = {}
                            if (!updated.email.imap) updated.email.imap = {}
                            setTestData({
                              ...updated,
                              email: {
                                ...updated.email,
                                imap: {
                                  ...updated.email.imap,
                                  user: e.target.value
                                }
                              }
                            })
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">IMAP Password (App Password)</label>
                        <input
                          type="password"
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="App Password za Gmail"
                          value={(testData && testData.email && testData.email.imap && testData.email.imap.password) || ''}
                          onChange={e => {
                            if (!testData) return
                            const updated = { ...testData }
                            if (!updated.email) updated.email = {}
                            if (!updated.email.imap) updated.email.imap = {}
                            setTestData({
                              ...updated,
                              email: {
                                ...updated.email,
                                imap: {
                                  ...updated.email.imap,
                                  password: e.target.value
                                }
                              }
                            })
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Za Gmail: Settings → Security → App Passwords</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Konfiguracija */}
              <div className="border rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold mb-4">API Konfiguracija</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Base URL</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={(testData && testData.api && testData.api.baseUrl) || ''}
                      onChange={e => {
                        if (!testData) return
                        updateTestDataField('api.baseUrl', e.target.value)
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Frontend URL</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={(testData && testData.api && testData.api.frontendUrl) || ''}
                      onChange={e => {
                        if (!testData) return
                        updateTestDataField('api.frontendUrl', e.target.value)
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Spremi gumb */}
              <div className="flex justify-end">
                <button
                  onClick={saveTestData}
                  disabled={savingTestData}
                  className={`px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-2 ${
                    savingTestData ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {savingTestData && <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{savingTestData ? 'Spremanje...' : '💾 Spremi test podatke'}</span>
                </button>
              </div>
            </>
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
              {key:'REVIEWS',label:'Recenzije'},
              {key:'PROFILES',label:'Profili'},
              {key:'QUEUE',label:'Queue'},
              {key:'REFUND',label:'Refund'},
              {key:'LICENSES',label:'Licence'},
              {key:'REPUTATION',label:'Reputacija'},
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


