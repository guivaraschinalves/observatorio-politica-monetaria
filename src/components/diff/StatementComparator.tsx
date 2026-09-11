import React, { useState, useMemo } from 'react';
import { Committee } from '../../types/monetary';
import { RawStatement } from '../../data/allStatements';
import { computeStatementDiff, DiffPart } from '../../utils/diffCalculator';
import { ChevronLeft, ChevronRight, AlignJustify, Columns2 } from 'lucide-react';

interface StatementComparatorProps {
  statements: RawStatement[];
  committee: Committee;
}

type ViewMode = 'unificado' | 'lado-a-lado';

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  const meses = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
  ];
  return `${Number(d)} de ${meses[Number(m) - 1]}/${y}`;
}

function DiffRun({ parts }: { parts: DiffPart[] }) {
  return (
    <>
      {parts.map((part, idx) => {
        if (part.added) {
          return (
            <span key={idx} className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xs px-0.5">
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span
              key={idx}
              className="bg-rose-500/15 text-rose-700/80 dark:text-rose-400/80 line-through decoration-rose-500/60 rounded-xs px-0.5"
            >
              {part.value}
            </span>
          );
        }
        return <React.Fragment key={idx}>{part.value}</React.Fragment>;
      })}
    </>
  );
}

export const StatementComparator: React.FC<StatementComparatorProps> = ({
  statements,
  committee,
}) => {
  // Statements are sorted from most recent (index 0) to oldest (index N)
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [previousIdx, setPreviousIdx] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('unificado');

  const handleSelectCurrent = (newIdx: number) => {
    setCurrentIdx(newIdx);
    const nextOlder = Math.min(newIdx + 1, statements.length - 1);
    setPreviousIdx(nextOlder !== newIdx ? nextOlder : Math.max(0, newIdx - 1));
  };

  const currentStmt = statements[currentIdx] || statements[0];
  const previousStmt = statements[previousIdx] || statements[1] || statements[0];

  const groupedStatements = useMemo(() => {
    const groups: { year: string; items: { stmt: RawStatement; index: number }[] }[] = [];
    const map = new Map<string, { stmt: RawStatement; index: number }[]>();

    statements.forEach((stmt, idx) => {
      const year = stmt.date ? stmt.date.substring(0, 4) : 'Outros';
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push({ stmt, index: idx });
    });

    map.forEach((items, year) => groups.push({ year, items }));
    return groups;
  }, [statements]);

  const diffResult = useMemo(() => {
    if (!currentStmt || !previousStmt) return null;
    return computeStatementDiff(previousStmt.paragraphs, currentStmt.paragraphs);
  }, [currentStmt, previousStmt]);

  if (!currentStmt || statements.length === 0) {
    return <div className="p-8 text-center text-[var(--ink-muted)]">Nenhum comunicado disponível.</div>;
  }

  const hasNextNewer = currentIdx > 0;
  const hasNextOlder = currentIdx < statements.length - 1;

  return (
    <div className="space-y-5">
      {/* Selection & Navigation Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => hasNextOlder && handleSelectCurrent(currentIdx + 1)}
            disabled={!hasNextOlder}
            title="Reunião anterior"
            className="p-2 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => hasNextNewer && handleSelectCurrent(currentIdx - 1)}
            disabled={!hasNextNewer}
            title="Reunião seguinte"
            className="p-2 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={previousIdx}
            onChange={(e) => setPreviousIdx(Number(e.target.value))}
            className="bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] text-sm rounded-lg px-3 py-1.5 max-w-[220px] truncate focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)]"
          >
            {groupedStatements.map((group) => (
              <optgroup key={group.year} label={group.year}>
                {group.items.map(({ stmt, index }) => (
                  <option key={stmt.id} value={index} disabled={index === currentIdx}>
                    {stmt.meetingNumber} — {stmt.date}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <span className="text-[var(--ink-muted)] text-sm">→</span>

          <select
            value={currentIdx}
            onChange={(e) => handleSelectCurrent(Number(e.target.value))}
            className="bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] text-sm rounded-lg px-3 py-1.5 max-w-[220px] truncate focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)]"
          >
            {groupedStatements.map((group) => (
              <optgroup key={group.year} label={group.year}>
                {group.items.map(({ stmt, index }) => (
                  <option key={stmt.id} value={index}>
                    {stmt.meetingNumber} — {stmt.date}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-0.5 ml-auto bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('unificado')}
            title="Visão unificada"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'unificado'
                ? 'bg-[var(--accent-wash)] text-[var(--brand)]'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5" />
            <span>Unificado</span>
          </button>
          <button
            onClick={() => setViewMode('lado-a-lado')}
            title="Visão lado a lado"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'lado-a-lado'
                ? 'bg-[var(--accent-wash)] text-[var(--brand)]'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Lado a lado</span>
          </button>
        </div>
      </div>

      {/* Document header, in the comparator's own voice */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)] align-middle mr-2.5">
            {committee === 'copom' ? 'Copom' : 'FOMC'}
          </span>
          {previousStmt.meetingNumber}
          <span className="mx-2 text-[var(--ink-muted)] font-normal">→</span>
          {currentStmt.meetingNumber}
        </h2>
        <div className="flex items-center gap-3 text-xs text-[var(--ink-muted)]">
          <span>{formatDate(previousStmt.date)} → {formatDate(currentStmt.date)}</span>
          <span className="text-[var(--border)]">|</span>
          <span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{diffResult?.totalAddedWords || 0}</span>
            {' / '}
            <span className="text-rose-600 dark:text-rose-400 font-medium">-{diffResult?.totalRemovedWords || 0}</span>
            {' palavras'}
          </span>
        </div>
      </div>

      {/* Document body */}
      {viewMode === 'unificado' ? (
        <div className="text-[15px] leading-[1.85] text-[var(--ink)] space-y-4">
          {diffResult?.paragraphs.map((row, idx) => (
            <p key={idx}>
              <DiffRun parts={row.diffParts} />
            </p>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div>
            <div className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wide mb-3">
              {previousStmt.meetingNumber} ({formatDate(previousStmt.date)})
            </div>
            <div className="text-[15px] leading-[1.85] text-[var(--ink)] space-y-4">
              {diffResult?.paragraphs.map((row, idx) =>
                row.oldPartsHighlight.length ? (
                  <p key={idx}>
                    <DiffRun parts={row.oldPartsHighlight} />
                  </p>
                ) : null
              )}
            </div>
          </div>
          <div className="pt-6 md:pt-0 md:border-l md:border-[var(--border)] md:pl-8 border-t md:border-t-0 border-[var(--border)]">
            <div className="text-xs font-medium text-[var(--brand)] uppercase tracking-wide mb-3">
              {currentStmt.meetingNumber} ({formatDate(currentStmt.date)})
            </div>
            <div className="text-[15px] leading-[1.85] text-[var(--ink)] space-y-4">
              {diffResult?.paragraphs.map((row, idx) =>
                row.newPartsHighlight.length ? (
                  <p key={idx}>
                    <DiffRun parts={row.newPartsHighlight} />
                  </p>
                ) : null
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
