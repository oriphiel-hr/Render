'use client';

import { useEffect, useState } from 'react';
import Link from '../components/Link.jsx';
import { useNavigate, useSearchParams } from '../lib/next-router-compat.js';
import {
  createPlanCheckout,
  deleteAccount,
  deleteProfileVideo,
  exportMyData,
  getMyOrders,
  getPlansStatus,
  getProfile,
  updateProfile,
  uploadProfileVideo
} from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';
import ProfileAvatar from '../components/ProfileAvatar.jsx';
import VideoEmbed from '../components/VideoEmbed.jsx';
import { resizeImageFile } from '../lib/photo-utils.js';
import { getIcebreakerPrompts } from '../lib/icebreakers.js';
import InviteSection from '../components/InviteSection.jsx';
import CountrySelect from '../components/CountrySelect.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import PushOptIn from '../components/PushOptIn.jsx';
import { translateApiError, useI18n } from '../lib/i18n/index.jsx';
import TagPicker from '../components/TagPicker.jsx';
import { PRIVATE_TAG_KEYS, PUBLIC_TAG_KEYS } from '../lib/profile-tags.js';
import {
  CHILDREN_KEYS,
  RELATIONSHIP_KEYS,
  SMOKING_KEYS
} from '../lib/profile-lifestyle.js';

const IDENTITY_KEYS = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'];
const PROFILE_TYPE_KEYS = ['INDIVIDUAL', 'COUPLE'];
const INTENT_KEYS = ['CHAT', 'CASUAL', 'RELATIONSHIP', 'MARRIAGE', 'ADVENTURE'];
const DISTANCE_KM_OPTIONS = [25, 50, 100, 200, 500];

export default function SettingsPage({ token, profile, onLogout, onProfileUpdate }) {
  const { t, locale, catalog, labels } = useI18n();
  const icebreakerPrompts = getIcebreakerPrompts(catalog);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(null);
  const [completeness, setCompleteness] = useState(0);
  const [status, setStatus] = useState('');
  const [statusKind, setStatusKind] = useState('info');
  const [busy, setBusy] = useState(false);
  const [plansStatus, setPlansStatus] = useState(null);
  const [orders, setOrders] = useState([]);

  function formatOrderAmount(cents) {
    return `${(cents / 100).toFixed(2).replace('.', ',')} €`;
  }

  function formatOrderType(order) {
    if (order.orderType === 'DONATION') return t('settings.orderDonation');
    if (order.orderType === 'PLAN') return t('settings.orderPlan');
    return t('settings.orderOther');
  }

  function formatOrderStatus(status) {
    const key = `settings.orderStatus_${status}`;
    const label = t(key);
    return label === key ? status : label;
  }

  function setMessage(message, kind = 'info') {
    setStatus(message);
    setStatusKind(kind);
  }

  async function load() {
    const [profileData, plansData, ordersData] = await Promise.all([
      getProfile(token),
      getPlansStatus(),
      getMyOrders(token)
    ]);
    if (profileData?.success) {
      setForm(profileData.profile);
      setCompleteness(profileData.completeness || 0);
    }
    if (plansData?.success) setPlansStatus(plansData);
    if (ordersData?.success) setOrders(ordersData.items || []);
    if (searchParams.get('plan') === 'success') {
      setMessage(t('settings.planSuccess'), 'success');
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
      setMessage(t('settings.photoAdded'), 'info');
    } catch (error) {
      setMessage(error.message || t('settings.photoUploadFailed'), 'error');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  function removePhoto(index) {
    setForm((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
    setMessage(t('settings.photoRemoved'), 'info');
  }

  async function handleVideoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const maxBytes = 30 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessage(t('settings.videoTooLarge'), 'error');
      event.target.value = '';
      return;
    }
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(file.type)) {
      setMessage(t('settings.videoBadType'), 'error');
      event.target.value = '';
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const data = await uploadProfileVideo(token, file);
      if (data?.success) {
        setForm(data.profile);
        setCompleteness(data.completeness || completeness);
        setMessage(t('settings.videoUploaded'), 'success');
      } else {
        setMessage(data?.error || t('settings.videoUploadFailed'), 'error');
      }
    } catch (_error) {
      setMessage(t('settings.videoUploadFailed'), 'error');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  async function handleVideoRemove() {
    setBusy(true);
    setMessage('');
    try {
      const data = await deleteProfileVideo(token);
      if (data?.success) {
        setForm(data.profile);
        setCompleteness(data.completeness || completeness);
        setMessage(t('settings.videoRemoved'), 'success');
      } else {
        setMessage(data?.error || t('settings.videoRemoveFailed'), 'error');
      }
    } catch (_error) {
      setMessage(t('settings.videoRemoveFailed'), 'error');
    } finally {
      setBusy(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (form.shareLocation && (form.latitude == null || form.longitude == null)) {
      setMessage(t('settings.locationRequired'), 'error');
      return;
    }
    const seekingAgeMin = Number(form.seekingAgeMin);
    const seekingAgeMax = Number(form.seekingAgeMax);
    if (!Number.isFinite(seekingAgeMin) || !Number.isFinite(seekingAgeMax)) {
      setMessage(t('settings.ageRangeInvalid'), 'error');
      return;
    }
    if (seekingAgeMin < 18 || seekingAgeMax < 18) {
      setMessage(t('settings.seekingAgeUnder18'), 'error');
      return;
    }
    if (seekingAgeMin > 99 || seekingAgeMax > 99) {
      setMessage(t('settings.seekingAgeOver99'), 'error');
      return;
    }
    if (seekingAgeMin > seekingAgeMax) {
      setMessage(t('settings.ageRangeInvalid'), 'error');
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
        seekingAgeMin,
        seekingAgeMax,
        maxDistanceKm: form.maxDistanceKm ? Number(form.maxDistanceKm) : null,
        sameCountryOnly: Boolean(form.sameCountryOnly),
        availability: form.availability,
        notifyEmail: form.notifyEmail,
        donorBadgeVisible: form.donorBadgeVisible,
        photos: form.photos || [],
        icebreakers: form.icebreakers || [],
        publicTags: form.publicTags || [],
        privateTags: form.privateTags || [],
        childrenPref: form.childrenPref || null,
        smoking: form.smoking || null,
        relationshipStatus: form.relationshipStatus || null,
        shareLocation: Boolean(form.shareLocation),
        latitude: form.shareLocation ? form.latitude ?? null : null,
        longitude: form.shareLocation ? form.longitude ?? null : null,
        videoUrl: form.videoUrl?.startsWith('/media/')
          ? form.videoUrl
          : form.videoUrl?.trim() || null,
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
        setMessage(translateApiError(data) || data?.error || t('settings.saveFailed'), 'error');
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
              {t('settings.photos', { current: (form.photos || []).length, max: 3 })}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                disabled={busy || (form.photos || []).length >= 3}
              />
            </label>
            <p className="muted">{t('settings.photosHint')}</p>
            {(form.photos || []).length > 0 && (
              <div className="photo-gallery settings-photo-thumbs">
                {form.photos.map((photo, index) => (
                  <div key={`${index}-${photo.slice(-12)}`} className="settings-photo-thumb-wrap">
                    <img src={photo} alt="" className="photo-thumb" />
                    <button
                      type="button"
                      className="button button-ghost button-sm settings-photo-remove"
                      disabled={busy}
                      onClick={() => removePhoto(index)}
                    >
                      {t('settings.photoRemove')}
                    </button>
                  </div>
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
          <legend>{t('settings.publicTagsLegend')}</legend>
          <p className="muted">{t('settings.publicTagsHint')}</p>
          <TagPicker
            tags={form.publicTags || []}
            catalogKeys={PUBLIC_TAG_KEYS}
            scope="public"
            disabled={busy}
            onChange={(publicTags) => setForm({ ...form, publicTags })}
          />
        </fieldset>

        <fieldset className="settings-fieldset settings-fieldset-private">
          <legend>{t('settings.privateTagsLegend')}</legend>
          <p className="muted">{t('settings.privateTagsHint')}</p>
          <TagPicker
            tags={form.privateTags || []}
            catalogKeys={PRIVATE_TAG_KEYS}
            scope="private"
            disabled={busy}
            onChange={(privateTags) => setForm({ ...form, privateTags })}
          />
        </fieldset>

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
          <legend>{t('settings.lifestyleLegend')}</legend>
          <p className="muted">{t('settings.lifestyleHint')}</p>
          <label className="field-label">
            {t('settings.childrenLabel')}
            <select
              className="input"
              value={form.childrenPref || ''}
              onChange={(e) => setForm({ ...form, childrenPref: e.target.value || null })}
            >
              <option value="">{t('settings.lifestyleUnset')}</option>
              {CHILDREN_KEYS.map((value) => (
                <option key={value} value={value}>
                  {labels.labelChildren(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            {t('settings.smokingLabel')}
            <select
              className="input"
              value={form.smoking || ''}
              onChange={(e) => setForm({ ...form, smoking: e.target.value || null })}
            >
              <option value="">{t('settings.lifestyleUnset')}</option>
              {SMOKING_KEYS.map((value) => (
                <option key={value} value={value}>
                  {labels.labelSmoking(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            {t('settings.relationshipLabel')}
            <select
              className="input"
              value={form.relationshipStatus || ''}
              onChange={(e) => setForm({ ...form, relationshipStatus: e.target.value || null })}
            >
              <option value="">{t('settings.lifestyleUnset')}</option>
              {RELATIONSHIP_KEYS.map((value) => (
                <option key={value} value={value}>
                  {labels.labelRelationship(value)}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>{t('settings.preferencesLegend')}</legend>
          <p className="muted">{t('settings.preferencesHint')}</p>
          <div className="age-range-row">
            <label className="field-label">
              {t('settings.seekingAgeMin')}
              <input
                className="input"
                type="number"
                min={18}
                max={99}
                value={form.seekingAgeMin ?? 18}
                onChange={(e) => setForm({ ...form, seekingAgeMin: e.target.value })}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isFinite(value) && value < 18) {
                    setForm({ ...form, seekingAgeMin: 18 });
                  }
                }}
                required
              />
            </label>
            <label className="field-label">
              {t('settings.seekingAgeMax')}
              <input
                className="input"
                type="number"
                min={18}
                max={99}
                value={form.seekingAgeMax ?? 99}
                onChange={(e) => setForm({ ...form, seekingAgeMax: e.target.value })}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isFinite(value) && value < 18) {
                    setForm({ ...form, seekingAgeMax: 18 });
                  }
                }}
                required
              />
            </label>
          </div>
          <p className="muted">{t('settings.seekingAgeHint')}</p>

          <label className="field-label">
            {t('settings.maxDistanceLabel')}
            <select
              className="input"
              value={form.maxDistanceKm ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxDistanceKm: e.target.value ? Number(e.target.value) : null
                })
              }
            >
              <option value="">{t('settings.distanceUnlimited')}</option>
              {DISTANCE_KM_OPTIONS.map((km) => (
                <option key={km} value={km}>
                  {t('settings.distanceKmOption', { km })}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">{t('settings.maxDistanceHint')}</p>

          <label className="choice-chip notify-toggle">
            <input
              type="checkbox"
              checked={Boolean(form.sameCountryOnly)}
              onChange={(e) => setForm({ ...form, sameCountryOnly: e.target.checked })}
            />
            {t('settings.sameCountryOnly')}
          </label>
          <p className="muted">{t('settings.sameCountryHint')}</p>
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
          <p className="muted">{t('settings.videoHint')}</p>
          <label className="field-label">
            {t('settings.videoUpload')}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              onChange={handleVideoChange}
              disabled={busy}
            />
          </label>
          {form.videoUrl && (
            <div className="settings-video-preview">
              <VideoEmbed url={form.videoUrl} />
              <button
                type="button"
                className="button button-secondary"
                disabled={busy}
                onClick={handleVideoRemove}
              >
                {t('settings.videoRemove')}
              </button>
            </div>
          )}
          <label className="field-label">
            {t('settings.videoPlaceholder')}
            <input
              className="input"
              type="url"
              placeholder={t('settings.videoUrlPlaceholder')}
              value={form.videoUrl?.startsWith('/media/') ? '' : form.videoUrl || ''}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              disabled={busy || Boolean(form.videoUrl?.startsWith('/media/'))}
            />
          </label>
          {form.videoUrl?.startsWith?.('/media/') && (
            <p className="muted">{t('settings.videoHostedNote')}</p>
          )}
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
            <input type="file" accept="image/*" capture="user" onChange={handleSelfieChange} disabled={busy} />
          </label>
          {form.verificationSelfie && (
            <img src={form.verificationSelfie} alt="" className="verification-selfie-preview" />
          )}
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>{t('settings.profileTypeLegend')}</legend>
          <div className="choice-row">
            {PROFILE_TYPE_KEYS.map((value) => (
              <label key={value} className="choice-chip">
                <input
                  type="radio"
                  name="profileType"
                  checked={form.profileType === value}
                  onChange={() => setForm({ ...form, profileType: value })}
                />
                {t(`profileType.${value}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>{t('settings.seekingProfileTypeLegend')}</legend>
          <div className="choice-row">
            {PROFILE_TYPE_KEYS.map((value) => (
              <label key={value} className="choice-chip">
                <input
                  type="checkbox"
                  checked={form.seekingProfileTypes?.includes(value)}
                  onChange={() => toggleListField('seekingProfileTypes', value)}
                />
                {t(`profileType.${value}`)}
              </label>
            ))}
          </div>
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

        {(form.lifetimeDonatedCents || 0) > 0 && (
          <label className="choice-chip notify-toggle">
            <input
              type="checkbox"
              checked={form.donorBadgeVisible !== false}
              onChange={(e) => setForm({ ...form, donorBadgeVisible: e.target.checked })}
            />
            {t('settings.donorBadgeVisible')}
          </label>
        )}
        {(form.lifetimeDonatedCents || 0) > 0 && (
          <p className="muted">{t('settings.donorBadgeHint')}</p>
        )}

        <fieldset className="settings-fieldset">
          <legend>{t('pwa.pushLegend')}</legend>
          <PushOptIn />
        </fieldset>

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

      {orders.length > 0 && (
        <section className="card">
          <h2 className="section-title">{t('settings.ordersTitle')}</h2>
          <p className="muted">{t('settings.ordersHint')}</p>
          <ul className="orders-list">
            {orders.map((order) => (
              <li key={order.id} className="order-row">
                <span className="order-type">{formatOrderType(order)}</span>
                <span className="order-amount">{formatOrderAmount(order.amountCents)}</span>
                <span className={`order-status order-status-${order.status.toLowerCase()}`}>
                  {formatOrderStatus(order.status)}
                </span>
                <time className="order-date" dateTime={order.createdAt}>
                  {new Date(order.createdAt).toLocaleDateString(locale)}
                </time>
              </li>
            ))}
          </ul>
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
