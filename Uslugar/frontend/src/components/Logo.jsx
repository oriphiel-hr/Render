import React from 'react';

export default function Logo({ size = 'md' }) {
  const textSize =
    size === 'lg'
      ? 'text-2xl'
      : size === 'sm'
      ? 'text-lg'
      : 'text-xl';

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 shadow-md shadow-emerald-500/40">
        <span className="text-xl font-extrabold text-white tracking-tight">
          U
        </span>
        <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/20" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`${textSize} font-extrabold tracking-tight text-gray-900 dark:text-white`}>
          Uslugar
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
          Marketplace usluga
        </span>
      </div>
    </div>
  );
}

