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
import { resizeImageFile } from '../lib/photo-utils.js';
import { getIcebreakerPrompts } from '../lib/icebreakers.js';
import InviteSection from '../components/InviteSection.jsx';
import CountrySelect from '../components/CountrySelect.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

const IDENTITY_KEYS = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'];
const INTENT_KEYS = ['CHAT', 'CASUAL', 'RELATIONSHIP', 'MARRIAGE', 'ADVENTURE'];

export default function SettingsPage({ token, profile, onLogout, onProfileUpdate }) {
  const { t, locale, setLocale, catalog, labels } = useI18n();
  const icebreakerPrompts = getIcebreakerPrompts(catalog);
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
      setMessage(t('settings.planSuccess'), 'success');
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    if (form?.locale) setLocale(form.locale);
  }, [form?.locale, setLocale]);

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
      setMessage(t('settings.photoAdded'), 'info');
    } catch (error) {
      setMessage(error.message || t('settings.photoUploadFailed'), 'error');
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
      setMessage(t('settings.exportDone'), 'success');
    } else {
      setMessage(data?.error || t('settings.exportFailed'), 'error');
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
      setMessage(t('settings.selfieAdded'), 'info');
    } catch (error) {
      setMessage(error.message || t('settings.selfieFailed'), 'error');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setMessage(t('settings.geolocationUnsupported'), 'error');
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
        setMessage(t('settings.locationLoaded'), 'success');
        setBusy(false);
      },
      () => {
        setMessage(t('settings.locationFailed'), 'error');
        setBusy(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
    );
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (form.shareLocation && (form.latitude == null || form.longitude == null)) {
      setMessage(t('settings.locationRequired'), 'error');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const data = await updateProfile(token, {
        displayName: form.displayName,
        city: form.city,
        country: form.country,
        locale,
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
          country: data.profile.country,
          locale: data.profile.locale,
          availability: data.profile.availability,
          planTier: data.profile.planTier,
          onboardingDone: data.profile.onboardingDone,
          role: profile?.role
        });
        setMessage(t('settings.profileSaved'), 'success');
      } else {
        setMessage(data?.error || t('settings.saveFailed'), 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    const ok = window.confirm(t('settings.deleteConfirm'));
    if (!ok) return;
    setBusy(true);
    const data = await deleteAccount(token);
    if (data?.success) {
      onLogout?.();
      navigate('/');
    } else {
      setMessage(data?.error || t('settings.deleteFailed'), 'error');
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
    setMessage(data?.error || t('settings.checkoutFailed'), 'error');
    setBusy(false);
  }

  if (!form) {
    return (
      <main className="page settings-page">
        <p className="muted">{t('settings.loading')}</p>
      </main>
    );
  }

  return (
    <main className="page settings-page">
      <PageMeta titleKey="settings" descriptionKey="settings" />
      <p className="auth-footer">
        <Link to="/app">{t('settings.backToApp')}</Link>
      </p>
      <section className="hero settings-hero">
        <h1>{t('settings.title')}</h1>
        <p className="subtitle">
          {t('settings.subtitle', {
            percent: completeness,
            status: labels.labelAvailability(form.availability)
          })}
        </p>
      </section>

      {status && <p className={`status-banner status-${statusKind}`}>{status}</p>}

      <form className="card settings-form" onSubmit={saveProfile}>
        <div className="settings-photo-row">
          <ProfileAvatar person={form} size="lg" />
          <div>
            <label className="field-label">
              {t('settings.photos')} ({t('common.photoCount', { current: (form.photos || []).length, max: 3 })})
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={busy || (form.photos || []).length >= 3} />
            </label>
            <p className="muted">{t('settings.photosHint')}</p>
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
          {t('settings.displayName')}
          <input
            className="input"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
          />
        </label>

        <label className="field-label">
          {t('settings.city')}
          <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        </label>

        <label className="field-label">
          {t('auth.country')}
          <CountrySelect
            value={form.country || 'HR'}
            onChange={(country) => setForm({ ...form, country })}
          />
        </label>

        <label className="field-label">
          {t('auth.language')}
          <LanguageSwitcher />
        </label>

        <label className="field-label">
          {t('settings.bio')}
          <textarea
            className="input"
            rows={4}
            maxLength={500}
            value={form.bio || ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder={t('settings.bioPlaceholder')}
          />
        </label>

        <fieldset className="settings-fieldset">
          <legend>{t('settings.icebreakersLegend')}</legend>
          <p className="muted">{t('settings.icebreakersHint')}</p>
          {(form.icebreakers || []).map((item, index) => (
            <div key={index} className="icebreaker-edit">
              <label className="field-label">
                {t('common.question')}
                <select
                  className="input"
                  value={item.question}
                  onChange={(e) => {
                    const next = [...(form.icebreakers || [])];
                    next[index] = { ...next[index], question: e.target.value };
                    setForm({ ...form, icebreakers: next });
                  }}
                >
                  {icebreakerPrompts.map((prompt) => (
                    <option key={prompt} value={prompt}>{prompt}</option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                {t('common.answer')}
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
                {t('common.remove')}
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
                    {
                      question: icebreakerPrompts[(form.icebreakers || []).length % icebreakerPrompts.length],
                      answer: ''
                    }
                  ]
                })
              }
            >
              {t('settings.addIcebreaker')}
            </button>
          )}
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>{t('settings.locationLegend')}</legend>
          <p className="muted">{t('settings.locationHint')}</p>
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
            {t('settings.shareLocation')}
          </label>
          {form.shareLocation && (
            <div className="location-actions">
              <button type="button" className="button button-secondary" disabled={busy} onClick={detectLocation}>
                {t('settings.loadLocation')}
              </button>
              {form.latitude != null && form.longitude != null && (
                <span className="chip chip-verified">{t('settings.locationSaved')}</span>
              )}
            </div>
          )}
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>{t('settings.videoLegend')}</legend>
          <label className="field-label">
            {t('settings.videoPlaceholder')}
            <input
              className="input"
              type="url"
              placeholder={t('settings.videoUrlPlaceholder')}
              value={form.videoUrl || ''}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            />
          </label>
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>{t('settings.verificationLegend')}</legend>
          <p className="muted">{t('settings.verificationHint')}</p>
          {form.photoVerified && !form.verificationPending && (
            <span className="chip chip-verified">{t('settings.verified')}</span>
          )}
          {form.verificationPending && (
            <p className="status-banner status-info">{t('settings.verificationPending')}</p>
          )}
          <label className="field-label">
            {t('settings.verificationSelfie')}
            <input type="file" accept="image/*" onChange={handleSelfieChange} disabled={busy} />
          </label>
          {form.verificationSelfie && (
            <img src={form.verificationSelfie} alt="" className="verification-selfie-preview" />
          )}
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>{t('settings.identityLegend')}</legend>
          <div className="choice-row">
            {IDENTITY_KEYS.map((value) => (
              <label key={value} className="choice-chip">
                <input
                  type="radio"
                  name="identity"
                  checked={form.identity === value}
                  onChange={() => setForm({ ...form, identity: value })}
                />
                {labels.labelIdentity(value)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>{t('settings.seekingIdentityLegend')}</legend>
          <div className="choice-row">
            {IDENTITY_KEYS.map((value) => (
              <label key={value} className="choice-chip">
                <input
                  type="checkbox"
                  checked={form.seekingIdentities?.includes(value)}
                  onChange={() => toggleListField('seekingIdentities', value)}
                />
                {labels.labelIdentity(value)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>{t('settings.intentLegend')}</legend>
          <div className="choice-row">
            {INTENT_KEYS.map((value) => (
              <label key={value} className="choice-chip">
                <input
                  type="checkbox"
                  checked={form.intents?.includes(value)}
                  onChange={() => toggleListField('intents', value)}
                />
                {labels.labelIntent(value)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field-label">
          {t('settings.availabilityLabel')}
          <select
            className="input"
            value={form.availability === 'FOCUSED_CONTACT' ? 'FOCUSED_CONTACT' : form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
            disabled={form.availability === 'FOCUSED_CONTACT'}
          >
            <option value="AVAILABLE">{t('settings.availabilityAvailable')}</option>
            <option value="PAUSED">{t('settings.availabilityPaused')}</option>
            {form.availability === 'FOCUSED_CONTACT' && (
              <option value="FOCUSED_CONTACT">{t('settings.availabilityFocused')}</option>
            )}
          </select>
        </label>

        <label className="choice-chip notify-toggle">
          <input
            type="checkbox"
            checked={form.notifyEmail !== false}
            onChange={(e) => setForm({ ...form, notifyEmail: e.target.checked })}
          />
          {t('settings.notifyEmail')}
        </label>

        <div className="form-actions row">
          <button type="submit" className="button button-primary" disabled={busy}>
            {busy ? t('settings.saving') : t('settings.saveProfile')}
          </button>
        </div>
      </form>

      {plansStatus?.plansEnabled && plansStatus?.stripeEnabled && (
        <section className="card">
          <h2 className="section-title">{t('settings.premiumTitle')}</h2>
          <p className="muted">{t('settings.premiumHint')}</p>
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
        <h2 className="section-title">{t('settings.gdprTitle')}</h2>
        <p className="muted">{t('settings.gdprHint')}</p>
        <button type="button" className="button button-secondary" disabled={busy} onClick={exportData}>
          {t('settings.exportData')}
        </button>
      </section>

      <section className="card danger-zone">
        <h2 className="section-title">{t('settings.dangerTitle')}</h2>
        <p className="muted">{t('settings.dangerHint')}</p>
        <button type="button" className="button button-ghost" disabled={busy} onClick={handleDeleteAccount}>
          {t('settings.deleteAccount')}
        </button>
      </section>
    </main>
  );
}
