import React from 'react';
import { RpmReference } from '../../types/monetary';
import { X, BookOpen, ExternalLink, BarChart3, Info, CheckCircle } from 'lucide-react';

interface RpmDrawerProps {
  reference: RpmReference | null;
  onClose: () => void;
}

export const RpmDrawer: React.FC<RpmDrawerProps> = ({ reference, onClose }) => {
  if (!reference) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--surface)] text-[var(--ink)] shadow-2xl border-l border-[var(--border)] flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--page-bg)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--brand)]" />
          <div>
            <span className="text-[10px] font-mono font-bold text-[var(--brand)] uppercase tracking-wider">
              Referência Cruzada • {reference.quarter}
            </span>
            <h3 className="text-sm font-bold text-[var(--ink)] leading-tight font-serif">
              Relatório de Política Monetária (RPM)
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink)] rounded-md hover:bg-[var(--border)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
        {/* Section & Chapter Tag */}
        <div>
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[var(--accent-wash)] text-[var(--brand)] border border-[var(--border)]">
            {reference.chapter}
          </span>
          <h2 className="text-lg font-bold text-[var(--ink)] mt-2 font-serif">
            {reference.title}
          </h2>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            Tópico: <span className="font-semibold text-[var(--ink-secondary)]">{reference.topic}</span>
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-[var(--page-bg)] p-4 rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink-secondary)] mb-1.5">
            <Info className="w-4 h-4 text-[var(--brand)]" />
            <span>Síntese da Ata & Conexão com o RPM</span>
          </div>
          <p className="text-sm text-[var(--ink)] leading-relaxed font-serif">
            {reference.summary}
          </p>
        </div>

        {/* Key Insights List */}
        <div>
          <h4 className="text-xs font-mono font-bold text-[var(--ink)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Premissas & Números-Chave do Documento</span>
          </h4>
          <ul className="space-y-2">
            {reference.keyInsights.map((insight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-[var(--ink-secondary)] bg-[var(--page-bg)] p-2.5 rounded-lg border border-[var(--border)]"
              >
                <span className="text-[var(--brand)] font-bold">•</span>
                <span className="leading-normal">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Chart info if present */}
        {reference.chartDescription && (
          <div className="bg-[var(--accent-wash)] p-4 rounded-xl border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] mb-1">
              <BarChart3 className="w-4 h-4 text-[var(--brand)]" />
              <span>Gráfico / Modelo de Referência</span>
            </div>
            <p className="text-xs text-[var(--ink)] italic font-serif">
              {reference.chartDescription}
            </p>
          </div>
        )}

        {reference.pdfPage && (
          <div className="text-xs text-[var(--ink-muted)] bg-[var(--page-bg)] p-2 rounded text-center border border-[var(--border)]">
            Página no Relatório oficial: <span className="font-bold text-[var(--ink)]">página {reference.pdfPage}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--page-bg)] flex items-center justify-between">
        <span className="text-[11px] text-[var(--ink-muted)]">
          Fonte oficial: Banco Central do Brasil
        </span>
        <a
          href="https://www.bcb.gov.br/publicacoes/relatoriopolicamonetaria"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] hover:underline"
        >
          <span>Acessar RPM no Bacen</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
