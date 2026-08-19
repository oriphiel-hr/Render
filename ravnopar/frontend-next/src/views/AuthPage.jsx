'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from '../components/Link.jsx';
import { useSearchParams } from '../lib/next-router-compat.js';
import { forgotPassword, login, register, resetPassword, verifyEmail } from '../api/index.js';
import { translateApiError, useI18n } from '../lib/i18n/index.jsx';
import DateOfBirthPicker, { isAdultDob } from '../components/DateOfBirthPicker.jsx';
import CountrySelect from '../components/CountrySelect.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import TurnstileWidget, { isTurnstileEnabled, resetTurnstileWidget } from '../components/TurnstileWidget.jsx';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';

const IDENTITY_KEYS = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'];
const PROFILE_TYPE_KEYS = ['INDIVIDUAL', 'COUPLE'];
const INTENT_KEYS = ['CHAT', 'CASUAL', 'RELATIONSHIP', 'MARRIAGE', 'ADVENTURE'];

export default function AuthPage({ onLogin }) {
  const { t, locale } = useI18n();
  const [searchParams] = useSearchParams();
  const loginOnly = searchParams.get('login') === '1';

  const REG_STEPS = useMemo(
    () => [
      { id: 1, title: t('auth.stepAccount') },
      { id: 2, title: t('auth.stepVerify') },
      { id: 3, title: t('auth.stepLogin') }
    ],
    [t]
  );
  const STEPS = useMemo(
    () => [...REG_STEPS, { id: 4, title: t('auth.stepReset') }, { id: 5, title: t('auth.stepNewPassword') }],
    [REG_STEPS, t]
  );

  const [step, setStep] = useState(() => {
    if (searchParams.get('reset') === '1') return 4;
    if (loginOnly) return 3;
    return 1;
  });
  const [busy, setBusy] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    displayName: '',
    dateOfBirth: '',
    city: '',
    country: 'HR',
    locale: 'hr',
    bio: '',
    identity: 'OTHER',
    profileType: 'INDIVIDUAL',
    seekingIdentities: ['FEMALE'],
    seekingProfileTypes: ['INDIVIDUAL'],
    intents: ['RELATIONSHIP'],
    referralCode: searchParams.get('ref')?.trim().toLowerCase() || ''
  });
  const [verifyForm, setVerifyForm] = useState({ email: '', code: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [forgotForm, setForgotForm] = useState({ email: '' });
  const [resetForm, setResetForm] = useState({ email: '', code: '', newPassword: '' });
  const [website, setWebsite] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [status, setStatus] = useState('');
  const [statusKind, setStatusKind] = useState('info');
  const signupStartedRef = useRef(false);

  useEffect(() => {
    setRegisterForm((prev) => ({ ...prev, locale }));
  }, [locale]);

  useEffect(() => {
    if (loginOnly || step !== 1 || signupStartedRef.current) return;
    signupStartedRef.current = true;
    trackEvent(ANALYTICS_EVENTS.SIGNUP_STARTED, { locale });
  }, [loginOnly, step, locale]);

  useEffect(() => {
    if (searchParams.get('reset') === '1') setStep(4);
    else if (searchParams.get('login') === '1') setStep(3);
    else setStep(1);
  }, [searchParams]);

  function setMessage(message, kind = 'info') {
    setStatus(message);
    setStatusKind(kind);
  }

  function toggleListField(field, value) {
    setRegisterForm((prev) => {
      const list = Array.isArray(prev[field]) ? prev[field] : [];
      const exists = list.includes(value);
      const next = exists ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [field]: next.length > 0 ? next : [value] };
    });
  }

  async function submitRegister(event) {
    event.preventDefault();
    if (!isAdultDob(registerForm.dateOfBirth)) {
      setMessage(t('auth.dobInvalid'), 'error');
      return;
    }
    if (isTurnstileEnabled() && !captchaToken) {
      setMessage(t('auth.captchaRequired'), 'error');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const payload = { ...registerForm, website, captchaToken: captchaToken || undefined, locale };
      if (!payload.referralCode) delete payload.referralCode;
      const data = await register(payload);
      if (data?.success) {
        setVerifyForm((prev) => ({ ...prev, email: registerForm.email }));
        setMessage(t('auth.registerSuccess'), 'success');
        setStep(2);
      } else {
        setMessage(translateApiError(data) || t('auth.registerFailed'), 'error');
        resetTurnstileWidget();
        setCaptchaToken('');
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitVerify(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const data = await verifyEmail(verifyForm);
      if (data?.success) {
        trackEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETED, { locale });
        setLoginForm((prev) => ({ ...prev, email: verifyForm.email }));
        setMessage(t('auth.verifySuccess'), 'success');
        setStep(3);
      } else {
        setMessage(translateApiError(data) || t('auth.verifyFailed'), 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitForgot(event) {
    event.preventDefault();
    setBusy(true);
    const data = await forgotPassword(forgotForm.email);
    setMessage(data?.message || t('auth.checkEmail'), data?.success ? 'success' : 'error');
    if (data?.success) {
      setResetForm((p) => ({ ...p, email: forgotForm.email }));
      setStep(5);
    }
    setBusy(false);
  }

  async function submitReset(event) {
    event.preventDefault();
    setBusy(true);
    const data = await resetPassword(resetForm);
    if (data?.success) {
      setMessage(t('auth.resetSuccess'), 'success');
      setLoginForm((p) => ({ ...p, email: resetForm.email }));
      setStep(3);
    } else {
      setMessage(translateApiError(data) || t('auth.resetFailed'), 'error');
    }
    setBusy(false);
  }

  async function submitLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const data = await login(loginForm);
      if (data?.success) {
        trackEvent('Login');
        onLogin(data.token, data.profile);
      } else {
        setMessage(translateApiError(data) || t('auth.loginFailed'), 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="hero auth-hero">
        <div className="auth-hero-top">
          <h1>{loginOnly && step === 3 ? t('auth.welcomeLogin') : t('auth.welcome')}</h1>
          <LanguageSwitcher variant="popover" />
        </div>
        <p className="subtitle">
          {loginOnly && step === 3 ? t('auth.subtitleLogin') : t('auth.subtitleRegister')}
        </p>
      </section>

      {!loginOnly && (
      <div className="stepper" aria-label={t('auth.subtitleRegister')}>
        {(step <= 3 ? REG_STEPS : STEPS.filter((s) => s.id >= 4)).map((item) => (
          <button
            key={item.id}
            type="button"
            className={`stepper-item ${step === item.id ? 'active' : ''} ${step > item.id ? 'done' : ''}`}
            onClick={() => setStep(item.id)}
          >
            <span className="stepper-index">{item.id}</span>
            <span>{item.title}</span>
          </button>
        ))}
      </div>
      )}

      {status && <p className={`status-banner status-${statusKind}`}>{status}</p>}

      {step === 1 && (
        <form onSubmit={submitRegister} className="card auth-card">
          <h2 className="section-title">{t('auth.createAccount')}</h2>
          {registerForm.referralCode && (
            <p className="status-banner status-info">{t('auth.referralApplied')}</p>
          )}
          <div className="form-grid">
            <label>
              {t('auth.email')}
              <input
                type="email"
                autoComplete="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </label>
            <label>
              {t('auth.password')}
              <input
                type="password"
                autoComplete="new-password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                minLength={8}
                required
              />
            </label>
            <label>
              {t('auth.displayName')}
              <input
                value={registerForm.displayName}
                onChange={(e) => setRegisterForm((p) => ({ ...p, displayName: e.target.value }))}
                required
              />
            </label>
            <div className="dob-picker-wrap">
              <span className="field-label-text">{t('auth.dateOfBirth')}</span>
              <DateOfBirthPicker
                value={registerForm.dateOfBirth}
                onChange={(dateOfBirth) => setRegisterForm((p) => ({ ...p, dateOfBirth }))}
              />
            </div>
            <label>
              {t('auth.city')}
              <input
                value={registerForm.city}
                onChange={(e) => setRegisterForm((p) => ({ ...p, city: e.target.value }))}
                required
              />
            </label>
            <label>
              {t('auth.country')}
              <CountrySelect
                value={registerForm.country}
                onChange={(country) => setRegisterForm((p) => ({ ...p, country }))}
              />
            </label>
            <label>
              {t('auth.identity')}
              <select value={registerForm.identity} onChange={(e) => setRegisterForm((p) => ({ ...p, identity: e.target.value }))}>
                {IDENTITY_KEYS.map((value) => (
                  <option key={value} value={value}>{t(`identity.${value}`)}</option>
                ))}
              </select>
            </label>
            <label>
              {t('auth.profileType')}
              <select value={registerForm.profileType} onChange={(e) => setRegisterForm((p) => ({ ...p, profileType: e.target.value }))}>
                {PROFILE_TYPE_KEYS.map((value) => (
                  <option key={value} value={value}>{t(`profileType.${value}`)}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            {t('auth.aboutOptional')}
            <textarea
              rows={3}
              maxLength={500}
              value={registerForm.bio}
              onChange={(e) => setRegisterForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder={t('auth.aboutPlaceholder')}
            />
          </label>

          <fieldset className="choice-group">
            <legend>{t('auth.seekingWho')}</legend>
            <div className="choice-row">
              {IDENTITY_KEYS.map((value) => (
                <label key={value} className="choice-chip">
                  <input
                    type="checkbox"
                    checked={registerForm.seekingIdentities.includes(value)}
                    onChange={() => toggleListField('seekingIdentities', value)}
                  />
                  {t(`identity.${value}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="choice-group">
            <legend>{t('auth.seekingType')}</legend>
            <div className="choice-row">
              {PROFILE_TYPE_KEYS.map((value) => (
                <label key={value} className="choice-chip">
                  <input
                    type="checkbox"
                    checked={registerForm.seekingProfileTypes.includes(value)}
                    onChange={() => toggleListField('seekingProfileTypes', value)}
                  />
                  {t(`profileType.${value}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="choice-group">
            <legend>{t('auth.seekingIntent')}</legend>
            <div className="choice-row">
              {INTENT_KEYS.map((value) => (
                <label key={value} className="choice-chip">
                  <input
                    type="checkbox"
                    checked={registerForm.intents.includes(value)}
                    onChange={() => toggleListField('intents', value)}
                  />
                  {t(`intent.${value}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <input type="text" className="hp-field" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} aria-hidden="true" />

          <TurnstileWidget onToken={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

          <div className="form-actions">
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? t('auth.saving') : t('auth.continueVerify')}
            </button>
          </div>
          <p className="auth-footer muted">
            {t('auth.hasAccount')}{' '}
            <Link to="/auth?login=1" onClick={() => setStep(3)}>
              {t('auth.signIn')}
            </Link>
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submitVerify} className="card auth-card">
          <h2 className="section-title">{t('auth.verifyTitle')}</h2>
          <p className="muted">{t('auth.verifyHint')}</p>
          <label>
            {t('auth.email')}
            <input
              type="email"
              value={verifyForm.email}
              onChange={(e) => setVerifyForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </label>
          <label>
            {t('auth.verifyCode')}
            <input
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={verifyForm.code}
              onChange={(e) => setVerifyForm((p) => ({ ...p, code: e.target.value }))}
              required
            />
          </label>
          <div className="form-actions row">
            <button type="button" className="button button-secondary" onClick={() => setStep(1)}>
              {t('auth.back')}
            </button>
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? t('auth.checking') : t('auth.confirmEmail')}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={submitLogin} className="card auth-card">
          <h2 className="section-title">{loginOnly ? t('auth.loginTitleOnly') : t('auth.loginTitle')}</h2>
          <label>
            {t('auth.email')}
            <input
              type="email"
              autoComplete="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </label>
          <label>
            {t('auth.password')}
            <input
              type="password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
          </label>
          <p className="auth-footer">
            <button type="button" className="button button-ghost" onClick={() => setStep(4)}>
              {t('auth.forgotPassword')}
            </button>
          </p>
          <div className="form-actions row">
            {!loginOnly && (
              <button type="button" className="button button-secondary" onClick={() => setStep(2)}>
                {t('auth.back')}
              </button>
            )}
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? t('auth.loggingIn') : t('auth.enterApp')}
            </button>
          </div>
          <p className="auth-footer muted">
            {t('auth.noAccount')} <Link to="/auth">{t('auth.register')}</Link>
          </p>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={submitForgot} className="card auth-card">
          <h2 className="section-title">{t('auth.resetTitle')}</h2>
          <p className="muted">{t('auth.resetHint')}</p>
          <label>
            {t('auth.email')}
            <input type="email" value={forgotForm.email} onChange={(e) => setForgotForm({ email: e.target.value })} required />
          </label>
          <div className="form-actions row">
            <button type="button" className="button button-secondary" onClick={() => setStep(3)}>{t('auth.back')}</button>
            <button type="submit" className="button button-primary" disabled={busy}>{busy ? t('auth.sending') : t('auth.sendCode')}</button>
          </div>
        </form>
      )}

      {step === 5 && (
        <form onSubmit={submitReset} className="card auth-card">
          <h2 className="section-title">{t('auth.newPasswordTitle')}</h2>
          <label>{t('auth.email')}<input type="email" value={resetForm.email} onChange={(e) => setResetForm((p) => ({ ...p, email: e.target.value }))} required /></label>
          <label>{t('auth.verifyCode')}<input inputMode="numeric" maxLength={6} value={resetForm.code} onChange={(e) => setResetForm((p) => ({ ...p, code: e.target.value }))} required /></label>
          <label>{t('auth.newPassword')}<input type="password" minLength={8} value={resetForm.newPassword} onChange={(e) => setResetForm((p) => ({ ...p, newPassword: e.target.value }))} required /></label>
          <div className="form-actions row">
            <button type="button" className="button button-secondary" onClick={() => setStep(4)}>{t('auth.back')}</button>
            <button type="submit" className="button button-primary" disabled={busy}>{busy ? t('auth.saving') : t('auth.savePassword')}</button>
          </div>
        </form>
      )}

      <p className="auth-footer muted">
        <Link to="/">{t('auth.backHome')}</Link>
      </p>
    </main>
  );
}
