import React, { useState, useMemo } from 'react';
import { MeetingData, Committee } from '../../types/monetary';
import { computeStatementDiff } from '../../utils/diffCalculator';
import { TextAnnotatorWrapper } from '../annotations/TextAnnotatorWrapper';
import { GitCompare, Columns, AlignLeft, Sparkles, CheckCircle2 } from 'lucide-react';

interface StatementComparatorProps {
  meetings: MeetingData[];
  committee: Committee;
}

export const StatementComparator: React.FC<StatementComparatorProps> = ({
  meetings,
  committee,
}) => {
  const [meetingCurrentId, setMeetingCurrentId] = useState<string>(meetings[0]?.id || '');
  const [meetingPreviousId, setMeetingPreviousId] = useState<string>(meetings[1]?.id || '');
  const [viewMode, setViewMode] = useState<'inline' | 'split'>('inline');

  const currentMeeting = useMemo(() => {
    return meetings.find((m) => m.id === meetingCurrentId) || meetings[0];
  }, [meetings, meetingCurrentId]);

  const previousMeeting = useMemo(() => {
    return meetings.find((m) => m.id === meetingPreviousId) || meetings[1] || meetings[0];
  }, [meetings, meetingPreviousId]);

  const diffResult = useMemo(() => {
    if (!currentMeeting || !previousMeeting) return null;
    return computeStatementDiff(
      previousMeeting.statement.map((p) => ({ text: p.text, section: p.section })),
      currentMeeting.statement.map((p) => ({ text: p.text, section: p.section }))
    );
  }, [currentMeeting, previousMeeting]);

  if (!currentMeeting) {
    return <div className="p-8 text-center text-[var(--ink-muted)]">Nenhuma reunião disponível.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Selection Bar & Controls */}
      <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Reunião Base (Atual) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
              Reunião Recente (T):
            </span>
            <select
              value={meetingCurrentId}
              onChange={(e) => setMeetingCurrentId(e.target.value)}
              className="bg-[var(--page-bg)] border border-[var(--border)] text-[var(--ink)] text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)]"
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.meetingNumber} ({m.date}) - Taxa: {m.rateDecision}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[var(--ink-muted)] font-mono font-bold text-xs">vs</span>

          {/* Reunião Anterior (T-1) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
              Comparar Com (T-1):
            </span>
            <select
              value={meetingPreviousId}
              onChange={(e) => setMeetingPreviousId(e.target.value)}
              className="bg-[var(--page-bg)] border border-[var(--border)] text-[var(--ink)] text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)]"
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id} disabled={m.id === meetingCurrentId}>
                  {m.meetingNumber} ({m.date}) - Taxa: {m.rateDecision}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[var(--page-bg)] p-1 rounded-lg border border-[var(--border)]">
          <button
            onClick={() => setViewMode('inline')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'inline'
                ? 'bg-[var(--surface)] text-[var(--brand)] shadow-xs border border-[var(--border)] font-bold'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Unificado (Inline)</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'split'
                ? 'bg-[var(--surface)] text-[var(--brand)] shadow-xs border border-[var(--border)] font-bold'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Lado a Lado (Split)</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase">Decisão de Juros</div>
          <div className="text-xl font-bold font-serif text-[var(--ink)] mt-1 flex items-baseline gap-2">
            <span>{currentMeeting.rateDecision}</span>
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                currentMeeting.changeBps > 0
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                  : currentMeeting.changeBps < 0
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-[var(--page-bg)] text-[var(--ink-secondary)]'
              }`}
            >
              {currentMeeting.changeBps > 0
                ? `+${currentMeeting.changeBps} bps`
                : currentMeeting.changeBps < 0
                ? `${currentMeeting.changeBps} bps`
                : '0 bps (Pausa)'}
            </span>
          </div>
          <div className="text-[11px] text-[var(--ink-muted)] mt-1">
            Placar: {currentMeeting.voteSplit}
          </div>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase">Palavras Inseridas</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <span>+{diffResult?.totalAddedWords || 0}</span>
            <span className="text-xs font-sans font-normal text-[var(--ink-muted)]">palavras</span>
          </div>
          <div className="text-[11px] text-[var(--ink-muted)] mt-1">
            Novos argumentos e condições adicionadas
          </div>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase">Palavras Removidas</div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
            <span>-{diffResult?.totalRemovedWords || 0}</span>
            <span className="text-xs font-sans font-normal text-[var(--ink-muted)]">palavras</span>
          </div>
          <div className="text-[11px] text-[var(--ink-muted)] mt-1">
            Termos ou sinalizações abandonadas
          </div>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase">Sinalização de Guidance</div>
          <div className="text-xs font-serif text-[var(--ink)] mt-1 line-clamp-2 leading-relaxed">
            {currentMeeting.keyGuidance}
          </div>
          <div className="text-[11px] text-[var(--brand)] font-medium mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Foco no horizonte relevante</span>
          </div>
        </div>
      </div>

      {/* Diff View Area */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--page-bg)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[var(--brand)]" />
            <h2 className="text-sm font-bold text-[var(--ink)]">
              Texto Comparado do Comunicado ({committee === 'copom' ? 'Copom / Bacen' : 'FOMC / Fed'})
            </h2>
          </div>
          <div className="text-xs text-[var(--ink-muted)] flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded-xs inline-block" />
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Inserido</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-rose-500/20 border border-rose-500 rounded-xs inline-block" />
              <span className="line-through text-rose-700 dark:text-rose-400 font-medium">Removido</span>
            </span>
            <span className="hidden sm:inline font-serif italic text-[var(--ink-muted)]">
              *Selecione texto para grifar ou anotar
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6 font-serif">
          {viewMode === 'inline' ? (
            /* UNIFIED INLINE DIFF */
            <div className="space-y-6">
              {diffResult?.paragraphs.map((pDiff, idx) => (
                <div
                  key={`inline-p-${idx}`}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--page-bg)]/40 hover:bg-[var(--page-bg)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[var(--ink-muted)] tracking-wider uppercase">
                      § {idx + 1}. {pDiff.sectionTitle}
                    </span>
                    {pDiff.hasChanges ? (
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--accent-wash)] text-[var(--brand)] border border-[var(--border)]">
                        +{pDiff.addedWordsCount} / -{pDiff.removedWordsCount} alterações
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[var(--ink-muted)] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Inalterado
                      </span>
                    )}
                  </div>

                  <div className="text-base text-[var(--ink)] leading-relaxed font-serif">
                    {pDiff.diffParts.map((part, pIdx) => {
                      if (part.added) {
                        return (
                          <span
                            key={pIdx}
                            className="bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-medium px-1 py-0.5 rounded-xs border-b-2 border-emerald-500"
                          >
                            {part.value}
                          </span>
                        );
                      }
                      if (part.removed) {
                        return (
                          <span
                            key={pIdx}
                            className="bg-rose-500/20 text-rose-800 dark:text-rose-300 line-through px-1 py-0.5 rounded-xs mx-0.5 decoration-rose-600 opacity-80"
                          >
                            {part.value}
                          </span>
                        );
                      }
                      return <span key={pIdx}>{part.value}</span>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* SPLIT SIDE-BY-SIDE DIFF */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Previous Column */}
              <div className="space-y-6">
                <div className="bg-[var(--page-bg)] px-3 py-2 rounded-lg text-xs font-mono font-bold text-[var(--ink-secondary)] border border-[var(--border)]">
                  {previousMeeting.meetingNumber} ({previousMeeting.date}) — Anterior
                </div>
                {diffResult?.paragraphs.map((pDiff, idx) => (
                  <div
                    key={`split-old-${idx}`}
                    className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] min-h-[120px]"
                  >
                    <div className="text-xs font-mono font-semibold text-[var(--ink-muted)] mb-2">
                      § {idx + 1}. {pDiff.sectionTitle}
                    </div>
                    <div className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                      {pDiff.oldText || <span className="text-[var(--ink-muted)] italic">(Parágrafo não existia na reunião anterior)</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Column with Annotator Support */}
              <div className="space-y-6">
                <div className="bg-[var(--accent-wash)] px-3 py-2 rounded-lg text-xs font-mono font-bold text-[var(--brand)] border border-[var(--border)]">
                  {currentMeeting.meetingNumber} ({currentMeeting.date}) — Atual (Anotável)
                </div>
                {diffResult?.paragraphs.map((pDiff, idx) => (
                  <div
                    key={`split-new-${idx}`}
                    className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] min-h-[120px]"
                  >
                    <div className="text-xs font-mono font-semibold text-[var(--brand)] mb-2">
                      § {idx + 1}. {pDiff.sectionTitle}
                    </div>
                    <TextAnnotatorWrapper
                      documentId={`statement-${currentMeeting.id}`}
                      paragraphId={`p-${idx}`}
                      text={pDiff.newText}
                      className="text-sm text-[var(--ink)]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
