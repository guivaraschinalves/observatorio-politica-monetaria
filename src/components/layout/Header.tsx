import React from 'react';
import { Committee } from '../../types/monetary';
import { GitCompare, BookOpen, TrendingUp, Mic, Edit3, Github, ExternalLink } from 'lucide-react';

interface HeaderProps {
  committee: Committee;
  onSelectCommittee: (c: Committee) => void;
  activeTab: 'comparator' | 'minutes' | 'probabilities' | 'speeches' | 'notes';
  onSelectTab: (tab: 'comparator' | 'minutes' | 'probabilities' | 'speeches' | 'notes') => void;
  totalAnnotationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  committee,
  onSelectCommittee,
  activeTab,
  onSelectTab,
  totalAnnotationsCount,
}) => {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-xs">
      {/* Top tier brand and jurisdiction switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                  Follow The Money • Macro Intelligence
                </span>
              </div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Observatório de Política Monetária
              </h1>
            </div>
          </div>

          {/* Committee Switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
            <button
              onClick={() => onSelectCommittee('copom')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                committee === 'copom'
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80 font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-base">🇧🇷</span>
              <span>Copom (Bacen)</span>
            </button>
            <button
              onClick={() => onSelectCommittee('fomc')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                committee === 'fomc'
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80 font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-base">🇺🇸</span>
              <span>FOMC (Fed)</span>
            </button>
          </div>

          {/* External Links & Status */}
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/guivaraschinalves/observatorio-politica-monetaria"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-gray-100 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
            <button
              onClick={() => onSelectTab('comparator')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'comparator'
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <GitCompare className="w-4 h-4 text-blue-600" />
              <span>Comparador de Comunicados</span>
            </button>

            <button
              onClick={() => onSelectTab('minutes')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'minutes'
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Leitor de Atas / Minutas</span>
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                {committee === 'copom' ? 'RPM Bacen' : 'SEP Fed'}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('probabilities')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'probabilities'
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Probabilidades de Mercado</span>
              <span className="ml-1 px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-md text-[10px] font-bold">
                {committee === 'copom' ? 'DI1 / B3' : 'FedWatch'}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('speeches')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'speeches'
                  ? 'bg-white text-blue-700 shadow-xs border border-gray-200 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <Mic className="w-4 h-4 text-amber-600" />
              <span>Calendário & Discursos</span>
            </button>

            <button
              onClick={() => onSelectTab('notes')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ml-auto ${
                activeTab === 'notes'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Caderno de Anotações</span>
              {totalAnnotationsCount > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    activeTab === 'notes' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {totalAnnotationsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
