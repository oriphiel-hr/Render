// Interaktivni "Vi ste ovdje" dijagram s Mermaid
import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
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
});

export default function JourneyDiagram({ journeyStatus }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  const buildMermaid = () => {
    if (!journeyStatus?.steps?.length) return 'flowchart TD\n  A[Nema podataka]';
    const { role, currentStep, steps } = journeyStatus;

    const nodeIds = steps.map((s) => s.id.replace(/-/g, '_'));
    const lines = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
      lines.push(`  ${nodeIds[i]} --> ${nodeIds[i + 1]}`);
    }

    const nodeDefs = steps.map((s) => {
      const id = s.id.replace(/-/g, '_');
      let label = s.label;
      if (s.waitingOn) label += ` (čeka na ${s.waitingOn})`;
      // Mermaid: u ["label"] izbjegavamo " i ]
      const escaped = label.replace(/"/g, "'").replace(/\]/g, ')').replace(/\[/g, '(');
      return `  ${id}["${escaped}"]`;
    });

    const currentId = (currentStep || '').replace(/-/g, '_');
    const classDef = `
    classDef current fill:#3B82F6,stroke:#2563EB,color:white,stroke-width:3px
    classDef done fill:#10B981,stroke:#059669,color:white
    class ${currentId} current
    ${steps.filter((s) => s.done && s.id !== currentStep).map((s) => `class ${s.id.replace(/-/g, '_')} done`).join('\n')}
    `;

    return `
flowchart TD
${nodeDefs.join('\n')}
${lines.join('\n')}
${classDef}
    `.trim();
  };

  useEffect(() => {
    if (!journeyStatus || !containerRef.current) return;
    setError(null);
    const diagram = buildMermaid();
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    mermaid
      .render(id, diagram)
      .then(({ svg: result }) => {
        setSvg(result);
      })
      .catch((err) => {
        console.error('Mermaid render error:', err);
        setError('Dijagram se nije mogao prikazati.');
      });
  }, [journeyStatus]);

  if (!journeyStatus) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        Učitavanje...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  const { currentStep, waitingOn, role } = journeyStatus;
  const currentLabel = journeyStatus.steps?.find((s) => s.id === currentStep)?.label || currentStep;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Vi ste: <strong>{role === 'PROVIDER' ? 'Pružatelj usluga' : 'Korisnik usluge'}</strong>
        </p>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-sm font-medium">
          📍 Vi ste ovdje: {currentLabel}
          {waitingOn && (
            <span className="text-xs opacity-90">
              (čeka na {waitingOn})
            </span>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className="mermaid-diagram overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
