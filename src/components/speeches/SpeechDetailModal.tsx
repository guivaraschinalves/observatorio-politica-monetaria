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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-[var(--surface)] text-[var(--ink)] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[var(--border)] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--border)] bg-[var(--page-bg)] flex items-start justify-between">
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
                Tom: {speech.tone.toUpperCase()}
              </span>
              <span className="text-xs text-[var(--ink-muted)]">•</span>
              <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                {speech.committee === 'copom' ? '🇧🇷 Copom / Bacen' : '🇺🇸 FOMC / Fed'}
              </span>
              {speech.isVoter && (
                <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-mono font-bold border border-amber-500/30">
                  Membro Votante
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[var(--ink)] font-serif">{speech.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-muted)] mt-2">
              <span className="font-bold text-[var(--ink)]">{speech.speaker}</span>
              <span>({speech.role})</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
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
            className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] rounded-lg hover:bg-[var(--border)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Quotes Box */}
          {speech.keyQuotes && speech.keyQuotes.length > 0 && (
            <div className="bg-[var(--accent-wash)] border-l-4 border-[var(--brand)] p-4 rounded-r-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--brand)] uppercase">
                <Quote className="w-4 h-4 text-[var(--brand)]" />
                <span>Declarações de Destaque</span>
              </div>
              <ul className="space-y-1.5">
                {speech.keyQuotes.map((q, idx) => (
                  <li key={idx} className="text-xs text-[var(--ink)] italic font-serif leading-relaxed">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          <div>
            <h3 className="text-xs font-mono font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
              Síntese Macroeconômica
            </h3>
            <p className="text-sm text-[var(--ink-secondary)] leading-relaxed font-serif bg-[var(--page-bg)] p-3.5 rounded-xl border border-[var(--border)]">
              {speech.summary}
            </p>
          </div>

          {/* Full Transcript */}
          <div>
            <h3 className="text-xs font-mono font-bold text-[var(--ink)] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Transcrição / Discurso na Íntegra</span>
              <span className="text-[10px] font-mono text-[var(--ink-muted)]">Texto Oficial</span>
            </h3>
            <div className="text-sm text-[var(--ink)] leading-relaxed font-serif whitespace-pre-line p-4 rounded-xl border border-[var(--border)] bg-[var(--page-bg)]/50">
              {speech.fullTranscript}
            </div>
          </div>

          {/* Topic Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-xs font-mono font-semibold text-[var(--ink-muted)] mr-1">Tópicos:</span>
            {speech.topics.map((t, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-0.5 rounded-md bg-[var(--page-bg)] text-[var(--ink-secondary)] border border-[var(--border)] font-mono"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--page-bg)] flex items-center justify-between">
          <span className="text-xs text-[var(--ink-muted)] font-mono">
            Fonte: Banco Central / Federal Reserve Press Office
          </span>
          {speech.sourceUrl && (
            <a
              href={speech.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:underline"
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
