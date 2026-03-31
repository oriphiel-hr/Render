import { useState } from 'react';
import {
  convertDemoToClientConfiguration,
  createClient,
  createClientConfiguration,
  duplicateClientConfiguration,
  listClientConfigurations,
  listClients,
  updateClientConfiguration
} from '../api/index.js';

export default function AdminClientConfigurations() {
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [status, setStatus] = useState('');
  const [newClient, setNewClient] = useState({ name: '', email: '', companyName: '', phone: '' });
  const [newConfigTitle, setNewConfigTitle] = useState('Konfiguracija');
  const [demoInquiryId, setDemoInquiryId] = useState('');

  async function loadClients() {
    setStatus('');
    const data = await listClients(apiKey, query);
    if (!data?.success) {
      setStatus('Neuspjelo ucitavanje klijenata.');
      return;
    }
    setClients(data.items || []);
  }

  async function selectClient(client) {
    setSelectedClient(client);
    const data = await listClientConfigurations(apiKey, client.id);
    if (!data?.success) {
      setStatus('Neuspjelo ucitavanje konfiguracija.');
      return;
    }
    setConfigs(data.items || []);
  }

  async function submitNewClient() {
    const data = await createClient(apiKey, newClient);
    if (!data?.success) {
      setStatus('Kreiranje klijenta nije uspjelo.');
      return;
    }
    setStatus('Klijent je kreiran.');
    setNewClient({ name: '', email: '', companyName: '', phone: '' });
    await loadClients();
  }

  async function addConfiguration() {
    if (!selectedClient) return;
    const data = await createClientConfiguration(apiKey, selectedClient.id, {
      title: newConfigTitle,
      status: 'DRAFT',
      strategySnapshot: {}
    });
    if (!data?.success) {
      setStatus('Kreiranje konfiguracije nije uspjelo.');
      return;
    }
    await selectClient(selectedClient);
    setStatus('Nova konfiguracija dodana.');
  }

  async function markAsOffered(configId) {
    const data = await updateClientConfiguration(apiKey, configId, { status: 'OFFERED' });
    if (!data?.success) {
      setStatus('Promjena statusa nije uspjela.');
      return;
    }
    if (selectedClient) await selectClient(selectedClient);
  }

  async function duplicateConfig(configId) {
    const data = await duplicateClientConfiguration(apiKey, configId);
    if (!data?.success) {
      setStatus('Dupliciranje nije uspjelo.');
      return;
    }
    if (selectedClient) await selectClient(selectedClient);
  }

  async function convertDemo() {
    const data = await convertDemoToClientConfiguration(apiKey, demoInquiryId);
    if (!data?.success) {
      setStatus('Pretvorba demo upita nije uspjela.');
      return;
    }
    setStatus(`Demo je pretvoren u konfiguraciju za klijenta: ${data.client?.email || '-'}.`);
    if (data.client?.id) {
      await selectClient(data.client);
    }
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 24 }}>
      <h2 style={{ marginTop: 0 }}>Admin - Klijenti i konfiguracije</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        <input
          type="password"
          placeholder="Admin API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Pretraga klijenta" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="button" onClick={loadClients} disabled={!apiKey}>
            Ucitaj klijente
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <strong>Novi klijent</strong>
        <input
          placeholder="Ime"
          value={newClient.name}
          onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
        />
        <input
          placeholder="E-mail"
          value={newClient.email}
          onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
        />
        <input
          placeholder="Tvrtka"
          value={newClient.companyName}
          onChange={(e) => setNewClient((p) => ({ ...p, companyName: e.target.value }))}
        />
        <input
          placeholder="Telefon"
          value={newClient.phone}
          onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
        />
        <button type="button" onClick={submitNewClient} disabled={!apiKey || !newClient.name || !newClient.email}>
          Kreiraj klijenta
        </button>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <strong>Pretvori demo upit u klijenta + konfiguraciju</strong>
        <input
          placeholder="Demo inquiry ID"
          value={demoInquiryId}
          onChange={(e) => setDemoInquiryId(e.target.value)}
        />
        <button type="button" onClick={convertDemo} disabled={!apiKey || !demoInquiryId}>
          Pretvori demo u ponudu
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Klijenti</strong>
        <ul>
          {clients.map((client) => (
            <li key={client.id}>
              <button type="button" onClick={() => selectClient(client)}>
                {client.name} ({client.email})
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedClient && (
        <div style={{ marginTop: 12 }}>
          <strong>Konfiguracije za: {selectedClient.name}</strong>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input value={newConfigTitle} onChange={(e) => setNewConfigTitle(e.target.value)} />
            <button type="button" onClick={addConfiguration}>
              Dodaj konfiguraciju
            </button>
          </div>
          <ul>
            {configs.map((cfg) => (
              <li key={cfg.id}>
                v{cfg.version} - {cfg.title} - {cfg.status}{' '}
                <button type="button" onClick={() => markAsOffered(cfg.id)}>
                  Oznaci OFFERED
                </button>{' '}
                <button type="button" onClick={() => duplicateConfig(cfg.id)}>
                  Dupliciraj
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status && <p>{status}</p>}
    </section>
  );
}
