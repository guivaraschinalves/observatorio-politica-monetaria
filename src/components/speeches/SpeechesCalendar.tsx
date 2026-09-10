import React, { useState, useMemo } from 'react';
import { SpeechItem, Committee } from '../../types/monetary';
import { SpeechDetailModal } from './SpeechDetailModal';
import { Mic, Search, Calendar, MapPin, ShieldAlert } from 'lucide-react';

interface SpeechesCalendarProps {
  speeches: SpeechItem[];
  defaultCommittee?: Committee;
}

export const SpeechesCalendar: React.FC<SpeechesCalendarProps> = ({
  speeches,
  defaultCommittee,
}) => {
  const [filterCommittee, setFilterCommittee] = useState<string>(defaultCommittee || 'all');
  const [filterTone, setFilterTone] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSpeech, setSelectedSpeech] = useState<SpeechItem | null>(null);

  const filteredSpeeches = useMemo(() => {
    return speeches.filter((s) => {
      if (filterCommittee !== 'all' && s.committee !== filterCommittee) return false;
      if (filterTone !== 'all' && s.tone !== filterTone) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchSpeaker = s.speaker.toLowerCase().includes(query);
        const matchTitle = s.title.toLowerCase().includes(query);
        const matchTopics = s.topics.some((t) => t.toLowerCase().includes(query));
        const matchTranscript = s.fullTranscript.toLowerCase().includes(query);
        if (!matchSpeaker && !matchTitle && !matchTopics && !matchTranscript) return false;
      }
      return true;
    });
  }, [speeches, filterCommittee, filterTone, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Blackout Period Warning */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-[var(--ink)]">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Aviso de Período de Silêncio (Blackout Period)
          </h4>
          <p className="text-xs text-[var(--ink-secondary)] mt-0.5 leading-relaxed font-serif">
            Tanto o <strong>Copom</strong> (da quarta-feira anterior até a publicação da ata) quanto o <strong>FOMC</strong> (da segunda semana anterior até a quinta-feira pós-decisão) proíbem pronunciamentos públicos de membros com direito a voto sobre conjuntura ou política monetária.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por orador, tema (inflação, hiato, emprego) ou trecho..."
            className="w-full bg-[var(--page-bg)] border border-[var(--border)] text-[var(--ink)] text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)] placeholder-[var(--ink-muted)]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Committee Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--ink-muted)] font-mono font-medium">Comitê:</span>
            <select
              value={filterCommittee}
              onChange={(e) => setFilterCommittee(e.target.value)}
              className="bg-[var(--page-bg)] border border-[var(--border)] text-[var(--ink)] rounded-lg px-2.5 py-1.5 font-medium focus:outline-hidden"
            >
              <option value="all">Todos (Copom & FOMC)</option>
              <option value="copom">🇧🇷 Apenas Copom (Bacen)</option>
              <option value="fomc">🇺🇸 Apenas FOMC (Fed)</option>
            </select>
          </div>

          {/* Tone Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--ink-muted)] font-mono font-medium">Tom:</span>
            <select
              value={filterTone}
              onChange={(e) => setFilterTone(e.target.value)}
              className="bg-[var(--page-bg)] border border-[var(--border)] text-[var(--ink)] rounded-lg px-2.5 py-1.5 font-medium focus:outline-hidden"
            >
              <option value="all">Todos os Tons</option>
              <option value="hawkish">🔴 Hawkish (Aperto)</option>
              <option value="dovish">🟢 Dovish (Alívio)</option>
              <option value="neutral">🔵 Neutro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Speeches Cards List */}
      <div className="space-y-4">
        {filteredSpeeches.length === 0 ? (
          <div className="bg-[var(--surface)] p-12 text-center rounded-xl border border-[var(--border)] text-[var(--ink-muted)]">
            Nenhum discurso encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredSpeeches.map((speech) => (
            <div
              key={speech.id}
              className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs hover:border-[var(--brand)] transition-all p-5 space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        speech.tone === 'hawkish'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                          : speech.tone === 'dovish'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-[var(--accent-wash)] text-[var(--brand)] border border-[var(--border)]'
                      }`}
                    >
                      {speech.tone.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                      {speech.committee === 'copom' ? '🇧🇷 Copom / Bacen' : '🇺🇸 FOMC / Fed'}
                    </span>
                    {speech.isVoter && (
                      <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-mono font-bold border border-amber-500/30">
                        Votante
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--ink)] font-serif">{speech.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)] mt-1">
                    <span className="font-bold text-[var(--ink)]">{speech.speaker}</span>
                    <span>•</span>
                    <span>{speech.role}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {speech.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {speech.event}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSpeech(speech)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-wash)] hover:opacity-90 text-[var(--brand)] rounded-lg text-xs font-semibold transition-opacity shrink-0 border border-[var(--border)]"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Ler Transcrição Completa</span>
                </button>
              </div>

              {/* Summary */}
              <p className="text-sm text-[var(--ink-secondary)] font-serif leading-relaxed">
                {speech.summary}
              </p>

              {/* Key Quote Snippet */}
              {speech.keyQuotes && speech.keyQuotes[0] && (
                <div className="bg-[var(--page-bg)] border-l-3 border-[var(--brand)] p-3 rounded-r-lg text-xs italic text-[var(--ink)] font-serif">
                  {speech.keyQuotes[0]}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {speech.topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-[var(--page-bg)] text-[var(--ink-secondary)] border border-[var(--border)] font-mono"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Speech Modal */}
      <SpeechDetailModal speech={selectedSpeech} onClose={() => setSelectedSpeech(null)} />
    </div>
  );
};
