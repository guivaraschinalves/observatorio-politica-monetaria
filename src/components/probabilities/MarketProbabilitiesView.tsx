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
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {committee === 'copom' ? 'Curva de Juros DI1 (B3) & Opções de Copom' : 'CME FedWatch & 30-Day Fed Funds Futures'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mt-1">
              {committee === 'copom' ? 'Precificação da Taxa Selic' : 'Target Rate Probabilities (FOMC)'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Última atualização do mercado: {overview.lastUpdated}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
            <div>
              <div className="text-[11px] text-slate-300 uppercase font-semibold">Taxa Terminal Implícita</div>
              <div className="text-xl font-bold text-white">{overview.terminalRate}</div>
              <div className="text-[10px] text-slate-400">Esperada em {overview.terminalDate}</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-[11px] text-slate-300 uppercase font-semibold">Variação Total Ciclo</div>
              <div className={`text-xl font-bold flex items-center ${overview.totalCutsOrHikesExpectedBps >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {overview.totalCutsOrHikesExpectedBps >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 mr-0.5" />
                )}
                <span>{overview.totalCutsOrHikesExpectedBps > 0 ? `+${overview.totalCutsOrHikesExpectedBps}` : overview.totalCutsOrHikesExpectedBps} bps</span>
              </div>
              <div className="text-[10px] text-slate-400">até final do ciclo</div>
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
                  ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold flex items-center gap-1 text-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {meeting.meetingDate}
                </span>
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                  em {meeting.daysToMeeting}d
                </span>
              </div>

              <div className="mt-3">
                <div className="text-xs text-gray-500">Taxa Atual vs Implícita:</div>
                <div className="text-base font-bold text-gray-900 mt-0.5 flex items-center justify-between">
                  <span>{meeting.currentRate}</span>
                  <span className="text-gray-400 text-xs">➔</span>
                  <span className="text-blue-700 font-mono">{meeting.impliedRate}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Aposta majoritária:</span>
                <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200 text-[11px]">
                  {mostLikelyBucket?.probability}% ({mostLikelyBucket?.rateLabel.split(' ')[0]})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Analysis of the Selected Meeting */}
      {activeMeeting && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Distribuição de Probabilidade Implícita
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                Reunião de {activeMeeting.meetingDate}
              </h3>
              <p className="text-xs text-gray-500">
                Precificação baseada nos contratos futuros em negociação contínua
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">Taxa Futura Projetada</div>
                <div className="text-lg font-bold text-gray-900 font-mono">{activeMeeting.impliedRate}</div>
              </div>
              <div className="text-right pl-3 border-l border-gray-200">
                <div className="text-xs text-gray-500">Passo Esperado (bps)</div>
                <div className={`text-lg font-bold font-mono ${activeMeeting.expectedChangeBps >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {activeMeeting.expectedChangeBps > 0 ? `+${activeMeeting.expectedChangeBps}` : activeMeeting.expectedChangeBps} bps
                </div>
              </div>
            </div>
          </div>

          {/* Probability Distribution Bars */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Cenários de Decisão & Probabilidades (%)
            </h4>
            <div className="space-y-3">
              {activeMeeting.probabilities.map((bucket, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-800 font-semibold">{bucket.rateLabel}</span>
                    <span className="text-blue-700 font-bold font-mono">{bucket.probability}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden flex">
                    <div
                      style={{ width: `${bucket.probability}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        bucket.changeBps > 0
                          ? 'bg-rose-500'
                          : bucket.changeBps < 0
                          ? 'bg-emerald-500'
                          : 'bg-blue-600'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Evolution Comparison if present */}
          {activeMeeting.historicalProbabilities && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Evolução Histórica da Probabilidade Cenário Base
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-[11px] text-gray-500">Hoje</div>
                  <div className="text-base font-bold text-blue-700 font-mono mt-0.5">
                    {activeMeeting.historicalProbabilities.current}%
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-[11px] text-gray-500">1 Dia Atrás</div>
                  <div className="text-base font-bold text-gray-700 font-mono mt-0.5">
                    {activeMeeting.historicalProbabilities.oneDayAgo}%
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-[11px] text-gray-500">1 Semana Atrás</div>
                  <div className="text-base font-bold text-gray-700 font-mono mt-0.5">
                    {activeMeeting.historicalProbabilities.oneWeekAgo}%
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-[11px] text-gray-500">1 Mês Atrás</div>
                  <div className="text-base font-bold text-gray-700 font-mono mt-0.5">
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
