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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-emerald-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Referência Cruzada • {reference.quarter}
            </span>
            <h3 className="text-sm font-bold text-gray-900 leading-tight">
              Relatório de Política Monetária (RPM)
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-emerald-100/50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
        {/* Section & Chapter Tag */}
        <div>
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {reference.chapter}
          </span>
          <h2 className="text-lg font-bold text-gray-900 mt-2 font-serif">
            {reference.title}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tópico: <span className="font-semibold text-gray-700">{reference.topic}</span>
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Síntese da Ata & Conexão com o RPM</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed font-serif">
            {reference.summary}
          </p>
        </div>

        {/* Key Insights List */}
        <div>
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Premissas & Números-Chave do Documento</span>
          </h4>
          <ul className="space-y-2">
            {reference.keyInsights.map((insight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-gray-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200"
              >
                <span className="text-emerald-600 font-bold">•</span>
                <span className="leading-normal">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Chart info if present */}
        {reference.chartDescription && (
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-700" />
              <span>Gráfico / Modelo de Referência</span>
            </div>
            <p className="text-xs text-blue-800 italic">
              {reference.chartDescription}
            </p>
          </div>
        )}

        {reference.pdfPage && (
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded text-center">
            Página de referência no Relatório oficial: <span className="font-bold text-gray-800">página {reference.pdfPage}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <span className="text-[11px] text-gray-500">
          Fonte oficial: Banco Central do Brasil
        </span>
        <a
          href="https://www.bcb.gov.br/publicacoes/relatoriopolicamonetaria"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <span>Acessar RPM no Bacen</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
