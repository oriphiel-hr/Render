import { useEffect, useMemo, useState } from 'react';
import { createDemoConfiguration, fetchTechnologyCatalog } from '../api/index.js';

const PHASES = [
  {
    id: 'P0_DEMO',
    title: 'Faza 0 - Demo',
    description: 'Konfigurabilni demo koji prikazuje sto klijent dobiva i zasto je predlozena ta strategija.'
  },
  {
    id: 'P1_DISCOVERY',
    title: 'Faza 1 - Discovery i strategija',
    description: 'Business ciljevi, publike, konkurencija, inicijalni media i poruke.'
  },
  {
    id: 'P2_TRACKING',
    title: 'Faza 2 - Tracking i struktura',
    description: 'Mjerenje konverzija, eventi, naming standardi i struktura kampanja.'
  },
  {
    id: 'P3_LAUNCH',
    title: 'Faza 3 - Inicijalne kampanje',
    description: 'Launch search/performance kampanja, test oglasa i inicijalna kontrola kvalitete.'
  },
  {
    id: 'P4_MANAGEMENT',
    title: 'Faza 4 - Mjesecno upravljanje',
    description: 'Kontinuirana optimizacija, budzet alokacija i iteracije oglasa/landinga.'
  },
  {
    id: 'P5_REPORTING',
    title: 'Faza 5 - KPI reporting i Q&A',
    description: 'Mjesecni KPI report, preporuke optimizacije i 1 sastanak s klijentom.'
  },
  {
    id: 'P6_CREATIVE',
    title: 'Faza 6 - Katalozi i letci',
    description: 'Prezentacijski ili detaljni katalog te letci (bez tiska).'
  }
];

const TRACKS = {
  STARTER: {
    label: 'Starter',
    phaseIds: ['P0_DEMO', 'P1_DISCOVERY', 'P2_TRACKING', 'P3_LAUNCH']
  },
  GROWTH: {
    label: 'Growth',
    phaseIds: ['P0_DEMO', 'P1_DISCOVERY', 'P2_TRACKING', 'P3_LAUNCH', 'P4_MANAGEMENT', 'P5_REPORTING']
  },
  PREMIUM: {
    label: 'Premium',
    phaseIds: ['P0_DEMO', 'P1_DISCOVERY', 'P2_TRACKING', 'P3_LAUNCH', 'P4_MANAGEMENT', 'P5_REPORTING', 'P6_CREATIVE']
  }
};

const NEED_OPTIONS = ['Leads', 'Pozivi', 'Online prodaja', 'Vidljivost', 'Katalog/letak'];

const BASE_COSTS = {
  STARTER: { setup: 1200, monthlyOps: 350 },
  GROWTH: { setup: 2200, monthlyOps: 700 },
  PREMIUM: { setup: 3800, monthlyOps: 1300 }
};

function buildQuestionsAnswers(demoConfig) {
  const qa = [];
  qa.push({
    q: 'Zasto je predlozena ova struktura kampanja?',
    a: `Zato sto je cilj "${demoConfig.goalFocus}" i djelatnost "${demoConfig.industry}", pa prioritet dajemo kanalima s najbrzim signalom kvalitete.`
  });

  if (demoConfig.clientProfile === 'DEMANDING') {
    qa.push({
      q: 'Kako dokazujete da optimizacija stvarno radi?',
      a: 'Svaki mjesec usporedjujemo KPI trendove (CPL/CPA, konverzije, kvalitetu leadova) i dokumentiramo promjene po sprintovima.'
    });
  }

  if (demoConfig.needs.includes('Katalog/letak')) {
    qa.push({
      q: 'Kako su katalog i oglasi povezani?',
      a: 'Kreative iz kataloga/letka uskladjujemo s porukama oglasa kako bi korisnik imao konzistentan put od oglasa do upita.'
    });
  }

  if (demoConfig.riskTolerance === 'LOW') {
    qa.push({
      q: 'Mozemo li ici postepeno i smanjiti rizik?',
      a: 'Da. Krecemo s manjim brojem kampanja, jasnim test periodom i stop-loss pravilima za slabije ad grupe.'
    });
  }

  qa.push({
    q: 'Kada mozemo ocekivati prve konkretne rezultate?',
    a: 'Prve signale obicno vidimo kroz 2-4 tjedna, a stabilniji rezultat i prediktivnije optimizacije kroz 6-8 tjedana.'
  });

  qa.push({
    q: 'Zasto ne mozete garantirati tocno X leadova mjesecno?',
    a: 'Digitalni kanali ovise o trzistu, sezonalnosti i konkurenciji. Garantiramo proces optimizacije i transparentno pracenje KPI-ja, ne nerealne fiksne brojke.'
  });
  qa.push({
    q: 'Sto ako nakon 30 dana rezultati nisu dobri?',
    a: 'Tada radimo root-cause analizu: publika, poruka, landing, tracking i ponuda. Slijedi korektivni sprint s jasnim hipotezama.'
  });
  qa.push({
    q: 'Zasto je trošak razvoja/odrzavanja potreban i kad je tehnologija open-source?',
    a: 'Licenca moze biti besplatna, ali implementacija, sigurnost, monitoring, deployment i odrzavanje su operativni troskovi.'
  });
  qa.push({
    q: 'Kako kontroliramo rizik lock-ina i ovisnosti o jednoj platformi?',
    a: 'Koristimo standardne stackove, dokumentiran codebase, exportabilne podatke i jasne procedure prijenosa znanja.'
  });
  qa.push({
    q: 'Tko je odgovoran ako tracking brojke ne stima s prodajom?',
    a: 'Dogovaramo governance model: sto je izvor istine, kako mapiramo konverzije i kako redovno uskladjujemo analitiku sa stvarnim prodajnim ishodima.'
  });

  return qa;
}

export default function OfferPhasesPlanner({ onSnapshotChange }) {
  const [industry, setIndustry] = useState('Usluge');
  const [goalFocus, setGoalFocus] = useState('Leads');
  const [clientProfile, setClientProfile] = useState('UNSURE');
  const [riskTolerance, setRiskTolerance] = useState('LOW');
  const [needs, setNeeds] = useState(['Leads']);
  const [contact, setContact] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
    message: 'Zelim demo i preporuku strategije prema odabranoj konfiguraciji.'
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [techCatalog, setTechCatalog] = useState([]);
  const [techScenarios, setTechScenarios] = useState([]);
  const [selectedTechIds, setSelectedTechIds] = useState(['react', 'nodejs', 'postgres', 'ga4', 'google-ads']);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);

  const recommendedTrack = useMemo(() => {
    if (clientProfile === 'DEMANDING' || needs.includes('Katalog/letak')) {
      return 'PREMIUM';
    }
    if (needs.includes('Online prodaja') || riskTolerance === 'HIGH') {
      return 'GROWTH';
    }
    return 'STARTER';
  }, [clientProfile, needs, riskTolerance]);

  const includedPhaseIds = TRACKS[recommendedTrack].phaseIds;
  const includedPhases = PHASES.filter((p) => includedPhaseIds.includes(p.id));
  const predictedQA = useMemo(
    () =>
      buildQuestionsAnswers({
        industry,
        goalFocus,
        clientProfile,
        riskTolerance,
        needs
      }),
    [industry, goalFocus, clientProfile, riskTolerance, needs]
  );

  const snapshot = useMemo(
    () => ({
      demoVersion: 'v1',
      industry,
      goalFocus,
      clientProfile,
      riskTolerance,
      needs,
      recommendedTrack,
      phases: includedPhases.map((p) => ({ id: p.id, title: p.title })),
      predictedQA,
      selectedScenarioId,
      technologySnapshot: buildTechnologySnapshot(techCatalog, selectedTechIds, recommendedTrack)
    }),
    [industry, goalFocus, clientProfile, riskTolerance, needs, recommendedTrack, includedPhases, predictedQA, selectedScenarioId, techCatalog, selectedTechIds]
  );

  useEffect(() => {
    if (onSnapshotChange) {
      onSnapshotChange(snapshot);
    }
  }, [onSnapshotChange, snapshot]);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await fetchTechnologyCatalog();
        if (data?.success) {
          setTechCatalog(data.items || []);
          setTechScenarios(data.scenarios || []);
        }
      } catch (_error) {
        setTechCatalog([]);
        setTechScenarios([]);
      }
    }
    loadCatalog();
  }, []);

  function toggleNeed(value) {
    setNeeds((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) return prev;
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  }

  async function submitDemo() {
    setSending(true);
    setSubmitStatus('');
    try {
      const data = await createDemoConfiguration({
        ...contact,
        source: 'ORIPHIEL_DIRECT',
        strategySnapshot: { offerSnapshot: snapshot },
        website: ''
      });
      if (data?.success) {
        setSubmitStatus('Demo konfiguracija je poslana. Javit cemo se uskoro.');
      } else {
        setSubmitStatus('Slanje demo konfiguracije nije uspjelo.');
      }
    } catch (_error) {
      setSubmitStatus('Doslo je do greske pri slanju demo konfiguracije.');
    } finally {
      setSending(false);
    }
  }

  function toggleTechnology(id) {
    setSelectedTechIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  }

  const techSnapshot = useMemo(
    () => buildTechnologySnapshot(techCatalog, selectedTechIds, recommendedTrack),
    [techCatalog, selectedTechIds, recommendedTrack]
  );

  function applyScenario(scenario) {
    setSelectedScenarioId(scenario.id);
    setIndustry(scenario.industry || industry);
    setSelectedTechIds(scenario.defaultTechIds || []);

    if (scenario.recommendedTrack === 'PREMIUM') {
      setClientProfile('DEMANDING');
      setRiskTolerance('MEDIUM');
      setNeeds(['Leads', 'Online prodaja', 'Katalog/letak']);
      setGoalFocus('Online prodaja');
      return;
    }

    if (scenario.recommendedTrack === 'GROWTH') {
      setClientProfile('UNSURE');
      setRiskTolerance('HIGH');
      setNeeds(['Leads', 'Online prodaja']);
      setGoalFocus('Leads');
      return;
    }

    setClientProfile('UNSURE');
    setRiskTolerance('LOW');
    setNeeds(['Leads', 'Pozivi']);
    setGoalFocus('Leads');
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 24 }}>
      <h2 style={{ marginTop: 0 }}>Plan svih faza + demo</h2>
      <p style={{ marginTop: 0 }}>
        Za klijente koji nisu sigurni sto trebaju i za zahtjevne klijente koji zele detaljna objasnjenja.
      </p>

      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        <label>
          Djelatnost
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </label>
        <label>
          Primarni fokus
          <select value={goalFocus} onChange={(e) => setGoalFocus(e.target.value)}>
            <option>Leads</option>
            <option>Pozivi</option>
            <option>Online prodaja</option>
            <option>Vidljivost</option>
          </select>
        </label>
        <label>
          Tip klijenta
          <select value={clientProfile} onChange={(e) => setClientProfile(e.target.value)}>
            <option value="UNSURE">Ne zna sto zeli (treba usporedbe)</option>
            <option value="DEMANDING">Zahtjevan (puno pitanja)</option>
          </select>
        </label>
        <label>
          Tolerancija rizika
          <select value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)}>
            <option value="LOW">Niska (postepeno)</option>
            <option value="MEDIUM">Srednja</option>
            <option value="HIGH">Visa (brzi testovi)</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Potrebe koje klijent usporedjuje</strong>
        <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
          {NEED_OPTIONS.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={needs.includes(item)}
                onChange={() => toggleNeed(item)}
                style={{ marginRight: 8 }}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Preporuceni paket: {TRACKS[recommendedTrack].label}</strong>
        <ul>
          {includedPhases.map((phase) => (
            <li key={phase.id}>
              <strong>{phase.title}</strong> - {phase.description}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <strong>AI predikcija pitanja i odgovora (prema demou)</strong>
        <ul>
          {predictedQA.map((item) => (
            <li key={item.q}>
              <strong>P:</strong> {item.q}
              <br />
              <strong>O:</strong> {item.a}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
        <strong>Tehnologije + troškovnik kalkulator</strong>
        <p style={{ marginTop: 6 }}>
          Podaci su mapirani po tehnologijama i imaju izvorne linkove prema sluzbenim stranicama.
        </p>
        <div style={{ marginBottom: 10 }}>
          <strong>Scenariji po djelatnostima (1 klik)</strong>
          <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
            {techScenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => applyScenario(scenario)}
                style={{ textAlign: 'left' }}
              >
                {scenario.label} ({scenario.recommendedTrack}) - {scenario.notes}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
          {techCatalog.map((tech) => (
            <label key={tech.id}>
              <input
                type="checkbox"
                checked={selectedTechIds.includes(tech.id)}
                onChange={() => toggleTechnology(tech.id)}
                style={{ marginRight: 8 }}
              />
              {tech.name} ({tech.category}) - <a href={tech.sourceUrl} target="_blank" rel="noreferrer">izvor</a>
              {' '}| status izvora: {tech.sourceOk === null ? 'nije provjereno' : tech.sourceOk ? 'OK' : 'greska'}
              {' '}| HTTP: {tech.sourceHttpStatus ?? '-'}
              {' '}| lastVerifiedAt: {tech.lastVerifiedAt || '-'}
            </label>
          ))}
        </div>
        <ul>
          <li>Procjena setup troska: {techSnapshot.costEstimate.setupEur} EUR</li>
          <li>Procjena mjesecnog operativnog troska: {techSnapshot.costEstimate.monthlyOpsEur} EUR</li>
          <li>Procjena mjesecnog toolinga/licenci: {techSnapshot.costEstimate.toolingEur} EUR</li>
          <li>Ukupno mjesecno (ops + tooling): {techSnapshot.costEstimate.totalMonthlyEur} EUR</li>
        </ul>
      </div>

      <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'grid', gap: 8 }}>
        <strong>Posalji demo konfiguraciju</strong>
        <input
          placeholder="Ime i prezime"
          value={contact.fullName}
          onChange={(e) => setContact((p) => ({ ...p, fullName: e.target.value }))}
        />
        <input
          placeholder="E-mail"
          type="email"
          value={contact.email}
          onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
        />
        <input
          placeholder="Tvrtka (opcionalno)"
          value={contact.companyName}
          onChange={(e) => setContact((p) => ({ ...p, companyName: e.target.value }))}
        />
        <input
          placeholder="Telefon (opcionalno)"
          value={contact.phone}
          onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
        />
        <textarea
          rows={3}
          value={contact.message}
          onChange={(e) => setContact((p) => ({ ...p, message: e.target.value }))}
        />
        <button type="button" onClick={submitDemo} disabled={sending || !contact.fullName || !contact.email}>
          {sending ? 'Saljem demo...' : 'Posalji demo konfiguraciju'}
        </button>
        {submitStatus && <p style={{ margin: 0 }}>{submitStatus}</p>}
      </div>
    </section>
  );
}

function buildTechnologySnapshot(catalog, selectedIds, recommendedTrack) {
  const selected = catalog.filter((item) => selectedIds.includes(item.id));
  const base = BASE_COSTS[recommendedTrack] || BASE_COSTS.STARTER;
  const toolingEur = selected.reduce((sum, item) => sum + (item.indicativeMonthlyEur || 0), 0);

  const complexityMultiplier = selected.length >= 6 ? 1.25 : selected.length >= 4 ? 1.12 : 1;
  const setupEur = Math.round(base.setup * complexityMultiplier);
  const monthlyOpsEur = Math.round(base.monthlyOps * complexityMultiplier);

  return {
    selectedTechnologies: selected.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      sourceUrl: item.sourceUrl,
      pricingModel: item.pricingModel
    })),
    assumptions: [
      'Ad spend nije ukljucen u operativni trosak.',
      'Procjena je indikativna i potvrduje se nakon discovery radionice.',
      'Vece integracije i migracije podataka nisu ukljucene.'
    ],
    costEstimate: {
      setupEur,
      monthlyOpsEur,
      toolingEur,
      totalMonthlyEur: monthlyOpsEur + toolingEur
    }
  };
}
