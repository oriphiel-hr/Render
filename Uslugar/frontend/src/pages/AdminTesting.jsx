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
  
  const [tab, setTab] = useState(getInitialTab) // 'plans' | 'runs' | 'new' | 'test-data' | 'detailed-tests'
  const [plans, setPlans] = useState([])
  const [runs, setRuns] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [preset, setPreset] = useState('ALL')
  const [seeding, setSeeding] = useState(false)
  const [runningAutomated, setRunningAutomated] = useState(false)
  
  // Detaljni testovi
  const [expandedSector, setExpandedSector] = useState(null)
  const [runningTest, setRunningTest] = useState(null)
  const [testResults, setTestResults] = useState({})
  const [automatedTestResult, setAutomatedTestResult] = useState(null)
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
            const newHash = 'detailed-tests'
            if (window.location.hash !== `#${newHash}`) {
              window.history.pushState(null, '', `/admin/testing#${newHash}`)
              window.dispatchEvent(new HashChangeEvent('hashchange'))
            }
            setTab('detailed-tests')
          }} 
          className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-150 flex items-center gap-2 ${
            tab==='detailed-tests'
              ? 'bg-indigo-600 text-white shadow-sm border-b-2 border-indigo-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Detaljni testovi</span>
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

      {tab === 'detailed-tests' && (
        <div className="space-y-6">
          {/* Detaljni testovi s mogućnostima pojedinačnog testiranja */}
          <div className="bg-white border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">📋 Detaljni testovi - Sve funkcionalnosti</h3>
              <p className="text-gray-600">Pokreni individualne testove ili cijele sektore. Pogledaj upute i rezultate za svaki test.</p>
            </div>

            {/* SEKTORI */}
            <div className="space-y-3">
              {[
                {
                  num: 1,
                  title: 'Registracija i Autentifikacija',
                  tests: [
                    { id: '1.1', name: 'Registracija korisnika usluge', desc: 'Testira registraciju korisnika bez pravnog statusa' },
                    { id: '1.2', name: 'Registracija pružatelja usluga', desc: 'Testira registraciju providera s pravnim statusom' },
                    { id: '1.3', name: 'Prijava korisnika', desc: 'Testira login s ispravnim i neispravnim podacima' },
                    { id: '1.4', name: 'Email verifikacija', desc: 'Testira otvaranje linka i verifikaciju emaila' },
                    { id: '1.5', name: 'Resetiranje lozinke', desc: 'Testira slanje emaila i promjenu lozinke' },
                    { id: '1.6', name: 'JWT token autentifikacija', desc: 'Testira token autentifikaciju i pristup API-ju' }
                  ]
                },
                {
                  num: 2,
                  title: 'Upravljanje Kategorijama',
                  tests: [
                    { id: '2.1', name: 'Dinamičko učitavanje kategorija', desc: 'Testira učitavanje kategorija iz baze' },
                    { id: '2.2', name: 'Hijerarhijska struktura kategorija', desc: 'Testira parent-child odnose' },
                    { id: '2.3', name: 'Filtriranje poslova po kategorijama', desc: 'Testira filteriranje u pretrazi' }
                  ]
                },
                {
                  num: 3,
                  title: 'Upravljanje Poslovima',
                  tests: [
                    { id: '3.1', name: 'Objavljivanje novih poslova', desc: 'Testira kreiranje i čuvanje posla' },
                    { id: '3.2', name: 'Detaljni opis posla', desc: 'Testira prikaz svih detalja' },
                    { id: '3.3', name: 'Postavljanje budžeta', desc: 'Testira min-max budžet' },
                    { id: '3.4', name: 'Lokacija i Geolokacija', desc: 'Testira MapPicker i AddressAutocomplete' },
                    { id: '3.5', name: 'Status posla', desc: 'Testira OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN' },
                    { id: '3.6', name: 'Pretraživanje poslova', desc: 'Testira search funkcionalnost' },
                    { id: '3.7', name: 'Napredni filteri', desc: 'Testira filtriranje po više parametara' },
                    { id: '3.8', name: 'Sortiranje poslova', desc: 'Testira sortiranje po relevantnosti' }
                  ]
                },
                {
                  num: 4,
                  title: 'Sustav Ponuda',
                  tests: [
                    { id: '4.1', name: 'Slanje ponuda za poslove', desc: 'Testira slanje ponude i dedukciju kredita' },
                    { id: '4.2', name: 'Status ponude', desc: 'Testira NA ČEKANJU, PRIHVAĆENA, ODBIJENA' },
                    { id: '4.3', name: 'Prihvaćanje/odbijanje ponuda', desc: 'Testira akcije na ponudu' }
                  ]
                },
                {
                  num: 6,
                  title: 'Profili Pružatelja',
                  tests: [
                    { id: '6.1', name: 'Detaljni profil pružatelja', desc: 'Testira prikaz profila' },
                    { id: '6.2', name: 'Biografija pružatelja', desc: 'Testira ažuriranje biografije' },
                    { id: '6.3', name: 'Kategorije u kojima radi', desc: 'Testira odabir kategorija' },
                    { id: '6.4', name: 'Team Locations', desc: 'Testira MapPicker za lokacije tima' }
                  ]
                },
                {
                  num: 18,
                  title: 'Plaćanja i Stripe Integracija',
                  tests: [
                    { id: '18.1', name: 'Stripe Checkout integracija', desc: 'Testira Stripe Checkout za plaćanje pretplate' },
                    { id: '18.2', name: 'Stripe Payment Intent', desc: 'Testira plaćanje s karticom za leadove' },
                    { id: '18.3', name: 'Stripe Webhook', desc: 'Testira potvrdu plaćanja s webhooka' },
                    { id: '18.4', name: 'Stripe Refund', desc: 'Testira povrat novca na karticu' }
                  ]
                },
                {
                  num: 19,
                  title: 'Tvrtke i Timovi',
                  tests: [
                    { id: '19.1', name: 'Direktor Dashboard - upravljanje timovima', desc: 'Testira prikaz tima i upravljanje' },
                    { id: '19.2', name: 'Interna distribucija leadova', desc: 'Testira dodjelu leadova timu' }
                  ]
                },
                {
                  num: 20,
                  title: 'Chat Sustav (PUBLIC i INTERNAL)',
                  tests: [
                    { id: '20.1', name: 'PUBLIC chat (Klijent ↔ Tvrtka)', desc: 'Testira komunikaciju s tvrtkom' },
                    { id: '20.2', name: 'INTERNAL chat (Direktor ↔ Team)', desc: 'Testira interni chat tima' }
                  ]
                },
                {
                  num: 21,
                  title: 'TWILIO - SMS Verifikacija i Notifikacije',
                  tests: [
                    { id: '21.1', name: 'SMS verifikacija telefonskog broja', desc: 'Testira Twilio SMS verifikaciju' },
                    { id: '21.2', name: 'SMS notifikacija - nova ponuda', desc: 'Testira slanje SMS-a za novu ponudu' },
                    { id: '21.3', name: 'SMS notifikacija - nov posao', desc: 'Testira slanje SMS-a za novi posao' },
                    { id: '21.4', name: 'Twilio error handling', desc: 'Testira rukovanje Twilio greškama' }
                  ]
                },
                {
                  num: 22,
                  title: 'KYC i Verifikacija Dokumenata',
                  tests: [
                    { id: '22.1', name: 'Upload KYC dokumenta', desc: 'Testira upload PDF/JPG za KYC' },
                    { id: '22.2', name: 'Verifikacija OIB-a', desc: 'Testira provjeru OIB-a iz dokumenta' },
                    { id: '22.3', name: 'KYC status - pending/approved', desc: 'Testira status verification' },
                    { id: '22.4', name: 'KYC rejection', desc: 'Testira odbijanje KYC-a s razlogom' }
                  ]
                },
                {
                  num: 23,
                  title: 'Portfolio i Certifikati',
                  tests: [
                    { id: '23.1', name: 'Upload portfolio slika', desc: 'Testira upload više portfolio slika' },
                    { id: '23.2', name: 'Upload certifikata/licenci', desc: 'Testira upload licence (PDF)' },
                    { id: '23.3', name: 'Prikaz na profilu', desc: 'Testira prikaz portfolio na profilu' },
                    { id: '23.4', name: 'Galerija i preview', desc: 'Testira galeriju i lightbox' }
                  ]
                },
                {
                  num: 24,
                  title: 'Email Notifikacije',
                  tests: [
                    { id: '24.1', name: 'Email - nova ponuda', desc: 'Testira email za novu ponudu' },
                    { id: '24.2', name: 'Email - novi posao', desc: 'Testira email za novi posao' },
                    { id: '24.3', name: 'Email - trial expiry', desc: 'Testira email 3 dana prije isteka triala' },
                    { id: '24.4', name: 'Email - inactivity podsjetnik', desc: 'Testira email za neaktivnost >14 dana' }
                  ]
                },
                {
                  num: 25,
                  title: 'Saved Searches i Job Alerts',
                  tests: [
                    { id: '25.1', name: 'Spremanje pretraga', desc: 'Testira spremanje filter pretraga' },
                    { id: '25.2', name: 'Job alerts - kreiranje', desc: 'Testira kreiranje job alert-a' },
                    { id: '25.3', name: 'Job alerts - frekvencije', desc: 'Testira DAILY, WEEKLY, INSTANT' },
                    { id: '25.4', name: 'Job alerts - notifikacije', desc: 'Testira slanje email notifikacija' }
                  ]
                },
                {
                  num: 26,
                  title: 'Admin - Upravljanje Korisnicima',
                  tests: [
                    { id: '26.1', name: 'Admin - Approve provider', desc: 'Testira odobrenje novog providera' },
                    { id: '26.2', name: 'Admin - Reject provider', desc: 'Testira odbijanje providera s razlogom' },
                    { id: '26.3', name: 'Admin - Ban/Suspend korisnika', desc: 'Testira suspenziju ili ban korisnika' },
                    { id: '26.4', name: 'Admin - KYC metrics', desc: 'Testira prikaz KYC statistike' }
                  ]
                },
                {
                  num: 27,
                  title: 'Wizard Registracije',
                  tests: [
                    { id: '27.1', name: 'Odabir kategorija u wizard-u', desc: 'Testira multi-select kategorija' },
                    { id: '27.2', name: 'Odabir regija', desc: 'Testira odabir radnih regija' },
                    { id: '27.3', name: 'Wizard status', desc: 'Testira progres kroz wizard korake' },
                    { id: '27.4', name: 'Wizard completion', desc: 'Testira završetak i spremanje' }
                  ]
                },
                {
                  num: 28,
                  title: 'Upravljanje Pretplatom (Detaljno)',
                  tests: [
                    { id: '28.1', name: 'Upgrade pretplate', desc: 'Testira nadogradnju s prorated billingom' },
                    { id: '28.2', name: 'Downgrade pretplate', desc: 'Testira sniženje pretplate' },
                    { id: '28.3', name: 'Cancel pretplate', desc: 'Testira otkazivanje pretplate' },
                    { id: '28.4', name: 'Trial period aktivacija', desc: 'Testira automatsku aktivaciju trial-a' }
                  ]
                },
                {
                  num: 29,
                  title: 'ROI Dashboard i Analitike',
                  tests: [
                    { id: '29.1', name: 'ROI dashboard - prikaz', desc: 'Testira prikaz ROI metrika' },
                    { id: '29.2', name: 'ROI grafici', desc: 'Testira grafičke prikaze (lineran, bar)' },
                    { id: '29.3', name: 'Konverzija leadova', desc: 'Testira prikaz conversion rate' },
                    { id: '29.4', name: 'Izvještaji', desc: 'Testira mjesečne/godišnje izvještaje' }
                  ]
                },
                {
                  num: 30,
                  title: 'Credit Sustav (Detaljno)',
                  tests: [
                    { id: '30.1', name: 'Credit transakcije - kupnja', desc: 'Testira dodjeljivanje kredita' },
                    { id: '30.2', name: 'Credit transakcije - trošenje', desc: 'Testira oduzimanje kredita pri kupnji leada' },
                    { id: '30.3', name: 'Credit history', desc: 'Testira prikaz sve transakcije kredita' },
                    { id: '30.4', name: 'Credit refund', desc: 'Testira vraćanje kredita' }
                  ]
                },
                {
                  num: 31,
                  title: 'Security Testovi',
                  tests: [
                    { id: '31.1', name: 'CORS policy', desc: 'Testira CORS headers i cross-origin zahtjeve' },
                    { id: '31.2', name: 'CSRF protection', desc: 'Testira CSRF token validaciju' },
                    { id: '31.3', name: 'Rate limiting', desc: 'Testira rate limiting na API-ju' },
                    { id: '31.4', name: 'SQL injection test', desc: 'Testira zaštitu od SQL injection-a' }
                  ]
                }
              ].map((sector, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedSector(expandedSector === sector.num ? null : sector.num)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 flex items-center justify-between font-semibold text-left transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                        {sector.num}
                      </span>
                      <span className="text-gray-900">{sector.title}</span>
                      <span className="text-xs text-gray-600">({sector.tests.length} testova)</span>
                    </span>
                    <span className={`transform transition-transform ${expandedSector === sector.num ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {expandedSector === sector.num && (
                    <div className="bg-white border-t">
                      {sector.tests.map((test, testIdx) => (
                        <div key={testIdx} className="border-b last:border-b-0 p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{test.id} - {test.name}</div>
                              <div className="text-sm text-gray-600 mt-1">{test.desc}</div>
                              
                              {/* Upute */}
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                <strong>📖 Detaljne upute:</strong>
                                <ul className="mt-2 space-y-1">
                                  {test.id === '1.1' && (
                                    <>
                                      <li>1. Otvori <strong>/register</strong> i odaberi <strong>USER (korisnik usluge)</strong></li>
                                      <li>2. Unesi: Email (npr. korisnik@test.com), Lozinka (min 8 znakova), Puno Ime, Telefon (+385...)</li>
                                      <li>3. Odaberi grad iz dropdown-a (npr. Zagreb)</li>
                                      <li>4. ✅ TREBALO BI: Forma prihvati bez polja za tvrtku/OIB</li>
                                      <li>5. ✅ Provjeri: Email za verifikaciju stigao je</li>
                                    </>
                                  )}
                                  {test.id === '1.2' && (
                                    <>
                                      <li>1. Otvori <strong>/register</strong> i odaberi <strong>PROVIDER (pružatelj usluga)</strong></li>
                                      <li>2. Unesi: Email, Lozinka, Puno Ime, Telefon</li>
                                      <li>3. Odaberi Pravni Status: <strong>DOO</strong> (Društvo s ograničenom odgovornošću)</li>
                                      <li>4. Unesi OIB: <strong>12345678901</strong> (11 znamenki)</li>
                                      <li>5. Unesi Naziv tvrtke: <strong>Test Company DOO</strong> (obavezno za DOO)</li>
                                      <li>6. ✅ TREBALO BI: Forma prihvati sve podatke</li>
                                      <li>7. ✅ Provjeri: Email za verifikaciju stigao je</li>
                                    </>
                                  )}
                                  {test.id === '1.3' && (
                                    <>
                                      <li>1. Otvori <strong>/login</strong></li>
                                      <li>2. <strong>Ispravna prijava:</strong> Unesi email i lozinku iz prijašnje registracije → ✅ Trebao bi redirect na Dashboard</li>
                                      <li>3. <strong>Neispravna prijava:</strong> Unesi pogrešnu lozinku → ✅ Trebala bi poruka greške</li>
                                      <li>4. Provjeri: Nakon uspješne prijave, token je u localStorage</li>
                                    </>
                                  )}
                                  {test.id === '1.4' && (
                                    <>
                                      <li>1. Nakon registracije, otvori email (Mailtrap inbox ili Gmail)</li>
                                      <li>2. Pronađi link za verifikaciju s tekstom "Provjeri email" ili "Verify"</li>
                                      <li>3. Klikni na link - trebao bi redirect na stranicu s porukom "Email verificiran"</li>
                                      <li>4. Provjeri: Korisnik je sada označen kao verified u bazi</li>
                                      <li>5. Pokušaj ponovno poslati link za verifikaciju - trebala bi poruka "Email je već verificiran"</li>
                                    </>
                                  )}
                                  {test.id === '1.5' && (
                                    <>
                                      <li>1. Otvori <strong>/forgot-password</strong></li>
                                      <li>2. Unesi email korisnika → trebala bi poruka "Email za reset poslan"</li>
                                      <li>3. Provjeri email (Mailtrap/Gmail) za link s tekstom "Reset lozinke"</li>
                                      <li>4. Klikni na link - trebao bi redirect na formu "Nova lozinka"</li>
                                      <li>5. Unesi novu lozinku (min 8 znakova) → ✅ Poruka "Lozinka promijenjena"</li>
                                      <li>6. Testiraj: Prijava s novom lozinkom trebala bi raditi</li>
                                    </>
                                  )}
                                  {test.id === '1.6' && (
                                    <>
                                      <li>1. Prijavi se uspješno - trebalo bi da je token pohranjen u <strong>localStorage</strong></li>
                                      <li>2. Provjeri: Otvori DevTools (F12) → Application → localStorage → trebaš vidjeti `token`</li>
                                      <li>3. Navigiraj na <strong>/profile</strong> (zaštićena ruta)</li>
                                      <li>4. ✅ Trebala bi biti dostupna bez novog login-a (token se automatski šalje u zaglavlju)</li>
                                      <li>5. Odjavi se i provjeri: token je obrisan iz localStorage</li>
                                    </>
                                  )}
                                  {test.id === '2.1' && (
                                    <>
                                      <li>1. Prijavi se kao klijent</li>
                                      <li>2. Otvori <strong>/jobs/create</strong></li>
                                      <li>3. Klikni na dropdown kategorije → trebalo bi da se učita lista 51 kategorije</li>
                                      <li>4. ✅ Trebalo BI: Sve kategorije su dostupne (Električar, Vodoinstalater, itd.)</li>
                                      <li>5. Provjeri: Nema greške u konzoli</li>
                                    </>
                                  )}
                                  {test.id === '2.3' && (
                                    <>
                                      <li>1. Otvori <strong>/jobs</strong> (stranicu sa svim poslovima)</li>
                                      <li>2. Pronađi filter "Kategorija" (obično na lijevoj strani)</li>
                                      <li>3. Odaberi kategoriju: npr. <strong>Električar</strong></li>
                                      <li>4. ✅ TREBALO BI: Lista poslova se filtrira samo na Električare</li>
                                      <li>5. Provjeri URL: trebao bi imati query param `?category=elektricar` ili sličan</li>
                                    </>
                                  )}
                                  {test.id === '3.1' && (
                                    <>
                                      <li>1. Prijavi se kao klijent</li>
                                      <li>2. Otvori <strong>/jobs/create</strong> ili klikni "Objavi posao"</li>
                                      <li>3. Unesi: Naslov (npr. "Popravka kuca"), Opis, Odaberi Kategoriju (Električar)</li>
                                      <li>4. Unesi budžet: Min: <strong>500</strong> kn, Max: <strong>2000</strong> kn</li>
                                      <li>5. Odaberi lokaciju s MapPicker-om (klikni na mapu ili unesi grad)</li>
                                      <li>6. (Opcionalno) Upload slike posla</li>
                                      <li>7. Klikni "Objavi posao" → ✅ Trebala bi poruka "Posao uspješno kreiran"</li>
                                      <li>8. Provjeri: Posao se pojavljuje na /jobs ili /jobs/my-jobs</li>
                                    </>
                                  )}
                                  {test.id === '3.4' && (
                                    <>
                                      <li>1. Prijavi se kao klijent ili provider</li>
                                      <li>2. Otvori <strong>/jobs/create</strong> (ili Team Locations za provider)</li>
                                      <li>3. Trebala bi biti vidljiva <strong>AddressAutocomplete</strong> komponenta (tekstualno polje za adresu)</li>
                                      <li>4. Trebala bi biti vidljiva <strong>MapPicker</strong> komponenta (interaktivna mapa)</li>
                                      <li>5. Testiraj: Unesi grad (npr. "Zagreb") u AddressAutocomplete → trebalo bi da se prikaže na mapi</li>
                                      <li>6. Testiraj: Klikni na mapu → trebalo bi postaviti marker na kliknutoj lokaciji</li>
                                    </>
                                  )}
                                  {test.id === '3.5' && (
                                    <>
                                      <li>1. Prijavi se kao klijent i kreiraj posao (vidi test 3.1)</li>
                                      <li>2. Otvori svoj posao iz <strong>/jobs/my-jobs</strong></li>
                                      <li>3. Pronađi dropdown za status (trebao bi biti "OTVOREN" po zadanom)</li>
                                      <li>4. Promijeni status na: <strong>U TIJEKU</strong> → klikni "Spremi" → ✅ Trebala bi poruka "Status ažuriran"</li>
                                      <li>5. Ponovi za: <strong>ZAVRŠEN</strong>, <strong>OTKAZAN</strong></li>
                                      <li>6. Provjeri: Status se odražava na stranici i na listi poslova</li>
                                    </>
                                  )}
                                  {test.id === '4.1' && (
                                    <>
                                      <li>1. Kao klijent: Kreiraj posao (vidi test 3.1)</li>
                                      <li>2. Kao provider: Prijavi se i otvori <strong>/leads</strong> (tržište leadova)</li>
                                      <li>3. Pronađi svoj posao (trebao bi biti vidljiv kao lead)</li>
                                      <li>4. Klikni "Kupi lead" → trebala bi provjeravati kredite providera</li>
                                      <li>5. ✅ TREBALO BI: Krediti su oduzeti, lead je prebačen u "Moji leadovi"</li>
                                      <li>6. Otvori lead i pošalji ponudu: Unesi iznos (npr. 1500), poruku, procijenjene dane</li>
                                      <li>7. ✅ Trebala bi poruka "Ponuda uspješno poslana"</li>
                                    </>
                                  )}
                                  {test.id === '4.3' && (
                                    <>
                                      <li>1. Kao klijent: Otvori svoj posao gdje si primio ponudu</li>
                                      <li>2. Trebao bi vidjeti "Ponude" sekciju s ponudama od providera</li>
                                      <li>3. Klikni "Prihvati ponudu" na jednoj od ponuda → ✅ Trebala bi poruka "Ponuda prihvaćena"</li>
                                      <li>4. Provjeri: Status ponude se promijenio na "PRIHVAĆENA"</li>
                                      <li>5. Testiraj: Pokušaj prihvatiti drugu ponudu → trebala bi poruka greške (samo jedna ponuda po poslu)</li>
                                    </>
                                  )}
                                  {test.id === '6.1' && (
                                    <>
                                      <li>1. Kao provider: Prijavi se i otvori <strong>/profile</strong></li>
                                      <li>2. Trebao bi vidjeti: Ime, Email, Telefon, Grad, Pravni status, OIB</li>
                                      <li>3. Trebao bi vidjeti: Biografiju, Specijalizacije, Jahre iskustva, Website</li>
                                      <li>4. Trebao bi vidjeti: Portfolio slike, Licence, Recenzije (ako postoje)</li>
                                      <li>5. Trebao bi vidjeti: Status dostupnosti (Available/Unavailable)</li>
                                    </>
                                  )}
                                  {test.id === '6.4' && (
                                    <>
                                      <li>1. Kao direktor (provider): Otvori <strong>/team-locations</strong></li>
                                      <li>2. Trebao bi vidjeti: MapPicker komponenta s interaktivnom mapom Hrvatske</li>
                                      <li>3. Trebao bi vidjeti: AddressAutocomplete za unos adrese</li>
                                      <li>4. Testiraj: Unesi grad (npr. Split) → trebalo bi biti vidljivo na mapi</li>
                                      <li>5. Testiraj: Klikni na mapu ili povuci marker → trebalo bi ažurirati GPS koordinate</li>
                                      <li>6. Testiraj: Postavi radijus pokrivanja (npr. 50km) → trebalo bi vidjeti krug na mapi</li>
                                      <li>7. Klikni "Spremi" → ✅ Trebala bi poruka "Lokacija sprema"</li>
                                    </>
                                  )}
                                  {test.id === '12.1' && (
                                    <>
                                      <li>1. Kao provider: Prijavi se i otvori <strong>/subscription</strong></li>
                                      <li>2. Trebao bi vidjeti: Trenutni aktivni plan (npr. TRIAL, BASIC, PREMIUM, PRO)</li>
                                      <li>3. Trebao bi vidjeti: Broj dostupnih kredita</li>
                                      <li>4. Trebao bi vidjeti: Datum isteka pretplate</li>
                                      <li>5. Trebao bi vidjeti: Status (ACTIVE, EXPIRED, itd.)</li>
                                    </>
                                  )}
                                  {test.id === '18.1' && (
                                    <>
                                      <li>1. Kao provider: Otvori <strong>/subscription</strong></li>
                                      <li>2. Odaberi novi plan (npr. PREMIUM ako si na BASIC)</li>
                                      <li>3. Klikni "Nadogradi plan" → trebalo bi redirect na <strong>Stripe Checkout</strong></li>
                                      <li>4. ✅ TREBALO BI: Stripe forma s email, kartica, razmakom za adresu</li>
                                      <li>5. Testiraj s test karticom: <strong>4242 4242 4242 4242</strong>, bilo koji budući datum, bilo koji CVC</li>
                                      <li>6. Klikni "Plaćanje" → ✅ Trebala bi poruka "Plaćanje uspješno"</li>
                                      <li>7. Provjeri: Korisnik je nadograđen na novi plan, krediti su dodeljeni</li>
                                    </>
                                  )}
                                  {test.id === '18.2' && (
                                    <>
                                      <li>1. Kao provider: Otvori <strong>/leads</strong> (tržište leadova)</li>
                                      <li>2. Pronađi lead i klikni "Kupi lead"</li>
                                      <li>3. Trebalo bi: "Plaćanje karticom" ili "Koristi kredite" opcija</li>
                                      <li>4. Odaberi "Plaćanje karticom" → trebalo bi <strong>Stripe Payment Intent</strong> forma</li>
                                      <li>5. Unesi test karticu: 4242 4242 4242 4242</li>
                                      <li>6. Klikni "Kupi lead" → ✅ Trebala bi poruka "Lead uspješno kupljen"</li>
                                      <li>7. Provjeri: Lead je u "Moji leadovi", Payment je zabilježen u Stripe dashboard-u</li>
                                    </>
                                  )}
                                  {test.id === '18.3' && (
                                    <>
                                      <li>1. Backend test: Otvori <strong>Render logs</strong> ili backend monitoring</li>
                                      <li>2. Trebalo bi vidjeti Stripe webhook povratne pozive na `/api/webhook/stripe`</li>
                                      <li>3. Testiraj: Simuliraj webhook s Stripe CLI lokalnih ili test webhookima</li>
                                      <li>4. ✅ TREBALO BI: `payment_intent.succeeded` - pretplata se aktivira</li>
                                      <li>5. ✅ TREBALO BI: `invoice.payment_succeeded` - faktura se hvata</li>
                                      <li>6. Provjeri: Nema error-a u logovima, webhook je procesuiran</li>
                                    </>
                                  )}
                                  {test.id === '18.4' && (
                                    <>
                                      <li>1. Kao provider: Otvori kupljeni lead u <strong>/my-leads</strong></li>
                                      <li>2. Trebao bi vidjeti gumb "Zatraži refund" (ako je lead stariji od X dana)</li>
                                      <li>3. Klikni "Zatraži refund" → trebalo bi forma za razlog (npr. "Klijent nije odgovorio")</li>
                                      <li>4. Unesi razlog i klikni "Zatraži refund" → ✅ Trebala bi poruka "Refund zahtjev prihvaćen"</li>
                                      <li>5. Backend: Provjeri da je `CreditTransaction` tipa REFUND kreiran</li>
                                      <li>6. Testiraj: Ako je Payment Intent, trebalo bi refund na kartici (Stripe Refund API)</li>
                                    </>
                                  )}
                                  {test.id === '21.1' && (
                                    <>
                                      <li>1. Kreiraj novu registraciju ili otvori profil kaoProvider</li>
                                      <li>2. Trebalo bi vidjeti gumb "Provjeri telefon s SMS-om" ili sličan</li>
                                      <li>3. Klikni → trebalo bi formar za unos broja telefona (npr. +385911234567)</li>
                                      <li>4. ✅ TREBALO BI: SMS s 6-znamenkastim kodom stiže na telefon (Twilio)</li>
                                      <li>5. Unesi kod → ✅ Trebala bi poruka "Telefon verificiran"</li>
                                      <li>6. Provjeri: Korisnik ima "Phone Identity Badge" znački na profilu</li>
                                      <li>7. Edge case: Ako je ponovno kliknut, trebala bi poruka "Telefon već verificiran"</li>
                                    </>
                                  )}
                                  {test.id === '21.2' && (
                                    <>
                                      <li>1. Kao provider: Sljeđi SMS notifikacije koje si postavio u AdminTesting</li>
                                      <li>2. Kao klijent: Otvori jedan od svojih poslova i pošalji ponudu provideru</li>
                                      <li>3. ✅ TREBALO BI: Provider prima SMS: "Nova ponuda za posao: [naslov]"</li>
                                      <li>4. Provjeri SMS na Twilio console ili test broj</li>
                                      <li>5. Edge case: Ako provider nema SMS notifikacije uključene, ne bi trebao dobiti SMS</li>
                                    </>
                                  )}
                                  {test.id === '21.3' && (
                                    <>
                                      <li>1. Kao provider: Odaberi kategorije u profilu (npr. Električar)</li>
                                      <li>2. Postavi SMS notifikacije uključene u settings-ima</li>
                                      <li>3. Kao klijent: Kreiraj novi posao u kategoriji Električni → objavi</li>
                                      <li>4. ✅ TREBALO BI: Provider dobije SMS: "Nov posao u [kategorija]: [naslov]"</li>
                                      <li>5. Provjeri SMS na Twilio console ili test broj</li>
                                      <li>6. Edge case: Ako provider ima filter po gradu, trebalo bi provjeriti i to</li>
                                    </>
                                  )}
                                  {test.id === '21.4' && (
                                    <>
                                      <li>1. Backend test: Simuliraj Twilio greške:</li>
                                      <li>   a) <strong>Code 20003</strong>: Invalid Twilio credentials</li>
                                      <li>   b) <strong>Inactive user</strong>: Twilio račun je neaktivan</li>
                                      <li>   c) <strong>Restricted account</strong>: Račun je suspenzioniran</li>
                                      <li>2. Testiraj s pogrešnom Twilio API key ili account SID</li>
                                      <li>3. ✅ TREBALO BI: Greške se bilježe u AdminSmsLogs s jasnom porukom</li>
                                      <li>4. ✅ TREBALO BI: Frontend vidi jasnu poruku s instrukcijama što učiniti</li>
                                      <li>5. Provjeri: Nema SMS-a poslano ako je greška, korisnik nije blokiran</li>
                                    </>
                                  )}
                                  {test.id === '22.1' && (
                                    <>
                                      <li>1. Kao provider: Otvori <strong>/profile/kyc</strong></li>
                                      <li>2. Trebao bi vidjeti: Upload forma s tekstom "Učitajte dokument za KYC"</li>
                                      <li>3. Odaberi dokument (PDF ili JPG/PNG)</li>
                                      <li>4. Klikni "Upload" → ✅ Trebala bi poruka "Dokument spremat, čeka se provjera"</li>
                                      <li>5. Provjeri: Dokument je vidljiv s statusom "PENDING"</li>
                                    </>
                                  )}
                                  {test.id === '22.2' && (
                                    <>
                                      <li>1. Upload KYC dokument koji sadrži OIB (test 22.1)</li>
                                      <li>2. Backend: Trebalo bi da automatski ekstraktira OIB iz dokumenta (OCR ili manual)</li>
                                      <li>3. ✅ TREBALO BI: Ako OIB odgovara profilu providera → Status "VERIFIED"</li>
                                      <li>4. ✅ TREBALO BI: Ako OIB NE odgovara → Status "MISMATCH" s napomenom za admin</li>
                                      <li>5. Provjeri AdminKYCMetrics za ovaj report</li>
                                    </>
                                  )}
                                  {test.id === '22.3' && (
                                    <>
                                      <li>1. Kao provider: Upload KYC dokument (test 22.1)</li>
                                      <li>2. Trebao bi vidjeti status: <strong>PENDING</strong> - čeka se admin provjera</li>
                                      <li>3. Kao admin: Otvori <strong>/admin/verification-documents</strong></li>
                                      <li>4. Pronađi dokument i klikni "Provjeri" → trebalo bi forma za odobrenje/odbijanje</li>
                                      <li>5. Klikni "Odobri" → Status se mijenja na <strong>APPROVED</strong></li>
                                      <li>6. Kao provider: Status se osvježava na profilu</li>
                                    </>
                                  )}
                                  {test.id === '22.4' && (
                                    <>
                                      <li>1. Kao admin: Otvori <strong>/admin/verification-documents</strong></li>
                                      <li>2. Pronađi KYC dokument i klikni "Odbij"</li>
                                      <li>3. Trebala bi forma za unos razloga (npr. "Dokument nije čitljiv")</li>
                                      <li>4. Unesi razlog i klikni "Pošalji" → ✅ Status se mijenja na <strong>REJECTED</strong></li>
                                      <li>5. ✅ TREBALO BI: Provider dobije email s razlogom odbijanja</li>
                                      <li>6. Kao provider: Trebao bi moći ponovno uploadati dokument</li>
                                    </>
                                  )}
                                  {test.id === '23.1' && (
                                    <>
                                      <li>1. Kao provider: Otvori <strong>/profile</strong></li>
                                      <li>2. Pronađi "Portfolio" sekciju</li>
                                      <li>3. Klikni "Dodaj sliku" i odaberi JPG/PNG datoteke (minimalno 2-3 slike)</li>
                                      <li>4. ✅ TREBALO BI: Sve slike su uploadane i vidljive u preview-u</li>
                                      <li>5. Klikni "Spremi" → ✅ Trebala bi poruka "Portfolio ažuriran"</li>
                                      <li>6. Provjeri: Slike su vidljive na javnom profilu providera</li>
                                    </>
                                  )}
                                  {test.id === '23.2' && (
                                    <>
                                      <li>1. Kao provider: Otvori <strong>/profile</strong></li>
                                      <li>2. Pronađi "Certifikati" ili "Licence" sekciju</li>
                                      <li>3. Klikni "Upload certifikat" i odaberi PDF datoteku</li>
                                      <li>4. Unesi naziv certifikata (npr. "Elektrotehnička dozvola 2024")</li>
                                      <li>5. Klikni "Upload" → ✅ Trebala bi poruka "Certifikat uploadan"</li>
                                      <li>6. Provjeri: Certifikat je vidljiv s datumom isteka (ako je dostupan)</li>
                                    </>
                                  )}
                                  {test.id === '23.3' && (
                                    <>
                                      <li>1. Kao provider: Upload portfolio slike i certifikate (test 23.1, 23.2)</li>
                                      <li>2. Otvori svoj profil ili javni link profila</li>
                                      <li>3. ✅ TREBALO BI: Portfolio sekcija je vidljiva s galericom slika</li>
                                      <li>4. ✅ TREBALO BI: Certifikati/licence su vidljivi s downloadable linkovima</li>
                                      <li>5. Kao klijent: Otvori profil providera → trebalo bi vidjeti sve portfolio slike</li>
                                    </>
                                  )}
                                  {test.id === '23.4' && (
                                    <>
                                      <li>1. Upload nekoliko portfolio slika (test 23.1)</li>
                                      <li>2. Trebalo bi biti dostupna galerija s thumbnailima</li>
                                      <li>3. Klikni na sliku → trebalo bi otvoriti lightbox s full size slikom</li>
                                      <li>4. Testiraj: Prethodna/sljedeća gumb za navigaciju kroz slike</li>
                                      <li>5. Testiraj: Close gumb (X) za zatvaranje lightbox-a</li>
                                    </>
                                  )}
                                  {test.id === '24.1' && (
                                    <>
                                      <li>1. Kao provider: Kupi lead (test 4.1)</li>
                                      <li>2. Kao klijent: Pošalji ponudu provideru na taj lead</li>
                                      <li>3. ✅ TREBALO BI: Provider dobije email: "Nova ponuda za posao: [naslov]"</li>
                                      <li>4. Email trebao bi imati: Link do ponude, iznos, ili poruku</li>
                                      <li>5. Provjeri: Email je stigao na ispravnu adresu (Mailtrap/Gmail)</li>
                                    </>
                                  )}
                                  {test.id === '24.2' && (
                                    <>
                                      <li>1. Kao klijent: Kreiraj novi posao (test 3.1)</li>
                                      <li>2. Trebalo bi da se email pošalje sve relevantnim providerima (ako su omogućili)</li>
                                      <li>3. ✅ TREBALO BI: Provider dobije email: "Nov posao koji vas može zanimati: [naslov]"</li>
                                      <li>4. Email trebao bi imati:Link do posla, kategorija, budžet</li>
                                      <li>5. Provjeri: Email je stran samo providerima s tom kategorijom</li>
                                    </>
                                  )}
                                  {test.id === '24.3' && (
                                    <>
                                      <li>1. Kreiraj novog providera (registracija)</li>
                                      <li>2. Trebalo bi da je automatski upisana u TRIAL period (14 dana)</li>
                                      <li>3. Simuliraj vrijeme: Postavi datum na 11 dana nakon kreiranja</li>
                                      <li>4. ✅ TREBALO BI: Provider dobije email: "Trial istječe za 3 dana"</li>
                                      <li>5. Email trebao bi imati: Link za upgrade s popustom (npr. 20%)</li>
                                    </>
                                  )}
                                  {test.id === '24.4' && (
                                    <>
                                      <li>1. Kreiraj novog korisnika ali se ne prijavi 14+ dana</li>
                                      <li>2. ✅ TREBALO BI: Korisnik dobije email podsjetnik: "Dugo niste bili aktivni"</li>
                                      <li>3. Email trebao bi imati: Razlog (neactivity), Link za login</li>
                                      <li>4. Edge case: Ako je korisnik aktivan (login, kupnja leada), email se ne šalje</li>
                                    </>
                                  )}
                                  {test.id === '25.1' && (
                                    <>
                                      <li>1. Kao klijent: Otvori <strong>/jobs</strong> i primijeni filtre (kategorija, grad, budžet)</li>
                                      <li>2. Trebao bi vidjeti gumb "Spremi pretragu"</li>
                                      <li>3. Unesi naziv pretrage (npr. "Električni Zagreb")</li>
                                      <li>4. Klikni "Spremi" → ✅ Trebala bi poruka "Pretraga sprema"</li>
                                      <li>5. Otvori <strong>/profile/saved-searches</strong> → trebala bi vidjeti spremljenu pretragu</li>
                                    </>
                                  )}
                                  {test.id === '25.2' && (
                                    <>
                                      <li>1. Kao provider: Otvori <strong>/jobs</strong></li>
                                      <li>2. Primijeni filtre (kategorija, grad)</li>
                                      <li>3. Trebao bi vidjeti gumb "Kreiraj alert" ili "Job Alert"</li>
                                      <li>4. Klikni → trebalo bi forma za naziv i frekvenciju</li>
                                      <li>5. Odaberi frekvenciju i klikni "Kreiraj" → ✅ Alert je kreiran</li>
                                      <li>6. Provjeri <strong>/profile/job-alerts</strong> → trebaj vidjeti alert</li>
                                    </>
                                  )}
                                  {test.id === '25.3' && (
                                    <>
                                      <li>1. Kreiraj job alert (test 25.2)</li>
                                      <li>2. Trebalo bi vidjeti opcije za frekvenciju:</li>
                                      <li>   - <strong>INSTANT</strong>: Email čim se novi posao objavi</li>
                                      <li>   - <strong>DAILY</strong>: Dnevni summary email</li>
                                      <li>   - <strong>WEEKLY</strong>: Tjedni summary email</li>
                                      <li>3. Testiraj: Promijeni frekvenciju → trebalo bi se osvježiti</li>
                                    </>
                                  )}
                                  {test.id === '25.4' && (
                                    <>
                                      <li>1. Kreiraj job alert s INSTANT frekvencijom (test 25.2)</li>
                                      <li>2. Kreiraj novi posao koji odgovara alert filterima (test 3.1)</li>
                                      <li>3. ✅ TREBALO BI: Provider odmah dobije email s novim poslom</li>
                                      <li>4. Kreiraj job alert s DAILY frekvencijom</li>
                                      <li>5. ✅ TREBALO BI: Svako jutro provider dobije daily summary</li>
                                    </>
                                  )}
                                  {test.id === '26.1' && (
                                    <>
                                      <li>1. Kreiraj novog providera (registracija - test 1.2)</li>
                                      <li>2. Kao admin: Otvori <strong>/admin/provider-approvals</strong></li>
                                      <li>3. Pronađi novog providera s statusom "PENDING"</li>
                                      <li>4. Klikni "Odobri" → ✅ Status se mijenja na <strong>APPROVED</strong></li>
                                      <li>5. ✅ TREBALO BI: Provider dobije email "Vaš račun je odobren"</li>
                                      <li>6. Provjeri: Provider može sada pristupiti svim funkcijama</li>
                                    </>
                                  )}
                                  {test.id === '26.2' && (
                                    <>
                                      <li>1. Kao admin: Otvori <strong>/admin/provider-approvals</strong></li>
                                      <li>2. Pronađi providera i klikni "Odbij"</li>
                                      <li>3. Trebala bi forma za unos razloga odbijanja</li>
                                      <li>4. Unesi razlog i klikni "Pošalji" → ✅ Status se mijenja na <strong>REJECTED</strong></li>
                                      <li>5. ✅ TREBALO BI: Provider dobije email s razlogom</li>
                                    </>
                                  )}
                                  {test.id === '26.3' && (
                                    <>
                                      <li>1. Kao admin: Otvori <strong>/admin/users</strong></li>
                                      <li>2. Pronađi korisnika i otvori njegov profil</li>
                                      <li>3. Trebao bi vidjeti gumb "Suspend" ili "Ban"</li>
                                      <li>4. Klikni → trebala bi forma za razlog i trajanje (npr. 7 dana)</li>
                                      <li>5. Unesi razlog i klikni "Suspend" → ✅ Korisnik je suspenzioniran</li>
                                      <li>6. Provjeri: Korisnik ne može se prijavio ili pokreće ograničene akcije</li>
                                    </>
                                  )}
                                  {test.id === '26.4' && (
                                    <>
                                      <li>1. Kao admin: Otvori <strong>/admin/kyc-metrics</strong></li>
                                      <li>2. Trebalo bi vidjeti: Ukupan broj KYC aplikacija, verified, pending, rejected</li>
                                      <li>3. Trebalo bi vidjeti: Prosječno vrijeme do verifikacije</li>
                                      <li>4. Trebalo bi vidjeti: Grafički prikaz trendova (linerni graf)</li>
                                      <li>5. Trebalo bi vidjeti: Filter po datumu i statusu</li>
                                    </>
                                  )}
                                  {test.id === '27.1' && (
                                    <>
                                      <li>1. Kreiraj novog providera (test 1.2)</li>
                                      <li>2. Nakon registracije, trebalo bi redirect na <strong>Wizard</strong></li>
                                      <li>3. Trebalo bi vidjeti "Odabir kategorija" korak</li>
                                      <li>4. Trebala bi biti dostupna lista svih 51 kategorije</li>
                                      <li>5. Testiraj: Odaberi maksimalno 5 kategorija (trebalo bi blokirano 6+)</li>
                                      <li>6. Klikni "Dalje" → trebalo bi idućih korak u wizard-u</li>
                                    </>
                                  )}
                                  {test.id === '27.2' && (
                                    <>
                                      <li>1. U wizard-u: Korak "Odabir regija"</li>
                                      <li>2. Trebala bi biti dostupna lista svih regija/županija Hrvatske</li>
                                      <li>3. Testiraj: Odaberi nekoliko regija (npr. Zagreb, Split, Rijeka)</li>
                                      <li>4. ✅ TREBALO BI: Odabrane regije su vidljive s checkbox-ima</li>
                                      <li>5. Klikni "Dalje" → trebalo bi idućih korak</li>
                                    </>
                                  )}
                                  {test.id === '27.3' && (
                                    <>
                                      <li>1. Kreiraj novog providera i kreni kroz wizard (test 27.1, 27.2)</li>
                                      <li>2. Trebalo bi vidjeti progres bar (npr. "Korak 1 od 4")</li>
                                      <li>3. Trebalo bi vidjeti trenutni korak i što je preostalo</li>
                                      <li>4. Testiraj: "Nazad" gumb za vraćanje na prethodni korak</li>
                                      <li>5. Provjeri: Uneseni podaci se čuvaju pri vraćanju nazad</li>
                                    </>
                                  )}
                                  {test.id === '27.4' && (
                                    <>
                                      <li>1. Kreiraj novog providera i prođi kroz sve wizard korake</li>
                                      <li>2. Na završnom koraku, trebalo bi sažetka (Review) što je unesen</li>
                                      <li>3. Klikni "Završi" → ✅ Trebala bi poruka "Profil je aktivan"</li>
                                      <li>4. Trebalo bi redirect na dashboard ili profil</li>
                                      <li>5. Provjeri: Sve unesene podatke su spremljene (kategorije, regije, ostalo)</li>
                                    </>
                                  )}
                                  {test.id === '28.1' && (
                                    <>
                                      <li>1. Kao provider: Otvori <strong>/subscription</strong></li>
                                      <li>2. Trebao bi vidjeti trenutni plan (npr. BASIC)</li>
                                      <li>3. Odaberi viši plan (npr. PREMIUM)</li>
                                      <li>4. Trebalo bi vidjeti "Prorated billing" obračun:</li>
                                      <li>   - Preostali dio od trenutnog plana: -500 kn (BASIC za 15 dana)</li>
                                      <li>   - Novi plan PREMIUM: +1500 kn</li>
                                      <li>   - Ukupno za plaćanje: ~1000 kn</li>
                                      <li>5. Klikni "Nadogradi" → Stripe Checkout → plaćanje</li>
                                    </>
                                  )}
                                  {test.id === '28.2' && (
                                    <>
                                      <li>1. Kao provider na PREMIUM planu: Otvori /subscription</li>
                                      <li>2. Odaberi niži plan (BASIC)</li>
                                      <li>3. Trebalo bi poruka: "Promjena plana će biti učinjena na kraju perioda"</li>
                                      <li>4. Klikni "Sniži plan"</li>
                                      <li>5. ✅ TREBALO BI: Plan ostaje PREMIUM do kraja mjeseca, onda se promijeni na BASIC</li>
                                      <li>6. ✅ TREBALO BI: Povrat za preostali dio (prorated)</li>
                                    </>
                                  )}
                                  {test.id === '28.3' && (
                                    <>
                                      <li>1. Kao provider: Otvori <strong>/subscription</strong></li>
                                      <li>2. Trebao bi vidjeti gumb "Otkaži pretplatu"</li>
                                      <li>3. Klikni → trebala bi forma za razlog otkazivanja</li>
                                      <li>4. Unesi razlog i klikni "Otkaži" → ✅ Status se mijenja na "CANCELLED"</li>
                                      <li>5. ✅ TREBALO BI: Pretplata ostaje do kraja trenutnog perioda</li>
                                      <li>6. ✅ TREBALO BI: Korisnik dobije email potvrdu</li>
                                    </>
                                  )}
                                  {test.id === '28.4' && (
                                    <>
                                      <li>1. Kreiraj novog providera (registracija)</li>
                                      <li>2. ✅ TREBALO BI: Trebao bi biti automatski u TRIAL periodu (14 dana)</li>
                                      <li>3. Trebalo bi vidjeti: 8 besplatnih kredita, sve Premium feature-e</li>
                                      <li>4. Otvori <strong>/subscription</strong> → trebalo bi vidjeti "TRIAL" plan</li>
                                      <li>5. Trebalo bi vidjeti: Broj dana preostalo do isteka (14 dana)</li>
                                    </>
                                  )}
                                  {test.id === '29.1' && (
                                    <>
                                      <li>1. Kao provider: Otvori <strong>/roi</strong> dashboard</li>
                                      <li>2. Trebalo bi vidjeti key metrics kartice:</li>
                                      <li>   - Ukupan prihod od leadova</li>
                                      <li>   - Konverzija rate (%)</li>
                                      <li>   - Prosječna vrijednost leada</li>
                                      <li>   - Ukupno potrošenih kredita</li>
                                      <li>3. Trebalo bi vidjeti trenutne brojeve (npr. 5000 kn, 25%, 500 kn, 150)</li>
                                    </>
                                  )}
                                  {test.id === '29.2' && (
                                    <>
                                      <li>1. Otvori /roi dashboard</li>
                                      <li>2. Trebalo bi vidjeti grafičke prikaze:</li>
                                      <li>   - Linerni graf: ROI trend (zadnjih 30 dana)</li>
                                      <li>   - Bar graf: Konverzija po kategoriji</li>
                                      <li>   - Doughnut graf: Raspodjela rashoda (po kategoriji/izvor)</li>
                                      <li>3. Trebalo bi biti dostupan filter po datumu (danima, tjednom, mjesecom, godinom)</li>
                                      <li>4. Testiraj: Promijeni filter → grafici se osvježavaju</li>
                                    </>
                                  )}
                                  {test.id === '29.3' && (
                                    <>
                                      <li>1. Kao provider: Kupi nekoliko leadova (test 4.1)</li>
                                      <li>2. Označi neke kao "Kontaktirani" ili "Konvertirani"</li>
                                      <li>3. Otvori /roi dashboard</li>
                                      <li>4. Trebalo bi vidjeti: Conversion rate = (kontaktirani+konvertirani) / ukupno leads * 100%</li>
                                      <li>5. Trebalo bi vidjeti: Razrada po statusu (PENDING, INTERESTED, CONVERTED)</li>
                                    </>
                                  )}
                                  {test.id === '29.4' && (
                                    <>
                                      <li>1. Otvori /roi dashboard</li>
                                      <li>2. Trebao bi vidjeti gumb "Preuzmi izvještaj" ili sličan</li>
                                      <li>3. Trebalo bi biti dostupni vremenski periodi:</li>
                                      <li>   - Mjesečni (npr. Januar 2025)</li>
                                      <li>   - Godišnji (npr. 2024)</li>
                                      <li>4. Klikni na izvještaj → trebalo bi preuzeti PDF s detaljnom analizom</li>
                                    </>
                                  )}
                                  {test.id === '30.1' && (
                                    <>
                                      <li>1. Kao korisnik: Otvori /subscription i kupi nove kredite</li>
                                      <li>2. Nakon plaćanja, trebalo bi biti ažurirani krediti</li>
                                      <li>3. Otvori <strong>/profile/credits</strong> ili <strong>/subscription</strong></li>
                                      <li>4. Trebalo bi vidjeti novu transakciju: "+30 kredita" s datumom</li>
                                      <li>5. Trebalo bi biti vidljiv razlog: "Kupnja - PREMIUM plan"</li>
                                    </>
                                  )}
                                  {test.id === '30.2' && (
                                    <>
                                      <li>1. Kao provider: Kupi lead (test 4.1)</li>
                                      <li>2. Trebalo bi biti oduzeto kredita (npr. -15 kredita za lead)</li>
                                      <li>3. Otvori /profile/credits</li>
                                      <li>4. Trebalo bi vidjeti transakciju: "-15 kredita" s datumom i razlogom: "Kupnja leada - [naziv posla]"</li>
                                      <li>5. Krediti trebali bi biti stalno ažurirani</li>
                                    </>
                                  )}
                                  {test.id === '30.3' && (
                                    <>
                                      <li>1. Kao provider: Otvori <strong>/profile/credit-history</strong> ili <strong>/subscription/history</strong></li>
                                      <li>2. Trebalo bi vidjeti sve transakcije kredita (kupnja, trošenje, refund, itd.)</li>
                                      <li>3. Trebalo bi biti dostupan filter po tipu (CREDIT, PURCHASE, REFUND)</li>
                                      <li>4. Trebalo bi biti dostupan filter po datumu</li>
                                      <li>5. Trebalo bi biti dostupna opcija "Preuzmi kao CSV"</li>
                                    </>
                                  )}
                                  {test.id === '30.4' && (
                                    <>
                                      <li>1. Kao provider: Kupi lead i označi kao "Klijent nije odgovorio"</li>
                                      <li>2. Trebalo bi biti opcija "Zatraži refund"</li>
                                      <li>3. Klikni → trebalo bi biti vraćeno kredita</li>
                                      <li>4. Otvori /profile/credits → trebalo bi vidjeti: "-15 PURCHASE" i "+15 REFUND"</li>
                                      <li>5. ✅ Netto efekt: Krediti su vraćeni</li>
                                    </>
                                  )}
                                  {test.id === '31.1' && (
                                    <>
                                      <li>1. Otvori DevTools (F12) → Network tab</li>
                                      <li>2. Kreiraj neki API zahtjev (npr. load profile)</li>
                                      <li>3. Pronađi zahtjev u Network tab-u</li>
                                      <li>4. Pogledaj "Response Headers"</li>
                                      <li>5. ✅ TREBALO BI: Trebao bi biti `Access-Control-Allow-Origin: https://www.uslugar.eu`</li>
                                      <li>6. ✅ TREBALO BI: Trebao bi biti `Access-Control-Allow-Methods: GET, POST, PUT, DELETE`</li>
                                    </>
                                  )}
                                  {test.id === '31.2' && (
                                    <>
                                      <li>1. Otvori DevTools → Console tab</li>
                                      <li>2. Izvršiti POST zahtjev s "fetch" ali BEZ CSRF tokena</li>
                                      <li>3. Trebalo bi biti HTTP 403 greška: "CSRF token missing"</li>
                                      <li>4. ✅ TREBALO BI: POST zahtjev ne bi trebao biti procesiran bez validan CSRF tokena</li>
                                      <li>5. Testiraj: Dodaj validan CSRF token → trebalo bi da radi</li>
                                    </>
                                  )}
                                  {test.id === '31.3' && (
                                    <>
                                      <li>1. Backend test: Simuliraj više zahtjeva iz iste IP adrese u kratkom vremenu</li>
                                      <li>2. Trebalo bi biti limit (npr. 100 zahtjeva po minuti)</li>
                                      <li>3. ✅ TREBALO BI: Nakon limitavanja zahtjeva → HTTP 429 "Too Many Requests"</li>
                                      <li>4. Provjeri: Korisnik ne može dalje slati zahtjeve dok se ne obnovi</li>
                                      <li>5. Edge case: Admin ili VIP korisnici trebali bi imati viši limit</li>
                                    </>
                                  )}
                                  {test.id === '31.4' && (
                                    <>
                                      <li>1. Backend test: Simuliraj SQL injection napad</li>
                                      <li>2. Testiraj s payloadom: `' OR '1'='1` u nekom login field-u</li>
                                      <li>3. ✅ TREBALO BI: Parametrizovani query trebao bi biti korišten (prepared statements)</li>
                                      <li>4. ✅ TREBALO BI: SQL injection ne bi trebao biti moguć - trebala bi biti greška ili odbijeni zahtjev</li>
                                      <li>5. ✅ TREBALO BI: Trebali bi biti logirani svaki pokušaj SQL injectiona</li>
                                    </>
                                  )}
                                  {!['18.1', '18.2', '18.3', '18.4', '21.1', '21.2', '21.3', '21.4', '22.1', '22.2', '22.3', '22.4', '23.1', '23.2', '23.3', '23.4', '24.1', '24.2', '24.3', '24.4', '25.1', '25.2', '25.3', '25.4', '26.1', '26.2', '26.3', '26.4', '27.1', '27.2', '27.3', '27.4', '28.1', '28.2', '28.3', '28.4', '29.1', '29.2', '29.3', '29.4', '30.1', '30.2', '30.3', '30.4', '31.1', '31.2', '31.3', '31.4'].includes(test.id) && (
                                    <>
                                      <li>1. Prijavi se s odgovarajućom ulogom za ovaj test</li>
                                      <li>2. Navigiraj na relevantnu stranicu (vidi naziv testa)</li>
                                      <li>3. Izvrši akcije prema opisu testa</li>
                                      <li>4. ✅ Provjeri: Rezultati su kao što se očekuje (vidi opis testa)</li>
                                      <li>5. Ako je greška: Provjeri console za error poruke (F12 → Console)</li>
                                    </>
                                  )}
                                    <>
                                      <li>1. Prijavi se s odgovarajućom ulogom za ovaj test</li>
                                      <li>2. Navigiraj na relevantnu stranicu (vidi naziv testa)</li>
                                      <li>3. Izvrši akcije prema opisu testa</li>
                                      <li>4. ✅ Provjeri: Rezultati su kao što se očekuje (vidi opis testa)</li>
                                      <li>5. Ako je greška: Provjeri console za error poruke (F12 → Console)</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>

                            {/* Gumbi */}
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                onClick={async () => {
                                  setRunningTest(test.id)
                                  try {
                                    // Simulacija ručnog testa
                                    console.log(`[TEST] Pokrenuo ručni test: ${test.id}`)
                                    alert(`Ručni test: ${test.id} - ${test.name}\n\nSlijedi upute gore navedene.\n\nAko je test prošao uspješno, pritisni OK.`)
                                    setTestResults(prev => ({
                                      ...prev,
                                      [test.id]: { status: 'PASS', manual: true, timestamp: new Date() }
                                    }))
                                  } finally {
                                    setRunningTest(null)
                                  }
                                }}
                                disabled={runningTest === test.id}
                                className="px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                                title="Ručni test - slijedi upute"
                              >
                                ✋ Ručni test
                              </button>
                              <button
                                onClick={async () => {
                                  setRunningTest(test.id)
                                  try {
                                    // Simulacija automatskog testa s Playwright
                                    console.log(`[TEST] Pokrenuo automatski test: ${test.id}`)
                                    const response = await api.post(`/testing/run-single`, { 
                                      testId: test.id,
                                      testName: test.name
                                    }).catch(() => null)
                                    
                                    setTestResults(prev => ({
                                      ...prev,
                                      [test.id]: { 
                                        status: response?.data?.success ? 'PASS' : 'FAIL', 
                                        auto: true, 
                                        timestamp: new Date(),
                                        message: response?.data?.message
                                      }
                                    }))
                                  } finally {
                                    setRunningTest(null)
                                  }
                                }}
                                disabled={runningTest === test.id}
                                className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                title="Automatski test s Playwright"
                              >
                                {runningTest === test.id ? '⏳ Testira...' : '🤖 Automatski'}
                              </button>
                            </div>
                          </div>

                          {/* Rezultat testa */}
                          {testResults[test.id] && (
                            <div className={`mt-3 p-2 rounded text-sm ${
                              testResults[test.id].status === 'PASS' 
                                ? 'bg-green-50 border border-green-200 text-green-800' 
                                : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                              <strong>
                                {testResults[test.id].status === 'PASS' ? '✅ PROŠAO' : '❌ NIJE PROŠAO'}
                              </strong>
                              {testResults[test.id].manual && ' (Ručni test)'}
                              {testResults[test.id].auto && ' (Automatski)'}
                              {testResults[test.id].message && ` - ${testResults[test.id].message}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'plans' && (
        <div className="space-y-6">
          {/* Novi sekvencijalni test suite */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-indigo-900">🚀 Kompletan Test Suite</h3>
                <p className="text-sm text-indigo-700 mt-1">Sve funkcionalnosti iz dokumentacije - Sekvencijalno izvršavanje s checkpoint/rollback</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">20</div>
                <div className="text-xs text-indigo-600">Sektora</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4 border border-indigo-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { num: '1', title: 'Registracija i Autentifikacija', tests: 6 },
                  { num: '2', title: 'Upravljanje Kategorijama', tests: 3 },
                  { num: '3', title: 'Upravljanje Poslovima', tests: 8 },
                  { num: '4', title: 'Sustav Ponuda', tests: 3 },
                  { num: '5', title: 'Bodovanja i Recenzija', tests: 2 },
                  { num: '6', title: 'Profili Pružatelja', tests: 4 },
                  { num: '7', title: 'Chat i Komunikacija', tests: 2 },
                  { num: '8', title: 'Notifikacije', tests: 2 },
                  { num: '9', title: 'USLUGAR EXCLUSIVE', tests: 3 },
                  { num: '10', title: 'Queue Sustav', tests: 1 },
                  { num: '11', title: 'Refund i Povrat Kredita', tests: 1 },
                  { num: '12', title: 'Upravljanje Pretplatama', tests: 2 },
                  { num: '13', title: 'Admin Funkcionalnosti', tests: 3 },
                  { num: '14', title: 'Pravni Status i Verifikacija', tests: 2 },
                  { num: '15', title: 'Identity Badge Sustav', tests: 1 },
                  { num: '16', title: 'Reputacijski Sustav', tests: 1 },
                  { num: '17', title: 'Upravljanje Licencama', tests: 1 },
                  { num: '18', title: 'Plaćanja i Stripe', tests: 1 },
                  { num: '19', title: 'Tvrtke i Timovi', tests: 2 },
                  { num: '20', title: 'Chat Sustav', tests: 2 }
                ].map((sector, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">
                          <span className="inline-block bg-indigo-600 text-white rounded-full w-6 h-6 text-center text-xs leading-6 mr-2">
                            {sector.num}
                          </span>
                          {sector.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {sector.tests} test{sector.tests !== 1 ? 'ova' : 'a'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.open('/test-results/', '_blank')}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                📊 Pogledaj test rezultate
              </button>
              <button
                onClick={() => handleRunAutomated('complete-features-test', 'all')}
                disabled={runningAutomated}
                className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  runningAutomated
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title="Pokreće sve 50+ automatske testove sekvencijalno"
              >
                {runningAutomated && <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>🤖 Pokreni sve testove</span>
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <strong>ℹ️ Info:</strong> Test suite koristi checkpoint/rollback mehanizam. Svi testovi se izvršavaju sekvencijalno s automatskim cleanup-om između testova.
            </div>
          </div>

          {/* Stari planovi (ako postoje) */}
          {plans.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Ostali planovi:</h4>
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
              </div>
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

      {/* Test-data tab uklonjen - koristiš optimizirani test-data-optimized.json sa samo 5 globalnih korisnika */}
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


