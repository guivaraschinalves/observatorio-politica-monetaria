import React from 'react';
import { SpeechItem } from '../../types/monetary';
import { X, ExternalLink, Calendar, MapPin, Quote } from 'lucide-react';

interface SpeechDetailModalProps {
  speech: SpeechItem | null;
  onClose: () => void;
}

export const SpeechDetailModal: React.FC<SpeechDetailModalProps> = ({ speech, onClose }) => {
  if (!speech) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/80 flex items-start justify-between">
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
                Tom: {speech.tone.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs font-semibold text-gray-700">
                {speech.committee === 'copom' ? '🇧🇷 Copom / Bacen' : '🇺🇸 FOMC / Fed'}
              </span>
              {speech.isVoter && (
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                  Membro Votante
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-serif">{speech.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
              <span className="font-semibold text-gray-800">{speech.speaker}</span>
              <span>({speech.role})</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {speech.date} {speech.time && `às ${speech.time}`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {speech.event} ({speech.location})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Quotes Box */}
          {speech.keyQuotes && speech.keyQuotes.length > 0 && (
            <div className="bg-blue-50/70 border-l-4 border-blue-600 p-4 rounded-r-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase">
                <Quote className="w-4 h-4 text-blue-600" />
                <span>Declarações de Destaque</span>
              </div>
              <ul className="space-y-1.5">
                {speech.keyQuotes.map((q, idx) => (
                  <li key={idx} className="text-xs text-blue-950 italic font-serif leading-relaxed">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Síntese Macroeconômica
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed font-serif bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              {speech.summary}
            </p>
          </div>

          {/* Full Transcript */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Transcrição / Discurso na Íntegra</span>
              <span className="text-[10px] font-normal text-gray-500">Texto Oficial</span>
            </h3>
            <div className="text-sm text-gray-800 leading-relaxed font-serif whitespace-pre-line p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              {speech.fullTranscript}
            </div>
          </div>

          {/* Topic Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-xs font-semibold text-gray-500 mr-1">Tópicos:</span>
            {speech.topics.map((t, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Fonte: Banco Central / Federal Reserve Press Office
          </span>
          {speech.sourceUrl && (
            <a
              href={speech.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <span>Ver no site oficial</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
