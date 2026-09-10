import React, { useState, useMemo } from 'react';
import { Committee } from '../../types/monetary';
import { RawStatement } from '../../data/allStatements';
import { computeStatementDiff } from '../../utils/diffCalculator';
import { TextAnnotatorWrapper } from '../annotations/TextAnnotatorWrapper';
import { ArrowLeft, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

interface StatementComparatorProps {
  statements: RawStatement[];
  committee: Committee;
}

export const StatementComparator: React.FC<StatementComparatorProps> = ({
  statements,
  committee,
}) => {
  // Statements are sorted from most recent (index 0) to oldest (index N)
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [previousIdx, setPreviousIdx] = useState<number>(1);
  const [highlightDiff, setHighlightDiff] = useState<boolean>(true);

  // When current statement changes, default previous statement to the next older one (currentIdx + 1)
  const handleSelectCurrent = (newIdx: number) => {
    setCurrentIdx(newIdx);
    const nextOlder = Math.min(newIdx + 1, statements.length - 1);
    setPreviousIdx(nextOlder !== newIdx ? nextOlder : Math.max(0, newIdx - 1));
  };

  const currentStmt = statements[currentIdx] || statements[0];
  const previousStmt = statements[previousIdx] || statements[1] || statements[0];

  // Group statements by Year for the select dropdown
  const groupedStatements = useMemo(() => {
    const groups: { year: string; items: { stmt: RawStatement; index: number }[] }[] = [];
    const map = new Map<string, { stmt: RawStatement; index: number }[]>();

    statements.forEach((stmt, idx) => {
      const year = stmt.date ? stmt.date.substring(0, 4) : 'Outros';
      if (!map.has(year)) {
        map.set(year, []);
      }
      map.get(year)!.push({ stmt, index: idx });
    });

    map.forEach((items, year) => {
      groups.push({ year, items });
    });

    return groups;
  }, [statements]);

  // Compute diff paragraph by paragraph without any theme division
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
    <div className="space-y-6">
      {/* Top Selection & Navigation Bar */}
      <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Quick Stepper Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => hasNextOlder && handleSelectCurrent(currentIdx + 1)}
            disabled={!hasNextOlder}
            title="Ir para a reunião anterior no tempo"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[var(--page-bg)] text-[var(--ink)] hover:bg-[var(--border)] disabled:opacity-40 border border-[var(--border)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <button
            onClick={() => hasNextNewer && handleSelectCurrent(currentIdx - 1)}
            disabled={!hasNextNewer}
            title="Ir para a reunião seguinte no tempo"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[var(--page-bg)] text-[var(--ink)] hover:bg-[var(--border)] disabled:opacity-40 border border-[var(--border)] transition-colors"
          >
            <span className="hidden sm:inline">Seguinte</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 flex-1 justify-center">
          {/* Reunião Atual (T) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[var(--brand)] uppercase tracking-wider">
              {committee === 'copom' ? 'Copom (T):' : 'FOMC (T):'}
            </span>
            <select
              value={currentIdx}
              onChange={(e) => handleSelectCurrent(Number(e.target.value))}
              className="bg-[var(--page-bg)] border border-[var(--border)] text-[var(--ink)] text-xs rounded-lg px-3 py-1.5 font-medium max-w-[280px] sm:max-w-[340px] truncate focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)]"
            >
              {groupedStatements.map((group) => (
                <optgroup key={group.year} label={`Ano ${group.year}`}>
                  {group.items.map(({ stmt, index }) => (
                    <option key={stmt.id} value={index}>
                      {stmt.meetingNumber} ({stmt.date}) — {stmt.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <span className="text-[var(--ink-muted)] font-mono font-bold text-xs">vs</span>

          {/* Reunião de Comparação (T-1) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
              Comparar Com:
            </span>
            <select
              value={previousIdx}
              onChange={(e) => setPreviousIdx(Number(e.target.value))}
              className="bg-[var(--page-bg)] border border-[var(--border)] text-[var(--ink)] text-xs rounded-lg px-3 py-1.5 font-medium max-w-[280px] sm:max-w-[340px] truncate focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)]"
            >
              {groupedStatements.map((group) => (
                <optgroup key={group.year} label={`Ano ${group.year}`}>
                  {group.items.map(({ stmt, index }) => (
                    <option key={stmt.id} value={index} disabled={index === currentIdx}>
                      {stmt.meetingNumber} ({stmt.date}) — {stmt.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Diff Highlighting Toggle */}
        <div className="flex items-center">
          <button
            onClick={() => setHighlightDiff(!highlightDiff)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              highlightDiff
                ? 'bg-[var(--accent-wash)] text-[var(--brand)] border-[var(--brand)]'
                : 'bg-[var(--page-bg)] text-[var(--ink-muted)] border-[var(--border)] hover:text-[var(--ink)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{highlightDiff ? 'Diff Ativo' : 'Texto Puro'}</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase">
            Total no Histórico ({committee === 'copom' ? 'Copom' : 'FOMC'})
          </div>
          <div className="text-xl font-bold font-serif text-[var(--ink)] mt-1">
            {statements.length} comunicados
          </div>
          <div className="text-[11px] text-[var(--ink-muted)] mt-1">
            Desde o primeiro comunicado disponível ({statements[statements.length - 1]?.date})
          </div>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase">
            Palavras Inseridas (T)
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <span>+{diffResult?.totalAddedWords || 0}</span>
            <span className="text-xs font-sans font-normal text-[var(--ink-muted)]">palavras adicionadas</span>
          </div>
          <div className="text-[11px] text-[var(--ink-muted)] mt-1">
            Termos e frases novas em relação à reunião de comparação
          </div>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase">
            Palavras Removidas
          </div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
            <span>-{diffResult?.totalRemovedWords || 0}</span>
            <span className="text-xs font-sans font-normal text-[var(--ink-muted)]">palavras retiradas</span>
          </div>
          <div className="text-[11px] text-[var(--ink-muted)] mt-1">
            Trechos ou sinalizações suprimidas
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Container (No Theme Division) */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs overflow-hidden">
        {/* Column Headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-[var(--border)] bg-[var(--page-bg)]">
          {/* Left Column Header (Previous) */}
          <div className="p-4 border-b md:border-b-0 md:border-r border-[var(--border)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-[var(--ink-muted)] uppercase tracking-wider">
                Comparação (Anterior / Referência)
              </span>
              <h3 className="text-sm font-bold font-serif text-[var(--ink)] mt-0.5">
                {previousStmt.meetingNumber} ({previousStmt.date})
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] truncate max-w-sm mt-0.5">
                {previousStmt.title}
              </p>
            </div>
            <span className="text-[11px] font-mono text-[var(--ink-muted)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
              {previousStmt.paragraphs.length} parágrafos
            </span>
          </div>

          {/* Right Column Header (Current) */}
          <div className="p-4 bg-[var(--accent-wash)]/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-[var(--brand)] uppercase tracking-wider">
                Comunicado Selecionado
              </span>
              <h3 className="text-sm font-bold font-serif text-[var(--brand)] mt-0.5">
                {currentStmt.meetingNumber} ({currentStmt.date})
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] truncate max-w-sm mt-0.5">
                {currentStmt.title}
              </p>
            </div>
            <span className="text-[11px] font-mono text-[var(--brand)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)] font-bold">
              {currentStmt.paragraphs.length} parágrafos
            </span>
          </div>
        </div>

        {/* Side-by-Side Paragraphs Rows (Aligned directly, no theme division) */}
        <div className="divide-y divide-[var(--border)]">
          {diffResult?.paragraphs.map((row, idx) => (
            <div
              key={`row-${idx}`}
              className="grid grid-cols-1 md:grid-cols-2 hover:bg-[var(--page-bg)]/30 transition-colors"
            >
              {/* Left Column: Previous Statement Paragraph */}
              <div className="p-5 border-b md:border-b-0 md:border-r border-[var(--border)] font-serif text-sm leading-relaxed text-[var(--ink)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[var(--ink-muted)] uppercase">
                    Parágrafo {idx + 1}
                  </span>
                  {!row.hasChanges && row.oldText && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Idêntico
                    </span>
                  )}
                </div>

                {row.oldText ? (
                  highlightDiff ? (
                    <div>
                      {row.oldPartsHighlight.map((part, pIdx) => {
                        if (part.removed) {
                          return (
                            <span
                              key={pIdx}
                              className="bg-rose-500/20 text-rose-800 dark:text-rose-300 line-through px-0.5 rounded-xs decoration-rose-600 font-serif"
                            >
                              {part.value}
                            </span>
                          );
                        }
                        return <span key={pIdx}>{part.value}</span>;
                      })}
                    </div>
                  ) : (
                    <div>{row.oldText}</div>
                  )
                ) : (
                  <div className="text-[var(--ink-muted)] italic font-sans text-xs">
                    (Este parágrafo não existia neste comunicado)
                  </div>
                )}
              </div>

              {/* Right Column: Current Statement Paragraph (with Annotator) */}
              <div className="p-5 font-serif text-sm leading-relaxed text-[var(--ink)] bg-[var(--surface)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[var(--brand)] font-bold uppercase">
                    Parágrafo {idx + 1}
                  </span>
                  {row.hasChanges ? (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-wash)] text-[var(--brand)] border border-[var(--border)]">
                      +{row.addedWordsCount} / -{row.removedWordsCount} alt.
                    </span>
                  ) : row.newText ? (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Idêntico
                    </span>
                  ) : null}
                </div>

                {row.newText ? (
                  highlightDiff ? (
                    <div className="relative">
                      <TextAnnotatorWrapper
                        documentId={`statement-${currentStmt.id}`}
                        paragraphId={`p-${idx}`}
                        text={row.newText}
                        className="text-sm text-[var(--ink)]"
                      />
                      {/* Sub-diff view if words were added */}
                      {row.hasChanges && (
                        <div className="mt-2.5 pt-2 border-t border-dashed border-[var(--border)] text-xs text-[var(--ink-muted)]">
                          <span className="font-mono font-semibold mr-1 text-[var(--brand)]">
                            Destaque de inserções:
                          </span>
                          {row.newPartsHighlight.map((part, pIdx) => {
                            if (part.added) {
                              return (
                                <span
                                  key={pIdx}
                                  className="bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-semibold px-1 py-0.5 rounded-xs border-b-2 border-emerald-500"
                                >
                                  {part.value}
                                </span>
                              );
                            }
                            return <span key={pIdx}>{part.value}</span>;
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <TextAnnotatorWrapper
                      documentId={`statement-${currentStmt.id}`}
                      paragraphId={`p-${idx}`}
                      text={row.newText}
                      className="text-sm text-[var(--ink)]"
                    />
                  )
                ) : (
                  <div className="text-[var(--ink-muted)] italic font-sans text-xs">
                    (Este parágrafo não existe neste comunicado)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
