import React from 'react';

export default function LinkButton({ href, children, title, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className={`inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 hover:underline underline-offset-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors ${className}`}
    >
      {children}
    </a>
  );
}


