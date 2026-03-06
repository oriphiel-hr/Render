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
  const [detailsOpen, setDetailsOpen] = useState(false);

  const buildMermaidDirector = () => {
    const { tracks = [], currentFocus } = journeyStatus;
    const esc = (t) => String(t).replace(/"/g, "'").replace(/\]/g, ')').replace(/\[/g, '(');

    const nodes = [];
    const lines = [];
    const classes = [];

    nodes.push('  START["Registracija"]');
    nodes.push('  BECOME["Postani direktor"]');
    lines.push('  START --> BECOME');

    tracks.forEach((t, i) => {
      const id = `T${i}_${t.id}`.replace(/-/g, '_');
      let label = t.label;
      if (t.id === 'team') {
        const n = t.teamMembersCount ?? 0;
        const word = n === 1 ? 'član' : n >= 2 && n <= 4 ? 'člana' : 'članova';
        label += ` (${n} ${word})`;
        if ((t.pendingInvites ?? 0) > 0) label += `, ${t.pendingInvites} čeka`;
      } else if (t.id === 'credits') {
        label += ` (${t.creditsBalance})`;
      } else if (t.id === 'leads') {
        label += ` (${t.totalInQueue || 0} u queueu)`;
        if ((t.queueAssigned || 0) + (t.queueInProgress || 0) > 0) {
          label += `, ${(t.queueAssigned || 0) + (t.queueInProgress || 0)} aktivno`;
        }
      }
      if (t.waitingOn) label += ` – čeka: ${t.waitingOn}`;
      nodes.push(`  ${id}["${esc(label)}"]`);
      lines.push(`  BECOME --> ${id}`);
      if (t.done) classes.push(`class ${id} done`);
      else if (currentFocus === t.id) classes.push(`class ${id} current`);
    });

    nodes.push('  ACTIVE["Aktivno upravljanje"]');
    tracks.forEach((t, i) => {
      const id = `T${i}_${t.id}`.replace(/-/g, '_');
      lines.push(`  ${id} --> ACTIVE`);
    });

    const classDef = `
    classDef current fill:#3B82F6,stroke:#2563EB,color:white,stroke-width:3px
    classDef done fill:#10B981,stroke:#059669,color:white
    class START done
    class BECOME done
    ${classes.join('\n')}
    `;

    return `
flowchart TD
${nodes.join('\n')}
${lines.join('\n')}
${classDef}
    `.trim();
  };

  const buildMermaid = () => {
    const { role, tracks } = journeyStatus || {};
    if (role === 'DIRECTOR' && tracks?.length) {
      return buildMermaidDirector();
    }
    if (!journeyStatus?.steps?.length) return 'flowchart TD\n  A[Nema podataka]';
    const { currentStep, steps } = journeyStatus;

    const nodeIds = steps.map((s) => s.id.replace(/-/g, '_'));
    const lines = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
      lines.push(`  ${nodeIds[i]} --> ${nodeIds[i + 1]}`);
    }

    const { summary: sum } = journeyStatus || {};
    const nodeDefs = steps.map((s) => {
      const id = s.id.replace(/-/g, '_');
      let label = s.label;
      if (sum && role === 'USER') {
        if (s.id === 'post_job') label += sum.jobsPosted != null ? ` (${sum.jobsPosted})` : '';
        if (s.id === 'wait_offers') label += sum.offersReceived != null ? ` (${sum.offersReceived} ponuda)` : '';
        if (s.id === 'in_progress') label += sum.jobsInProgress != null ? ` (${sum.jobsInProgress})` : '';
        if (s.id === 'completed') label += sum.jobsCompleted != null ? ` (${sum.jobsCompleted})` : '';
      }
      if (sum && role === 'PROVIDER') {
        if (s.id === 'subscription') label += sum.credits != null ? ` (${sum.credits} kredita)` : '';
        if (s.id === 'get_leads') label += (sum.leadsPurchased ?? 0) + (sum.offersSent ?? 0) > 0 ? ` (${(sum.leadsPurchased ?? 0) + (sum.offersSent ?? 0)})` : '';
        if (s.id === 'in_progress') label += sum.jobsInProgress != null ? ` (${sum.jobsInProgress})` : '';
        if (s.id === 'completed') label += sum.jobsCompleted != null ? ` (${sum.jobsCompleted})` : '';
      }
      if (sum && role === 'TEAM_MEMBER') {
        if (s.id === 'wait_assignment') label += sum.totalAssigned != null ? ` (${sum.totalAssigned} dodijeljeno)` : '';
        if (s.id === 'in_progress') label += sum.inProgress != null ? ` (${sum.inProgress})` : '';
        if (s.id === 'completed') label += sum.completed != null ? ` (${sum.completed})` : '';
      }
      if (s.waitingOn) label += ` (čeka na ${s.waitingOn})`;
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

  const { currentStep, waitingOn, role, tracks, summary } = journeyStatus;
  const isDirector = role === 'DIRECTOR';
  const isTeamMember = role === 'TEAM_MEMBER';

  const formatSummary = () => {
    if (!summary) return journeyStatus.steps?.find((s) => s.id === currentStep)?.label || currentStep;
    if (role === 'DIRECTOR') {
      const teamN = summary.teamMembers ?? 0;
      const teamWord = teamN === 1 ? 'član' : teamN >= 2 && teamN <= 4 ? 'člana' : 'članova';
      return `${teamN} ${teamWord} tima • ${summary.credits ?? 0} kredita • ${(summary.queuePending ?? 0) + (summary.queueAssigned ?? 0) + (summary.queueInProgress ?? 0)} leadova u queueu`;
    }
    if (role === 'TEAM_MEMBER') {
      const total = (summary.assigned ?? 0) + (summary.inProgress ?? 0) + (summary.completed ?? 0);
      return `${total} leadova dodijeljeno • ${summary.inProgress ?? 0} u tijeku • ${summary.completed ?? 0} završeno`;
    }
    if (role === 'PROVIDER') {
      return `${summary.credits ?? 0} kredita • ${summary.offersSent ?? 0} ponuda • ${summary.jobsInProgress ?? 0} poslova u tijeku • ${summary.jobsCompleted ?? 0} završeno`;
    }
    if (role === 'USER') {
      return `${summary.jobsPosted ?? 0} poslova • ${summary.offersReceived ?? 0} ponuda • ${summary.jobsInProgress ?? 0} u tijeku • ${summary.jobsCompleted ?? 0} završeno`;
    }
    return journeyStatus.steps?.find((s) => s.id === currentStep)?.label || currentStep;
  };

  const currentLabel = (isDirector || isTeamMember || summary) ? formatSummary() : (journeyStatus.steps?.find((s) => s.id === currentStep)?.label || currentStep);

  const roleLabel = role === 'DIRECTOR' ? 'Direktor' : role === 'TEAM_MEMBER' ? 'Član tima' : role === 'PROVIDER' ? 'Pružatelj usluga' : 'Korisnik usluge';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Vi ste: <strong>{roleLabel}</strong>
        </p>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-sm font-medium">
          📍 {(isDirector || (summary && (role === 'USER' || role === 'PROVIDER' || role === 'TEAM_MEMBER'))) ? 'Trenutno: ' : 'Vi ste ovdje: '}{currentLabel}
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

      {journeyStatus.details && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {detailsOpen ? '▼' : '▶'} Detalji: statusi poslova, refund, paketi
          </button>
          {detailsOpen && (
            <DetailsPanel details={journeyStatus.details} role={journeyStatus.role} />
          )}
        </div>
      )}
    </div>
  );
}

function DetailsPanel({ details, role }) {
  const { jobs, queue, refund, packages } = details || {};
  const hasJobs = jobs && (jobs.open + jobs.inProgress + jobs.completed + jobs.cancelled > 0);
  const hasQueue = queue && (queue.pending + queue.assigned + queue.inProgress + queue.completed > 0);
  const hasRefund = refund && (refund.pending + refund.approved + refund.rejected > 0);
  const hasPackages = packages && (packages.subscriptionPlan || packages.addonsTotal > 0);

  if (!hasJobs && !hasQueue && !hasRefund && !hasPackages) {
    return (
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
        Nema dodatnih detalja za prikaz.
      </p>
    );
  }

  return (
    <div className="mt-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-4">
      {hasQueue && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Leadovi u queueu</h4>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
              Čeka dodjelu: {queue.pending}
            </span>
            <span className="px-2 py-1 rounded bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200">
              Dodijeljeno: {queue.assigned}
            </span>
            <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
              U tijeku: {queue.inProgress}
            </span>
            <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
              Završeno: {queue.completed}
            </span>
          </div>
        </div>
      )}
      {hasJobs && (role !== 'DIRECTOR' || !hasQueue) && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {role === 'TEAM_MEMBER' ? 'Leadovi (dodijeljeni)' : 'Poslovi'}
          </h4>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
              {role === 'TEAM_MEMBER' ? 'Dodijeljeno (čekaju početak)' : 'Otvoreno'}: {jobs.open}
            </span>
            <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
              U tijeku: {jobs.inProgress}
            </span>
            <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
              Završeno: {jobs.completed}
            </span>
            {jobs.cancelled > 0 && (
              <span className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Otkazano: {jobs.cancelled}
              </span>
            )}
          </div>
        </div>
      )}
      {hasRefund && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Refund zahtjevi</h4>
          <div className="flex flex-wrap gap-3 text-sm">
            {refund.pending > 0 && (
              <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                Čeka odobrenje: {refund.pending}
              </span>
            )}
            {refund.approved > 0 && (
              <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
                Odobreno: {refund.approved}
              </span>
            )}
            {refund.rejected > 0 && (
              <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200">
                Odbijeno: {refund.rejected}
              </span>
            )}
          </div>
        </div>
      )}
      {hasPackages && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Paketi</h4>
          <div className="flex flex-wrap gap-3 text-sm">
            {packages.subscriptionPlan && (
              <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200">
                Pretplata: {packages.subscriptionPlan} ({packages.subscriptionStatus || '–'})
              </span>
            )}
            {packages.addonsTotal > 0 && (
              <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200">
                Add-oni: {packages.addonsActive} aktivnih, {packages.addonsExpired} isteklih
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
