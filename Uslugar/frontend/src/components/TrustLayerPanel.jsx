import React, { useMemo } from 'react';
import { getProviderTrustLayer, describeTrustSlaSort } from '@uslugar/shared';

export default function TrustLayerPanel({ profile, user, className = '' }) {
  const layer = useMemo(
    () => (profile ? getProviderTrustLayer(profile, user) : null),
    [profile, user]
  );

  if (!layer) return null;

  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50/80 p-4 ${className}`}>
      <h3 className="text-base font-semibold text-slate-900">Što je jasno provjereno (Uslugar)</h3>
      <p className="text-sm text-slate-800 font-medium mt-1">{layer.headline}</p>
      <p className="text-sm text-slate-600 mt-1">{layer.subline}</p>
      <p className="text-xs text-slate-500 mt-2" title={describeTrustSlaSort()}>
        {layer.verifiedCount} od {layer.totalChecks} signala trenutno ispunjeno · u tražilici: sort „Povjerenje + SLA”
        kombinira ocjenu, ETA i brzinu odgovora (vidi tooltip).
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {layer.items.map((row) => (
          <li
            key={row.id}
            className="flex items-start gap-2 rounded border border-slate-100 bg-white/90 px-3 py-2"
          >
            <span
              className="mt-0.5 w-4 shrink-0 text-center"
              title={row.ok ? 'Ispunjeno' : 'Nije (još) potvrđeno u sustavu'}
            >
              {row.ok ? '☑' : '☐'}
            </span>
            <div>
              <p className="text-slate-800">{row.label}</p>
              {row.hint ? <p className="text-xs text-slate-500 mt-0.5">{row.hint}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
