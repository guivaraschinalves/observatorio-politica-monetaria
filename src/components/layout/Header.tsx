import React, { useEffect, useState } from 'react';
import { Committee } from '../../types/monetary';
import { GitCompare, BookOpen, TrendingUp, Mic, Github, ExternalLink, Sun, Moon, ScatterChart, Gavel, LineChart } from 'lucide-react';

type Tab = 'comparator' | 'minutes' | 'probabilities' | 'speeches' | 'dotplot' | 'dissents';

interface HeaderProps {
  committee: Committee;
  onSelectCommittee: (c: Committee) => void;
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  committee,
  onSelectCommittee,
  activeTab,
  onSelectTab,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ftm_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ftm_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-40 shadow-xs transition-colors">
      {/* Top tier brand and jurisdiction switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* FTM Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <svg
              className="text-[var(--brand)] shrink-0 transition-transform hover:scale-105"
              viewBox="1015 135 400 415"
              width="26"
              height="26"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M1210.27,141.85c-85.33,0-158.08,54.13-186.48,130.22h144.44c7.34,0,13.29-5.95,13.29-13.29v-69.58 c0-2.39,1.38-4.53,3.55-5.52c2.15-0.99,4.69-0.62,6.49,0.93l172.26,149.62c2.53,2.2,3.96,5.38,3.96,8.72s-1.44,6.53-3.96,8.72 L1191.56,501.3c-1.8,1.56-4.34,1.92-6.49,0.93c-2.16-0.99-3.55-3.13-3.55-5.5v-69.58c0-7.34-5.95-13.29-13.29-13.29H1023.8 c28.4,76.08,101.16,130.22,186.48,130.22c110.04,0,199.23-90.04,199.23-201.12S1320.31,141.85,1210.27,141.85z" />
            </svg>
            <div>
              <div className="font-serif text-[1.12rem] font-bold text-[var(--ink)] leading-none tracking-tight">
                Follow the Money
              </div>
              <div className="font-mono text-[0.66rem] tracking-[0.09em] uppercase text-[var(--ink-muted)] mt-1 font-semibold">
                Observatório de Política Monetária
              </div>
            </div>
          </div>

          {/* Committee Switcher */}
          <div className="flex items-center bg-[var(--page-bg)] p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => onSelectCommittee('copom')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                committee === 'copom'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs border border-[var(--border)] font-bold'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              <span className="text-sm">🇧🇷</span>
              <span>Copom (Bacen)</span>
            </button>
            <button
              onClick={() => onSelectCommittee('fomc')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                committee === 'fomc'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs border border-[var(--border)] font-bold'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              <span className="text-sm">🇺🇸</span>
              <span>FOMC (Fed)</span>
            </button>
          </div>

          {/* Actions: Theme Toggle & GitHub */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={toggleTheme}
              title={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
              className="p-2 rounded-lg text-[var(--ink-secondary)] hover:text-[var(--ink)] bg-[var(--page-bg)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <a
              href="https://guivaraschinalves.github.io/ftm-chartbook/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)] bg-[var(--page-bg)] hover:bg-[var(--border)] px-3 py-1.5 rounded-lg border border-[var(--border)] transition-colors"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chart Book</span>
              <ExternalLink className="w-3 h-3 text-[var(--ink-muted)]" />
            </a>

            <a
              href="https://github.com/guivaraschinalves/observatorio-politica-monetaria"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)] bg-[var(--page-bg)] hover:bg-[var(--border)] px-3 py-1.5 rounded-lg border border-[var(--border)] transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
              <ExternalLink className="w-3 h-3 text-[var(--ink-muted)]" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-[var(--border)] bg-[var(--page-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2">
            <button
              onClick={() => onSelectTab('comparator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'comparator'
                  ? 'bg-[var(--surface)] text-[var(--brand)] shadow-xs border border-[var(--border)] font-bold'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
              }`}
            >
              <GitCompare className="w-4 h-4 text-[var(--brand)]" />
              <span>Comparador de Comunicados</span>
            </button>

            <button
              onClick={() => onSelectTab('minutes')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'minutes'
                  ? 'bg-[var(--surface)] text-[var(--brand)] shadow-xs border border-[var(--border)] font-bold'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Leitor de Atas / Minutas</span>
            </button>

            <button
              onClick={() => onSelectTab('probabilities')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'probabilities'
                  ? 'bg-[var(--surface)] text-[var(--brand)] shadow-xs border border-[var(--border)] font-bold'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Probabilidades de Mercado</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[var(--accent-wash)] text-[var(--brand)] rounded-md text-[10px] font-mono font-bold">
                {committee === 'copom' ? 'DI1 B3' : 'Fed Atlanta'}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('speeches')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'speeches'
                  ? 'bg-[var(--surface)] text-[var(--brand)] shadow-xs border border-[var(--border)] font-bold'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
              }`}
            >
              <Mic className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Calendário & Discursos</span>
            </button>

            {committee === 'fomc' && (
              <button
                onClick={() => onSelectTab('dotplot')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === 'dotplot'
                    ? 'bg-[var(--surface)] text-[var(--brand)] shadow-xs border border-[var(--border)] font-bold'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
                }`}
              >
                <ScatterChart className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Dot Plot</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('dissents')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'dissents'
                  ? 'bg-[var(--surface)] text-[var(--brand)] shadow-xs border border-[var(--border)] font-bold'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
              }`}
            >
              <Gavel className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Dissidências</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
