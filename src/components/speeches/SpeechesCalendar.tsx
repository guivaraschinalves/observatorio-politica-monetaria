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
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Aviso de Período de Silêncio (Blackout Period)
          </h4>
          <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
            Tanto o <strong>Copom</strong> (da quarta-feira anterior até a publicação da ata) quanto o <strong>FOMC</strong> (da segunda semana anterior até a quinta-feira pós-decisão) proíbem pronunciamentos públicos de membros com direito a voto sobre conjuntura ou política monetária durante o período de silêncio.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por orador, tema (ex: inflação, hiato, emprego) ou trecho..."
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg pl-9 pr-3 py-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Committee Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-medium">Comitê:</span>
            <select
              value={filterCommittee}
              onChange={(e) => setFilterCommittee(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg px-2.5 py-1.5 font-medium"
            >
              <option value="all">Todos (Copom & FOMC)</option>
              <option value="copom">🇧🇷 Apenas Copom (Bacen)</option>
              <option value="fomc">🇺🇸 Apenas FOMC (Fed)</option>
            </select>
          </div>

          {/* Tone Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-medium">Tom:</span>
            <select
              value={filterTone}
              onChange={(e) => setFilterTone(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg px-2.5 py-1.5 font-medium"
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
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200 text-gray-500">
            Nenhum discurso encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredSpeeches.map((speech) => (
            <div
              key={speech.id}
              className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-sm hover:border-gray-300 transition-all p-5 space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        speech.tone === 'hawkish'
                          ? 'bg-rose-100 text-rose-800'
                          : speech.tone === 'dovish'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {speech.tone.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {speech.committee === 'copom' ? '🇧🇷 Copom / Bacen' : '🇺🇸 FOMC / Fed'}
                    </span>
                    {speech.isVoter && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                        Votante
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 font-serif">{speech.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                    <span className="font-bold text-gray-800">{speech.speaker}</span>
                    <span>•</span>
                    <span>{speech.role}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Ler Transcrição Completa</span>
                </button>
              </div>

              {/* Summary */}
              <p className="text-sm text-gray-700 font-serif leading-relaxed">
                {speech.summary}
              </p>

              {/* Key Quote Snippet */}
              {speech.keyQuotes && speech.keyQuotes[0] && (
                <div className="bg-stone-50 border-l-3 border-blue-500 p-2.5 rounded-r-lg text-xs italic text-gray-800 font-serif">
                  {speech.keyQuotes[0]}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {speech.topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium"
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
