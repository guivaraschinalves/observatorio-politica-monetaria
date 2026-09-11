import React, { useState } from 'react';
import { MarketOverview, Committee } from '../../types/monetary';
import { Clock, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MarketProbabilitiesViewProps {
  overview: MarketOverview;
  committee: Committee;
}

export const MarketProbabilitiesView: React.FC<MarketProbabilitiesViewProps> = ({
  overview,
  committee,
}) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(overview.meetings[0]?.id || '');

  const activeMeeting = overview.meetings.find((m) => m.id === selectedMeetingId) || overview.meetings[0];

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-[var(--surface)] text-[var(--ink)] rounded-2xl p-6 shadow-xs border border-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--brand)]">
                {committee === 'copom' ? 'Curva a Termo de DI1 (B3)' : 'Fed de Atlanta · Market Probability Tracker'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-good)] animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold font-serif tracking-tight mt-1 text-[var(--ink)]">
              {committee === 'copom' ? 'Precificação da Taxa Selic' : 'Target Rate Probabilities (FOMC)'}
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mt-1 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
              <span>Última atualização: {overview.lastUpdated}</span>
            </p>
          </div>

          <div className="flex items-center gap-5 bg-[var(--page-bg)] px-5 py-3.5 rounded-xl border border-[var(--border)]">
            <div>
              <div className="text-[11px] font-mono text-[var(--ink-muted)] uppercase font-semibold">Taxa Terminal Implícita</div>
              <div className="text-xl font-bold font-serif text-[var(--ink)]">{overview.terminalRate}</div>
              <div className="text-[10px] text-[var(--ink-muted)]">Esperada em {overview.terminalDate}</div>
            </div>
            <div className="h-8 w-px bg-[var(--border)]" />
            <div>
              <div className="text-[11px] font-mono text-[var(--ink-muted)] uppercase font-semibold">Variação no Ciclo</div>
              <div className={`text-xl font-bold font-serif flex items-center ${overview.totalCutsOrHikesExpectedBps >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {overview.totalCutsOrHikesExpectedBps >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 mr-0.5" />
                )}
                <span>{overview.totalCutsOrHikesExpectedBps > 0 ? `+${overview.totalCutsOrHikesExpectedBps}` : overview.totalCutsOrHikesExpectedBps} bps</span>
              </div>
              <div className="text-[10px] text-[var(--ink-muted)]">até final do ciclo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Upcoming Meetings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overview.meetings.map((meeting) => {
          const isSelected = meeting.id === activeMeeting.id;
          const mostLikelyBucket = [...meeting.probabilities].sort((a, b) => b.probability - a.probability)[0];

          return (
            <div
              key={meeting.id}
              onClick={() => setSelectedMeetingId(meeting.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[var(--accent-wash)] border-[var(--brand)] shadow-xs ring-1 ring-[var(--brand)]'
                  : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--ink-muted)]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[var(--ink-muted)]">
                <span className="font-semibold font-serif flex items-center gap-1 text-[var(--ink)]">
                  <Calendar className="w-3.5 h-3.5 text-[var(--brand)]" />
                  {meeting.meetingDate}
                </span>
                <span className="text-[10px] bg-[var(--page-bg)] px-1.5 py-0.5 rounded font-mono border border-[var(--border)]">
                  em {meeting.daysToMeeting}d
                </span>
              </div>

              <div className="mt-3">
                <div className="text-xs text-[var(--ink-muted)]">Taxa Atual vs Implícita:</div>
                <div className="text-base font-bold text-[var(--ink)] mt-0.5 flex items-center justify-between">
                  <span>{meeting.currentRate}</span>
                  <span className="text-[var(--ink-muted)] text-xs">➔</span>
                  <span className="text-[var(--brand)] font-mono">{meeting.impliedRate}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--ink-muted)]">Aposta central:</span>
                <span className="font-bold font-mono text-[var(--ink)] bg-[var(--page-bg)] px-2 py-0.5 rounded border border-[var(--border)] text-[11px]">
                  {mostLikelyBucket?.probability}% ({mostLikelyBucket?.rateLabel.split(' ')[0]})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Analysis of the Selected Meeting */}
      {activeMeeting && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[var(--brand)] uppercase tracking-wider">
                Distribuição de Probabilidade Implícita
              </span>
              <h3 className="text-lg font-bold font-serif text-[var(--ink)]">
                Reunião de {activeMeeting.meetingDate}
              </h3>
              <p className="text-xs text-[var(--ink-muted)]">
                Precificação baseada nos contratos futuros em negociação contínua
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-[var(--ink-muted)]">Taxa Futura Projetada</div>
                <div className="text-lg font-bold text-[var(--ink)] font-mono">{activeMeeting.impliedRate}</div>
              </div>
              <div className="text-right pl-4 border-l border-[var(--border)]">
                <div className="text-xs text-[var(--ink-muted)]">Passo Esperado (bps)</div>
                <div className={`text-lg font-bold font-mono ${activeMeeting.expectedChangeBps >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {activeMeeting.expectedChangeBps > 0 ? `+${activeMeeting.expectedChangeBps}` : activeMeeting.expectedChangeBps} bps
                </div>
              </div>
            </div>
          </div>

          {/* Probability Distribution Bars */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-[var(--ink)] uppercase tracking-wider">
              Cenários de Decisão & Probabilidades (%)
            </h4>
            <div className="space-y-3">
              {activeMeeting.probabilities.map((bucket, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[var(--ink)] font-serif font-semibold">{bucket.rateLabel}</span>
                    <span className="text-[var(--brand)] font-bold font-mono">{bucket.probability}%</span>
                  </div>
                  <div className="w-full bg-[var(--page-bg)] rounded-full h-3 overflow-hidden flex border border-[var(--border)]">
                    <div
                      style={{ width: `${bucket.probability}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        bucket.changeBps > 0
                          ? 'bg-rose-500'
                          : bucket.changeBps < 0
                          ? 'bg-emerald-500'
                          : 'bg-[var(--brand)]'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Evolution Comparison if present */}
          {activeMeeting.historicalProbabilities && (
            <div className="pt-4 border-t border-[var(--border)]">
              <h4 className="text-xs font-mono font-bold text-[var(--ink)] uppercase tracking-wider mb-3">
                Evolução Histórica da Probabilidade Cenário Base
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[var(--page-bg)] p-3 rounded-lg border border-[var(--border)] text-center">
                  <div className="text-[11px] font-mono text-[var(--ink-muted)]">Hoje</div>
                  <div className="text-base font-bold text-[var(--brand)] font-mono mt-0.5">
                    {activeMeeting.historicalProbabilities.current}%
                  </div>
                </div>
                <div className="bg-[var(--page-bg)] p-3 rounded-lg border border-[var(--border)] text-center">
                  <div className="text-[11px] font-mono text-[var(--ink-muted)]">1 Dia Atrás</div>
                  <div className="text-base font-bold text-[var(--ink)] font-mono mt-0.5">
                    {activeMeeting.historicalProbabilities.oneDayAgo}%
                  </div>
                </div>
                <div className="bg-[var(--page-bg)] p-3 rounded-lg border border-[var(--border)] text-center">
                  <div className="text-[11px] font-mono text-[var(--ink-muted)]">1 Semana Atrás</div>
                  <div className="text-base font-bold text-[var(--ink)] font-mono mt-0.5">
                    {activeMeeting.historicalProbabilities.oneWeekAgo}%
                  </div>
                </div>
                <div className="bg-[var(--page-bg)] p-3 rounded-lg border border-[var(--border)] text-center">
                  <div className="text-[11px] font-mono text-[var(--ink-muted)]">1 Mês Atrás</div>
                  <div className="text-base font-bold text-[var(--ink)] font-mono mt-0.5">
                    {activeMeeting.historicalProbabilities.oneMonthAgo}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
