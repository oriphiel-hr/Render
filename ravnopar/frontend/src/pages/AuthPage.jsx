import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { forgotPassword, login, register, resetPassword, verifyEmail } from '../api/index.js';
import { IDENTITY_LABELS, INTENT_LABELS, PROFILE_TYPE_LABELS } from '../lib/labels.js';
import TurnstileWidget, { isTurnstileEnabled, resetTurnstileWidget } from '../components/TurnstileWidget.jsx';
import { trackEvent } from '../lib/analytics.js';

const REG_STEPS = [
  { id: 1, title: 'Račun' },
  { id: 2, title: 'Verifikacija' },
  { id: 3, title: 'Prijava' }
];

const STEPS = [
  ...REG_STEPS,
  { id: 4, title: 'Reset' },
  { id: 5, title: 'Nova lozinka' }
];

export default function AuthPage({ onLogin }) {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(() => (searchParams.get('reset') === '1' ? 4 : 1));
  const [busy, setBusy] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    displayName: '',
    dateOfBirth: '',
    city: '',
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
    if (isTurnstileEnabled() && !captchaToken) {
      setMessage('Potvrdi captchu prije registracije.', 'error');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const payload = { ...registerForm, website, captchaToken: captchaToken || undefined };
      if (!payload.referralCode) delete payload.referralCode;
      const data = await register(payload);
      if (data?.success) {
        trackEvent('Register');
        setVerifyForm((prev) => ({ ...prev, email: registerForm.email }));
        setMessage('Račun je kreiran. Unesi verifikacijski kod koji si primio/la.', 'success');
        setStep(2);
      } else {
        setMessage(data?.error || 'Registracija nije uspjela. Provjeri podatke i pokušaj ponovo.', 'error');
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
        setLoginForm((prev) => ({ ...prev, email: verifyForm.email }));
        setMessage('Email je potvrđen. Sada se možeš prijaviti.', 'success');
        setStep(3);
      } else {
        setMessage(data?.error || 'Verifikacija nije uspjela. Provjeri kod i pokušaj ponovo.', 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitForgot(event) {
    event.preventDefault();
    setBusy(true);
    const data = await forgotPassword(forgotForm.email);
    setMessage(data?.message || 'Provjeri email.', data?.success ? 'success' : 'error');
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
      setMessage('Lozinka promijenjena. Prijavi se.', 'success');
      setLoginForm((p) => ({ ...p, email: resetForm.email }));
      setStep(3);
    } else {
      setMessage(data?.error || 'Reset nije uspio.', 'error');
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
        setMessage(data?.error || 'Prijava nije uspjela. Provjeri email i lozinku.', 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="hero auth-hero">
        <h1>Dobrodošao/la u Ravnopar</h1>
        <p className="subtitle">Tri jednostavna koraka do tvog profila.</p>
      </section>

      <div className="stepper" aria-label="Koraci registracije">
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

      {status && <p className={`status-banner status-${statusKind}`}>{status}</p>}

      {step === 1 && (
        <form onSubmit={submitRegister} className="card auth-card">
          <h2 className="section-title">1. Kreiraj račun</h2>
          {registerForm.referralCode && (
            <p className="status-banner status-info">Pozivnica primijenjena — hvala što si došao/la preko prijatelja.</p>
          )}
          <div className="form-grid">
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </label>
            <label>
              Lozinka
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
              Ime za prikaz
              <input
                value={registerForm.displayName}
                onChange={(e) => setRegisterForm((p) => ({ ...p, displayName: e.target.value }))}
                required
              />
            </label>
            <label>
              Datum rođenja
              <input
                type="date"
                value={registerForm.dateOfBirth}
                onChange={(e) => setRegisterForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                required
              />
            </label>
            <label>
              Grad
              <input
                value={registerForm.city}
                onChange={(e) => setRegisterForm((p) => ({ ...p, city: e.target.value }))}
                required
              />
            </label>
            <label>
              Tvoj identitet
              <select value={registerForm.identity} onChange={(e) => setRegisterForm((p) => ({ ...p, identity: e.target.value }))}>
                {Object.entries(IDENTITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              Tip profila
              <select value={registerForm.profileType} onChange={(e) => setRegisterForm((p) => ({ ...p, profileType: e.target.value }))}>
                {Object.entries(PROFILE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            O meni (opcionalno)
            <textarea
              rows={3}
              maxLength={500}
              value={registerForm.bio}
              onChange={(e) => setRegisterForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Kratko se predstavi..."
            />
          </label>

          <fieldset className="choice-group">
            <legend>Koga tražiš</legend>
            <div className="choice-row">
              {Object.entries(IDENTITY_LABELS).map(([value, label]) => (
                <label key={value} className="choice-chip">
                  <input
                    type="checkbox"
                    checked={registerForm.seekingIdentities.includes(value)}
                    onChange={() => toggleListField('seekingIdentities', value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="choice-group">
            <legend>Tip profila koji tražiš</legend>
            <div className="choice-row">
              {Object.entries(PROFILE_TYPE_LABELS).map(([value, label]) => (
                <label key={value} className="choice-chip">
                  <input
                    type="checkbox"
                    checked={registerForm.seekingProfileTypes.includes(value)}
                    onChange={() => toggleListField('seekingProfileTypes', value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="choice-group">
            <legend>Što tražiš</legend>
            <div className="choice-row">
              {Object.entries(INTENT_LABELS).map(([value, label]) => (
                <label key={value} className="choice-chip">
                  <input
                    type="checkbox"
                    checked={registerForm.intents.includes(value)}
                    onChange={() => toggleListField('intents', value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <input type="text" className="hp-field" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} aria-hidden="true" />

          <TurnstileWidget onToken={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

          <div className="form-actions">
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? 'Spremanje...' : 'Nastavi na verifikaciju'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submitVerify} className="card auth-card">
          <h2 className="section-title">2. Potvrdi email</h2>
          <p className="muted">Unesi 6-znamenkasti kod koji si primio/la na email.</p>
          <label>
            Email
            <input
              type="email"
              value={verifyForm.email}
              onChange={(e) => setVerifyForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Verifikacijski kod
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
              Natrag
            </button>
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? 'Provjera...' : 'Potvrdi email'}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={submitLogin} className="card auth-card">
          <h2 className="section-title">3. Prijavi se</h2>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Lozinka
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
              Zaboravljena lozinka?
            </button>
          </p>
          <div className="form-actions row">
            <button type="button" className="button button-secondary" onClick={() => setStep(2)}>
              Natrag
            </button>
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? 'Prijava...' : 'Uđi u Ravnopar'}
            </button>
          </div>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={submitForgot} className="card auth-card">
          <h2 className="section-title">Reset lozinke</h2>
          <p className="muted">Poslat ćemo kod na email ako račun postoji.</p>
          <label>
            Email
            <input type="email" value={forgotForm.email} onChange={(e) => setForgotForm({ email: e.target.value })} required />
          </label>
          <div className="form-actions row">
            <button type="button" className="button button-secondary" onClick={() => setStep(3)}>Natrag</button>
            <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Slanje...' : 'Pošalji kod'}</button>
          </div>
        </form>
      )}

      {step === 5 && (
        <form onSubmit={submitReset} className="card auth-card">
          <h2 className="section-title">Nova lozinka</h2>
          <label>Email<input type="email" value={resetForm.email} onChange={(e) => setResetForm((p) => ({ ...p, email: e.target.value }))} required /></label>
          <label>Kod<input inputMode="numeric" maxLength={6} value={resetForm.code} onChange={(e) => setResetForm((p) => ({ ...p, code: e.target.value }))} required /></label>
          <label>Nova lozinka<input type="password" minLength={8} value={resetForm.newPassword} onChange={(e) => setResetForm((p) => ({ ...p, newPassword: e.target.value }))} required /></label>
          <div className="form-actions row">
            <button type="button" className="button button-secondary" onClick={() => setStep(4)}>Natrag</button>
            <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Spremanje...' : 'Spremi lozinku'}</button>
          </div>
        </form>
      )}

      <p className="auth-footer muted">
        <Link to="/">← Natrag na početnu</Link>
      </p>
    </main>
  );
}
