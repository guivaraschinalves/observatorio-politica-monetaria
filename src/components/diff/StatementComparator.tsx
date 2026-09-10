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
    return <div className="p-8 text-center text-gray-500">Nenhuma reunião disponível.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Selection Bar & Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Reunião Base (Atual) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Reunião Recente (T):
            </span>
            <select
              value={meetingCurrentId}
              onChange={(e) => setMeetingCurrentId(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg px-3 py-1.5 font-medium focus:ring-blue-500 focus:border-blue-500"
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.meetingNumber} ({m.date}) - Taxa: {m.rateDecision}
                </option>
              ))}
            </select>
          </div>

          <span className="text-gray-400 font-bold text-sm">vs</span>

          {/* Reunião Anterior (T-1) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Comparar Com (T-1):
            </span>
            <select
              value={meetingPreviousId}
              onChange={(e) => setMeetingPreviousId(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg px-3 py-1.5 font-medium focus:ring-blue-500 focus:border-blue-500"
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
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode('inline')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'inline'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Unificado (Inline)</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'split'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Lado a Lado (Split)</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 uppercase">Decisão de Juros</div>
          <div className="text-xl font-bold text-gray-900 mt-1 flex items-baseline gap-2">
            <span>{currentMeeting.rateDecision}</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                currentMeeting.changeBps > 0
                  ? 'bg-rose-100 text-rose-800'
                  : currentMeeting.changeBps < 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {currentMeeting.changeBps > 0
                ? `+${currentMeeting.changeBps} bps`
                : currentMeeting.changeBps < 0
                ? `${currentMeeting.changeBps} bps`
                : '0 bps (Pausa)'}
            </span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Placar: {currentMeeting.voteSplit}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 uppercase">Palavras Inseridas</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <span>+{diffResult?.totalAddedWords || 0}</span>
            <span className="text-xs font-normal text-gray-500">novas palavras</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Novos argumentos e condições adicionadas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 uppercase">Palavras Removidas</div>
          <div className="text-xl font-bold text-rose-600 mt-1 flex items-center gap-1">
            <span>-{diffResult?.totalRemovedWords || 0}</span>
            <span className="text-xs font-normal text-gray-500">palavras retiradas</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Termos ou sinalizações abandonadas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 uppercase">Sinalização de Guidance</div>
          <div className="text-sm font-semibold text-blue-900 mt-1 line-clamp-2">
            {currentMeeting.keyGuidance}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Foco no horizonte relevante</span>
          </div>
        </div>
      </div>

      {/* Diff View Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">
              Texto Comparado do Comunicado ({committee === 'copom' ? 'Copom / Bacen' : 'FOMC / Fed'})
            </h2>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-emerald-100 border border-emerald-400 rounded-xs inline-block" />
              <span>Inserido</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-rose-100 border border-rose-400 rounded-xs inline-block" />
              <span className="line-through text-rose-800">Removido</span>
            </span>
            <span className="text-gray-400 font-serif italic">
              *Selecione qualquer trecho para grifar ou anotar
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
                  className="p-4 rounded-xl border border-gray-100 bg-stone-50/40 hover:bg-stone-50/90 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-sans font-bold text-gray-500 tracking-wider uppercase">
                      § {idx + 1}. {pDiff.sectionTitle}
                    </span>
                    {pDiff.hasChanges ? (
                      <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        +{pDiff.addedWordsCount} / -{pDiff.removedWordsCount} alterações
                      </span>
                    ) : (
                      <span className="text-[11px] font-sans text-gray-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Inalterado
                      </span>
                    )}
                  </div>

                  <div className="text-base text-gray-800 leading-relaxed font-serif">
                    {pDiff.diffParts.map((part, pIdx) => {
                      if (part.added) {
                        return (
                          <span
                            key={pIdx}
                            className="bg-emerald-100/90 text-emerald-950 font-medium px-1 py-0.5 rounded-xs border-b-2 border-emerald-500"
                          >
                            {part.value}
                          </span>
                        );
                      }
                      if (part.removed) {
                        return (
                          <span
                            key={pIdx}
                            className="bg-rose-100 text-rose-800 line-through px-1 py-0.5 rounded-xs mx-0.5 decoration-rose-600 opacity-70"
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
                <div className="bg-gray-100/80 px-3 py-2 rounded-lg text-xs font-sans font-bold text-gray-700">
                  {previousMeeting.meetingNumber} ({previousMeeting.date}) — Anterior
                </div>
                {diffResult?.paragraphs.map((pDiff, idx) => (
                  <div
                    key={`split-old-${idx}`}
                    className="p-4 rounded-xl border border-gray-200 bg-white min-h-[120px]"
                  >
                    <div className="text-xs font-sans font-semibold text-gray-500 mb-2">
                      § {idx + 1}. {pDiff.sectionTitle}
                    </div>
                    <div className="text-sm leading-relaxed text-gray-700">
                      {pDiff.oldText || <span className="text-gray-400 italic">(Parágrafo não existia na reunião anterior)</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Column with Annotator Support */}
              <div className="space-y-6">
                <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs font-sans font-bold text-blue-900 border border-blue-200">
                  {currentMeeting.meetingNumber} ({currentMeeting.date}) — Atual (Anotável)
                </div>
                {diffResult?.paragraphs.map((pDiff, idx) => (
                  <div
                    key={`split-new-${idx}`}
                    className="p-4 rounded-xl border border-blue-100 bg-white min-h-[120px]"
                  >
                    <div className="text-xs font-sans font-semibold text-blue-800 mb-2">
                      § {idx + 1}. {pDiff.sectionTitle}
                    </div>
                    <TextAnnotatorWrapper
                      documentId={`statement-${currentMeeting.id}`}
                      paragraphId={`p-${idx}`}
                      text={pDiff.newText}
                      className="text-sm text-gray-900"
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
