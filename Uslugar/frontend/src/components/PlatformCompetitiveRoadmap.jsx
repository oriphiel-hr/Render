import React from 'react';
import { COMPETITIVE_FOCUS_AREAS, NINETY_DAY_ROADMAP } from '@uslugar/shared';

export default function PlatformCompetitiveRoadmap() {
  return (
    <div className="space-y-6 text-left">
      <h2 className="text-2xl font-bold text-gray-900">Kamo Uslugar raste (i zašto)</h2>
      <p className="text-sm text-gray-600">
        Sljedeći koraci su „tuniranja” (trust, konverzija, brzina, zadržavanje) — snažnije od samog
        oglasa. Uz web i u aplikaciji otvoreno kazujemo kamo platforma ide, da korisnici ne misle da je
        statična.
      </p>

      {COMPETITIVE_FOCUS_AREAS.map((b) => (
        <div key={b.title} className="bg-white border border-sky-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-sky-900">
            {b.title}
            {b.mustHave ? <span className="ml-2 text-xs text-red-600 font-normal">(najutjecajnije)</span> : null}
          </h3>
          <ul className="list-disc pl-5 mt-2 text-sm text-gray-700 space-y-1.5">
            {b.bullets.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      ))}

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
        <h3 className="text-lg font-semibold text-emerald-900">{NINETY_DAY_ROADMAP.title}</h3>
        <ol className="list-decimal pl-5 mt-2 text-sm text-emerald-900 space-y-1.5">
          {NINETY_DAY_ROADMAP.phases.map((ph) => (
            <li key={ph.label}>
              <span className="font-medium">{ph.label}:</span> {ph.text}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
