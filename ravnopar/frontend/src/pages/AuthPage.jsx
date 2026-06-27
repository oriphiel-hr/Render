import { useState } from 'react';
import { Link } from 'react-router-dom';
import { login, register, verifyEmail } from '../api/index.js';
import { IDENTITY_LABELS, INTENT_LABELS, PROFILE_TYPE_LABELS } from '../lib/labels.js';

const STEPS = [
  { id: 1, title: 'Račun' },
  { id: 2, title: 'Verifikacija' },
  { id: 3, title: 'Prijava' }
];

export default function AuthPage({ onLogin }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    displayName: '',
    dateOfBirth: '',
    city: '',
    identity: 'OTHER',
    profileType: 'INDIVIDUAL',
    seekingIdentities: ['FEMALE'],
    seekingProfileTypes: ['INDIVIDUAL'],
    intents: ['RELATIONSHIP']
  });
  const [verifyForm, setVerifyForm] = useState({ email: '', code: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
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
    setBusy(true);
    setMessage('');
    try {
      const data = await register(registerForm);
      if (data?.success) {
        setVerifyForm((prev) => ({ ...prev, email: registerForm.email }));
        setMessage('Račun je kreiran. Unesi verifikacijski kod koji si primio/la.', 'success');
        setStep(2);
      } else {
        setMessage(data?.error || 'Registracija nije uspjela. Provjeri podatke i pokušaj ponovo.', 'error');
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

  async function submitLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const data = await login(loginForm);
      if (data?.success) {
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
        {STEPS.map((item) => (
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

      <p className="auth-footer muted">
        <Link to="/">← Natrag na početnu</Link>
      </p>
    </main>
  );
}
