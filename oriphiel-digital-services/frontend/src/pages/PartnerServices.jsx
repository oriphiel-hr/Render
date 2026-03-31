import { useState } from 'react';
import { createPartnerInquiry } from '../api/index.js';

const initialForm = {
  fullName: '',
  email: '',
  companyName: '',
  phone: '',
  serviceType: 'WEB',
  source: 'ORIPHIEL_DIRECT',
  message: '',
  website: ''
};

export default function PartnerServices({ strategySnapshot }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const onChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const data = await createPartnerInquiry({
        ...form,
        strategySnapshot
      });
      if (data?.success) {
        setStatus('Upit je uspjesno zaprimljen.');
        setForm(initialForm);
      } else {
        setStatus('Slanje nije uspjelo. Pokusaj ponovno.');
      }
    } catch (_error) {
      setStatus('Doslo je do greske. Pokusaj ponovno.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Pošalji upit</h2>
      <p>
        Ova usluga je odvojena od Uslugara i izvodi je Oriphiel d.o.o.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Ime i prezime" value={form.fullName} onChange={onChange('fullName')} required />
        <input placeholder="E-mail" value={form.email} onChange={onChange('email')} type="email" required />
        <input placeholder="Tvrtka (opcionalno)" value={form.companyName} onChange={onChange('companyName')} />
        <input placeholder="Telefon (opcionalno)" value={form.phone} onChange={onChange('phone')} />
        <select value={form.serviceType} onChange={onChange('serviceType')}>
          <option value="WEB">Web</option>
          <option value="MARKETING">Marketing</option>
          <option value="AUTOMATION">Automatizacija</option>
          <option value="OTHER">Ostalo</option>
        </select>
        <textarea
          placeholder="Ukratko opisi sto ti treba"
          value={form.message}
          onChange={onChange('message')}
          minLength={10}
          rows={5}
          required
        />
        <input
          placeholder="Website (ostavi prazno)"
          value={form.website}
          onChange={onChange('website')}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />
        <button disabled={loading} type="submit">
          {loading ? 'Saljem...' : 'Posalji upit'}
        </button>
      </form>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </main>
  );
}
