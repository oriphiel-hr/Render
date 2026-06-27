import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  createPlanCheckout,
  deleteAccount,
  exportMyData,
  getPlansStatus,
  getProfile,
  updateProfile
} from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';
import ProfileAvatar from '../components/ProfileAvatar.jsx';
import { IDENTITY_LABELS, INTENT_LABELS, PROFILE_TYPE_LABELS, labelAvailability } from '../lib/labels.js';
import { resizeImageFile } from '../lib/photo-utils.js';
import { ICEBREAKER_PROMPTS } from '../lib/icebreakers.js';
import InviteSection from '../components/InviteSection.jsx';

export default function SettingsPage({ token, profile, onLogout, onProfileUpdate }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(null);
  const [completeness, setCompleteness] = useState(0);
  const [status, setStatus] = useState('');
  const [statusKind, setStatusKind] = useState('info');
  const [busy, setBusy] = useState(false);
  const [plansStatus, setPlansStatus] = useState(null);

  function setMessage(message, kind = 'info') {
    setStatus(message);
    setStatusKind(kind);
  }

  async function load() {
    const [profileData, plansData] = await Promise.all([getProfile(token), getPlansStatus()]);
    if (profileData?.success) {
      setForm(profileData.profile);
      setCompleteness(profileData.completeness || 0);
    }
    if (plansData?.success) setPlansStatus(plansData);
    if (searchParams.get('plan') === 'success') {
      setMessage('Uplata zaprimljena. Premium aktivacija slijedi nakon provjere.', 'success');
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  function toggleListField(field, value) {
    setForm((prev) => {
      const list = Array.isArray(prev[field]) ? prev[field] : [];
      const exists = list.includes(value);
      const next = exists ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [field]: next.length > 0 ? next : [value] };
    });
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      const nextPhotos = [...(form.photos || []), dataUrl].slice(0, 3);
      setForm((prev) => ({ ...prev, photos: nextPhotos }));
      setMessage('Fotografija dodana — klikni Spremi profil.', 'info');
    } catch (error) {
      setMessage(error.message || 'Upload fotografije nije uspio.', 'error');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  async function exportData() {
    setBusy(true);
    const data = await exportMyData(token);
    if (data?.success) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ravnopar-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Izvoz podataka preuzet.', 'success');
    } else {
      setMessage(data?.error || 'Izvoz nije uspio.', 'error');
    }
    setBusy(false);
  }

  async function handleSelfieChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      setForm((prev) => ({ ...prev, verificationSelfie: dataUrl, verificationPending: true }));
      setMessage('Selfie dodan — spremi profil za slanje na provjeru.', 'info');
    } catch (error) {
      setMessage(error.message || 'Selfie nije uspio.', 'error');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setMessage('Preglednik ne podržava geolokaciju.', 'error');
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          shareLocation: true,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
        setMessage('Lokacija učitana. Spremi profil.', 'success');
        setBusy(false);
      },
      () => {
        setMessage('Lokacija nije dostupna. Provjeri dozvole preglednika.', 'error');
        setBusy(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
    );
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (form.shareLocation && (form.latitude == null || form.longitude == null)) {
      setMessage('Uključi lokaciju gumbom „Učitaj moju lokaciju“ prije spremanja.', 'error');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const data = await updateProfile(token, {
        displayName: form.displayName,
        city: form.city,
        bio: form.bio || null,
        identity: form.identity,
        profileType: form.profileType,
        seekingIdentities: form.seekingIdentities,
        seekingProfileTypes: form.seekingProfileTypes,
        intents: form.intents,
        availability: form.availability,
        notifyEmail: form.notifyEmail,
        photos: form.photos || [],
        icebreakers: form.icebreakers || [],
        shareLocation: Boolean(form.shareLocation),
        latitude: form.shareLocation ? form.latitude ?? null : null,
        longitude: form.shareLocation ? form.longitude ?? null : null,
        videoUrl: form.videoUrl?.trim() || null,
        ...(form.verificationSelfie?.startsWith('data:image/')
          ? { verificationSelfie: form.verificationSelfie }
          : {})
      });
      if (data?.success) {
        setForm(data.profile);
        setCompleteness(data.completeness || 0);
        onProfileUpdate?.({
          id: data.profile.id,
          displayName: data.profile.displayName,
          city: data.profile.city,
          availability: data.profile.availability,
          planTier: data.profile.planTier,
          onboardingDone: data.profile.onboardingDone,
          role: profile?.role
        });
        setMessage('Profil je spremljen.', 'success');
      } else {
        setMessage(data?.error || 'Spremanje nije uspjelo.', 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    const ok = window.confirm('Trajno obrisati račun? Ova radnja se ne može poništiti.');
    if (!ok) return;
    setBusy(true);
    const data = await deleteAccount(token);
    if (data?.success) {
      onLogout?.();
      navigate('/');
    } else {
      setMessage(data?.error || 'Brisanje računa nije uspjelo.', 'error');
      setBusy(false);
    }
  }

  async function buyPlan(planId) {
    setBusy(true);
    const data = await createPlanCheckout(token, planId);
    if (data?.success && data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    setMessage(data?.error || 'Premium checkout nije dostupan.', 'error');
    setBusy(false);
  }

  if (!form) {
    return (
      <main className="page settings-page">
        <p className="muted">Učitavanje postavki...</p>
      </main>
    );
  }

  return (
    <main className="page settings-page">
      <PageMeta title="Postavke" description="Uredi profil, fotografije, obavijesti i privatnost." />
      <p className="auth-footer">
        <Link to="/app">← Moj prostor</Link>
      </p>
      <section className="hero settings-hero">
        <h1>Postavke profila</h1>
        <p className="subtitle">Popunjenost: {completeness}% · Status: {labelAvailability(form.availability)}</p>
      </section>

      {status && <p className={`status-banner status-${statusKind}`}>{status}</p>}

      <form className="card settings-form" onSubmit={saveProfile}>
        <div className="settings-photo-row">
          <ProfileAvatar person={form} size="lg" />
          <div>
            <label className="field-label">
              Fotografije ({(form.photos || []).length}/3)
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={busy || (form.photos || []).length >= 3} />
            </label>
            <p className="muted">JPG/PNG, automatski smanjeno. Maks. 3 fotografije.</p>
            {(form.photos || []).length > 0 && (
              <div className="photo-gallery">
                {form.photos.map((photo, index) => (
                  <img key={`${index}-${photo.slice(-12)}`} src={photo} alt="" className="photo-thumb" />
                ))}
              </div>
            )}
          </div>
        </div>

        <label className="field-label">
          Ime za prikaz
          <input
            className="input"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
          />
        </label>

        <label className="field-label">
          Grad
          <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        </label>

        <label className="field-label">
          O meni (bio)
          <textarea
            className="input"
            rows={4}
            maxLength={500}
            value={form.bio || ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Kratko se predstavi — što tražiš, što voliš..."
          />
        </label>

        <fieldset className="settings-fieldset">
          <legend>Icebreaker pitanja (do 3)</legend>
          <p className="muted">Kratka pitanja i odgovori — pomažu pri prvom kontaktu.</p>
          {(form.icebreakers || []).map((item, index) => (
            <div key={index} className="icebreaker-edit">
              <label className="field-label">
                Pitanje
                <select
                  className="input"
                  value={item.question}
                  onChange={(e) => {
                    const next = [...(form.icebreakers || [])];
                    next[index] = { ...next[index], question: e.target.value };
                    setForm({ ...form, icebreakers: next });
                  }}
                >
                  {ICEBREAKER_PROMPTS.map((prompt) => (
                    <option key={prompt} value={prompt}>{prompt}</option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                Odgovor
                <input
                  className="input"
                  maxLength={200}
                  value={item.answer}
                  onChange={(e) => {
                    const next = [...(form.icebreakers || [])];
                    next[index] = { ...next[index], answer: e.target.value };
                    setForm({ ...form, icebreakers: next });
                  }}
                />
              </label>
              <button
                type="button"
                className="button button-ghost button-sm"
                onClick={() => setForm({ ...form, icebreakers: (form.icebreakers || []).filter((_, i) => i !== index) })}
              >
                Ukloni
              </button>
            </div>
          ))}
          {(form.icebreakers || []).length < 3 && (
            <button
              type="button"
              className="button button-secondary"
              onClick={() =>
                setForm({
                  ...form,
                  icebreakers: [
                    ...(form.icebreakers || []),
                    { question: ICEBREAKER_PROMPTS[(form.icebreakers || []).length % ICEBREAKER_PROMPTS.length], answer: '' }
                  ]
                })
              }
            >
              Dodaj icebreaker
            </button>
          )}
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>Udaljenost (privatno)</legend>
          <p className="muted">
            Koordinate se ne prikazuju drugima — samo gruba udaljenost (npr. „5–15 km“). Oboje mora uključiti opciju.
          </p>
          <label className="choice-chip notify-toggle">
            <input
              type="checkbox"
              checked={Boolean(form.shareLocation)}
              onChange={(e) =>
                setForm({
                  ...form,
                  shareLocation: e.target.checked,
                  ...(e.target.checked ? {} : { latitude: null, longitude: null })
                })
              }
            />
            Prikaži udaljenost od mene drugim korisnicima
          </label>
          {form.shareLocation && (
            <div className="location-actions">
              <button type="button" className="button button-secondary" disabled={busy} onClick={detectLocation}>
                Učitaj moju lokaciju
              </button>
              {form.latitude != null && form.longitude != null && (
                <span className="chip chip-verified">Lokacija spremljena</span>
              )}
            </div>
          )}
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>Video profil (link)</legend>
          <label className="field-label">
            YouTube, Vimeo, Instagram ili TikTok link
            <input
              className="input"
              type="url"
              placeholder="https://youtube.com/..."
              value={form.videoUrl || ''}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            />
          </label>
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>Verifikacija profila</legend>
          <p className="muted">
            Selfie za ručnu provjeru admin tima — usporedba s profilnom fotkom. Nije javno vidljivo.
          </p>
          {form.photoVerified && !form.verificationPending && (
            <span className="chip chip-verified">Profil verificiran</span>
          )}
          {form.verificationPending && (
            <p className="status-banner status-info">Selfie je na provjeri — obavijest stiže nakon pregleda.</p>
          )}
          <label className="field-label">
            Verifikacijski selfie
            <input type="file" accept="image/*" onChange={handleSelfieChange} disabled={busy} />
          </label>
          {form.verificationSelfie && (
            <img src={form.verificationSelfie} alt="" className="verification-selfie-preview" />
          )}
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>Identitet</legend>
          <div className="choice-row">
            {Object.entries(IDENTITY_LABELS).map(([value, label]) => (
              <label key={value} className="choice-chip">
                <input
                  type="radio"
                  name="identity"
                  checked={form.identity === value}
                  onChange={() => setForm({ ...form, identity: value })}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>Tražim identitet</legend>
          <div className="choice-row">
            {Object.entries(IDENTITY_LABELS).map(([value, label]) => (
              <label key={value} className="choice-chip">
                <input
                  type="checkbox"
                  checked={form.seekingIdentities?.includes(value)}
                  onChange={() => toggleListField('seekingIdentities', value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>Namjera</legend>
          <div className="choice-row">
            {Object.entries(INTENT_LABELS).map(([value, label]) => (
              <label key={value} className="choice-chip">
                <input
                  type="checkbox"
                  checked={form.intents?.includes(value)}
                  onChange={() => toggleListField('intents', value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field-label">
          Vidljivost profila
          <select
            className="input"
            value={form.availability === 'FOCUSED_CONTACT' ? 'FOCUSED_CONTACT' : form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
            disabled={form.availability === 'FOCUSED_CONTACT'}
          >
            <option value="AVAILABLE">Dostupan/na u feedu</option>
            <option value="PAUSED">Pauzirano (skriven/a)</option>
            {form.availability === 'FOCUSED_CONTACT' && (
              <option value="FOCUSED_CONTACT">U aktivnom razgovoru</option>
            )}
          </select>
        </label>

        <label className="choice-chip notify-toggle">
          <input
            type="checkbox"
            checked={form.notifyEmail !== false}
            onChange={(e) => setForm({ ...form, notifyEmail: e.target.checked })}
          />
          Email obavijesti (novi zahtjevi, match, poruke)
        </label>

        <div className="form-actions row">
          <button type="submit" className="button button-primary" disabled={busy}>
            {busy ? 'Spremanje...' : 'Spremi profil'}
          </button>
        </div>
      </form>

      {plansStatus?.plansEnabled && plansStatus?.stripeEnabled && (
        <section className="card">
          <h2 className="section-title">Premium paketi</h2>
          <p className="muted">Checkout je spreman — aktivacija paketa nakon uplate.</p>
          <div className="form-actions row">
            {plansStatus.plans?.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className="button button-secondary"
                disabled={busy}
                onClick={() => buyPlan(plan.id)}
              >
                {plan.label} — {(plan.amountCents / 100).toFixed(2).replace('.', ',')} €
              </button>
            ))}
          </div>
        </section>
      )}

      <InviteSection token={token} />

      <section className="card">
        <h2 className="section-title">Privatnost (GDPR)</h2>
        <p className="muted">Preuzmi kopiju svojih podataka u JSON formatu.</p>
        <button type="button" className="button button-secondary" disabled={busy} onClick={exportData}>
          Preuzmi moje podatke
        </button>
      </section>

      <section className="card danger-zone">
        <h2 className="section-title">Opasna zona</h2>
        <p className="muted">Brisanje računa uklanja profil, poruke i povijest kontakata.</p>
        <button type="button" className="button button-ghost" disabled={busy} onClick={handleDeleteAccount}>
          Obriši račun
        </button>
      </section>
    </main>
  );
}
