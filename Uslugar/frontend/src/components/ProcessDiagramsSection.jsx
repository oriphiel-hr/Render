// Povezani procesi - Mermaid dijagrami
import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid/dist/mermaid.min.js';

function getMermaidConfig(isDark) {
  return {
    startOnLoad: false,
    theme: isDark ? 'dark' : 'base',
    themeVariables: isDark
      ? {
          primaryColor: '#374151',
          primaryTextColor: '#E5E7EB',
          primaryBorderColor: '#4B5563',
          lineColor: '#6B7280',
          secondaryColor: '#1F2937',
          tertiaryColor: '#111827'
        }
      : {
          primaryColor: '#E5E7EB',
          primaryTextColor: '#1F2937',
          primaryBorderColor: '#9CA3AF',
          lineColor: '#6B7280',
          secondaryColor: '#F3F4F6',
          tertiaryColor: '#FFFFFF'
        },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis'
    }
  };
}

const PROCESS_DIAGRAMS = {
  verificacija: {
    title: 'Proces Verifikacije i Licenciranja',
    mermaid: `flowchart TD
    V1[Pružatelj] --> V2[KYC Upload dokumenata]
    V2 --> V3[Admin provjera]
    V3 --> V4{Odobreno?}
    V4 -->|Da| V5[Verificiran - Badge Safety]
    V4 -->|Ne| V6[Odbijeno - Upload ponovo]
    V6 --> V2`
  },
  pretplata: {
    title: 'Proces pretplate',
    mermaid: `flowchart TD
    P1[Registracija] --> P2[TRIAL paket]
    P2 --> P3{Upgrade?}
    P3 -->|BASIC| P4[BASIC plan]
    P3 -->|PREMIUM| P5[PREMIUM - 50 kredita]
    P3 -->|PRO| P6[PRO - sve funkcije]
    P3 -->|Ne| P7[Nema pretplate]`
  },
  queue: {
    title: 'Sustav reda čekanja za distribuciju leadova',
    mermaid: `flowchart TD
    Q1[Lead kreiran] --> Q2[LeadQueue - WAITING]
    Q2 --> Q3[Queue Scheduler]
    Q3 --> Q4[Partner Score izračun]
    Q4 --> Q5[Lead ponuđen pružatelju]
    Q5 --> Q6{Odgovor?}
    Q6 -->|Da| Q7[ACCEPTED - Lead kupljen]
    Q6 -->|Ne| Q8[DECLINED - Sljedeći u redu]`
  },
  lead: {
    title: 'Sustav leadova (bodovanje kvalitete)',
    mermaid: `flowchart TD
    L1[Korisnik objavljuje posao] --> L2[Posao = Ekskluzivni Lead]
    L2 --> L3[Quality Score, Trust Score, cijena]
    L3 --> L4[Lead na tržištu - AVAILABLE]
    L4 --> L5{Kupovina?}
    L5 -->|Da| L6[Pružatelj kupuje - krediti/Stripe]
    L6 --> L7[Kontakt otkriven, ROI Dashboard]
    L5 -->|Ne| L8[Ostaje na tržištu]`
  },
  notifikacije: {
    title: 'Notifikacije i Komunikacija',
    mermaid: `flowchart TD
    N1[Event se dogodio] --> N2[Notifikacijski sustav]
    N2 --> N3[Routing prema korisniku]
    N3 --> N4[Multi-channel slanje]
    N4 --> N5[Email]
    N4 --> N6[SMS Twilio]
    N4 --> N7[In-App]
    N4 --> N8[Chat poruke]`
  },
  refund: {
    title: 'Sustav povrata',
    mermaid: `flowchart TD
    R1[Korisnik podnese zahtjev] --> R2[Zahtjev u sustavu]
    R2 --> R3[Provjera uslova]
    R3 --> R4{Isplativ?}
    R4 -->|Da| R5[Admin provjera]
    R4 -->|Ne| R6[Odbijeno]
    R5 --> R7{Odobreno?}
    R7 -->|Da| R8[Refund odobren - povrat sredstava]
    R7 -->|Ne| R9[Refund odbijen]`
  },
  reputacija: {
    title: 'Reputacijski Sustav / Recenzije',
    mermaid: `flowchart TD
    REP1[Završen posao] --> REP2[Korisnik ostavi ocjenu]
    REP2 --> REP3[1-5 zvjezdica + komentar]
    REP3 --> REP4[Recenzija spremljena]
    REP4 --> REP5[Trust Score izračun]
    REP5 --> REP6[Prosjek ocjena]
    REP5 --> REP7[Broj recenzija]
    REP6 --> REP8[Badge / Profil pružatelja]
    REP7 --> REP8`
  }
};

function ProcessDiagramItem({ id, title, mermaidCode, isExpanded, onToggle, isDarkMode }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!isExpanded || !containerRef.current) {
      setSvg('');
      setErr(null);
      return;
    }
    setErr(null);
    mermaid.initialize(getMermaidConfig(isDarkMode));
    const diagramId = `process-${id}-${Date.now()}`;
    mermaid
      .render(diagramId, mermaidCode)
      .then(({ svg: result }) => setSvg(result))
      .catch((e) => {
        console.error('Process diagram error:', e);
        setErr('Dijagram se nije mogao prikazati.');
      });
  }, [isExpanded, mermaidCode, id, isDarkMode]);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between"
      >
        {title}
        <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div ref={containerRef} className="overflow-x-auto">
            {err ? (
              <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
            ) : svg ? (
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
              <p className="text-sm text-gray-500">Učitavanje...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProcessDiagramsSection({ isDarkMode }) {
  const [expandedProcess, setExpandedProcess] = useState(null);

  return (
    <div className="space-y-1">
      {Object.entries(PROCESS_DIAGRAMS).map(([key, { title, mermaid: mermaidCode }]) => (
        <ProcessDiagramItem
          key={key}
          id={key}
          title={title}
          mermaidCode={mermaidCode}
          isExpanded={expandedProcess === key}
          onToggle={() => setExpandedProcess((p) => (p === key ? null : key))}
          isDarkMode={!!isDarkMode}
        />
      ))}
    </div>
  );
}
