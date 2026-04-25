import { useState } from 'react';
import { login, register, verifyEmail } from '../api/index.js';

export default function AuthPage({ onLogin }) {
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

  async function submitRegister(event) {
    event.preventDefault();
    const data = await register(registerForm);
    if (data?.success) {
      setStatus(
        `Registracija uspjesna. ${data.devVerificationCode ? `Dev code: ${data.devVerificationCode}` : 'Provjeri email code.'}`
      );
      setVerifyForm((prev) => ({ ...prev, email: registerForm.email }));
    } else {
      setStatus(data?.error || 'Registracija nije uspjela.');
    }
  }

  function toggleListField(field, value) {
    setRegisterForm((prev) => {
      const list = Array.isArray(prev[field]) ? prev[field] : [];
      const exists = list.includes(value);
      const next = exists ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [field]: next.length > 0 ? next : [value] };
    });
  }

  async function submitVerify(event) {
    event.preventDefault();
    const data = await verifyEmail(verifyForm);
    setStatus(data?.success ? 'Email verificiran.' : data?.error || 'Verifikacija nije uspjela.');
  }

  async function submitLogin(event) {
    event.preventDefault();
    const data = await login(loginForm);
    if (data?.success) {
      onLogin(data.token, data.profile);
      setStatus('Prijava uspjesna.');
    } else {
      setStatus(data?.error || 'Prijava nije uspjela.');
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <h1 style={{ marginBottom: 6 }}>Ravnopar pristup</h1>
        <p className="subtitle">Registracija, verifikacija i prijava u 3 koraka.</p>
      </section>
      <form onSubmit={submitRegister} className="card">
        <h3 className="section-title">1) Registracija</h3>
        <label>Email<input placeholder="Email" value={registerForm.email} onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))} /></label>
        <label>Password<input placeholder="Password" type="password" value={registerForm.password} onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))} /></label>
        <label>Display name<input placeholder="Display name" value={registerForm.displayName} onChange={(e) => setRegisterForm((p) => ({ ...p, displayName: e.target.value }))} /></label>
        <label>Datum rodenja (YYYY-MM-DD)<input placeholder="1998-04-20" value={registerForm.dateOfBirth} onChange={(e) => setRegisterForm((p) => ({ ...p, dateOfBirth: e.target.value }))} /></label>
        <label>Grad<input placeholder="City" value={registerForm.city} onChange={(e) => setRegisterForm((p) => ({ ...p, city: e.target.value }))} /></label>
        <label>
          Identitet
          <select value={registerForm.identity} onChange={(e) => setRegisterForm((p) => ({ ...p, identity: e.target.value }))}>
            <option value="MALE">Musko</option>
            <option value="FEMALE">Zensko</option>
            <option value="NON_BINARY">Nebinarno</option>
            <option value="OTHER">Drugo</option>
          </select>
        </label>
        <label>
          Tip profila
          <select value={registerForm.profileType} onChange={(e) => setRegisterForm((p) => ({ ...p, profileType: e.target.value }))}>
            <option value="INDIVIDUAL">Osoba</option>
            <option value="COUPLE">Par</option>
          </select>
        </label>
        <div>
          <strong>Koga trazis (identiteti)</strong>
          {['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'].map((item) => (
            <label key={item} style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <input
                type="checkbox"
                checked={registerForm.seekingIdentities.includes(item)}
                onChange={() => toggleListField('seekingIdentities', item)}
              />
              {item}
            </label>
          ))}
        </div>
        <div>
          <strong>Koga trazis (tip profila)</strong>
          {['INDIVIDUAL', 'COUPLE'].map((item) => (
            <label key={item} style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <input
                type="checkbox"
                checked={registerForm.seekingProfileTypes.includes(item)}
                onChange={() => toggleListField('seekingProfileTypes', item)}
              />
              {item}
            </label>
          ))}
        </div>
        <div>
          <strong>Namjera</strong>
          {['CHAT', 'CASUAL', 'RELATIONSHIP', 'MARRIAGE', 'ADVENTURE'].map((item) => (
            <label key={item} style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <input
                type="checkbox"
                checked={registerForm.intents.includes(item)}
                onChange={() => toggleListField('intents', item)}
              />
              {item}
            </label>
          ))}
        </div>
        <button type="submit">Registriraj</button>
      </form>

      <form onSubmit={submitVerify} className="card">
        <h3 className="section-title">2) Verifikacija emaila</h3>
        <label>Email<input placeholder="Email" value={verifyForm.email} onChange={(e) => setVerifyForm((p) => ({ ...p, email: e.target.value }))} /></label>
        <label>Kod<input placeholder="6-znamenkasti kod" value={verifyForm.code} onChange={(e) => setVerifyForm((p) => ({ ...p, code: e.target.value }))} /></label>
        <button type="submit">Verificiraj</button>
      </form>

      <form onSubmit={submitLogin} className="card">
        <h3 className="section-title">3) Prijava</h3>
        <label>Email<input placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))} /></label>
        <label>Password<input placeholder="Password" type="password" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} /></label>
        <button type="submit">Prijavi se</button>
      </form>

      {status && <p className={status.includes('uspjesna') || status.includes('verificiran') ? 'success-note' : 'warning'}>{status}</p>}
    </main>
  );
}
