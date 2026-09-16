import React, { useState } from 'react';
import { Committee } from './types/monetary';
import { AnnotationProvider } from './context/AnnotationContext';
import { allCopomStatements, allFomcStatements } from './data/allStatements';
import { copomMeetings } from './data/copomData';
import { fomcMeetings } from './data/fomcData';
import { copomMarketOverview, fomcMarketOverview } from './data/marketData';
import { speechesData } from './data/speechesData';
import { fomcDotPlotReleases } from './data/dotPlotData';
import { copomVoteHistory, fomcVoteHistory } from './data/dissentsData';
import { Header } from './components/layout/Header';
import { StatementComparator } from './components/diff/StatementComparator';
import { MinutesReader } from './components/minutes/MinutesReader';
import { MarketProbabilitiesView } from './components/probabilities/MarketProbabilitiesView';
import { SpeechesCalendar } from './components/speeches/SpeechesCalendar';
import { DotPlotComparator } from './components/dotplot/DotPlotComparator';
import { DissentsView } from './components/dissents/DissentsView';

type Tab = 'comparator' | 'minutes' | 'probabilities' | 'speeches' | 'dotplot' | 'dissents';

const ObservatoryContent: React.FC = () => {
  const [committee, setCommittee] = useState<Committee>('copom');
  const [activeTab, setActiveTab] = useState<Tab>('comparator');

  const statements = committee === 'copom' ? allCopomStatements : allFomcStatements;
  const meetings = committee === 'copom' ? copomMeetings : fomcMeetings;
  const marketOverview = committee === 'copom' ? copomMarketOverview : fomcMarketOverview;

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--ink)] flex flex-col font-sans selection:bg-[var(--accent-wash)] selection:text-[var(--brand)] transition-colors">
      {/* Top Navbar */}
      <Header
        committee={committee}
        onSelectCommittee={setCommittee}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'comparator' && (
          <StatementComparator statements={statements} committee={committee} />
        )}

        {activeTab === 'minutes' && (
          <MinutesReader meetings={meetings} committee={committee} />
        )}

        {activeTab === 'probabilities' && (
          <MarketProbabilitiesView overview={marketOverview} committee={committee} />
        )}

        {activeTab === 'speeches' && (
          <SpeechesCalendar speeches={speechesData} defaultCommittee={committee} />
        )}

        {activeTab === 'dotplot' && (
          committee === 'fomc' ? (
            <DotPlotComparator releases={fomcDotPlotReleases} />
          ) : (
            <div className="p-8 text-center text-[var(--ink-muted)] bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              O dot plot (Summary of Economic Projections) é uma ferramenta exclusiva do FOMC — o Copom
              não tem equivalente publicado. Troque para FOMC no topo da página.
            </div>
          )
        )}

        {activeTab === 'dissents' && (
          <DissentsView committee={committee} copomVotes={copomVoteHistory} fomcVotes={fomcVoteHistory} />
        )}
      </main>

      {/* Footer styled as FTM */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 mt-12 text-xs text-[var(--ink-muted)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--ink)]">Follow the Money</span>
            <span>•</span>
            <span className="font-serif italic">Observatório de Política Monetária</span>
          </div>
          <div className="text-[var(--ink-muted)]">
            Fontes: Banco Central do Brasil (Bacen - {allCopomStatements.length} comunicados), Federal Reserve Board (Fed - {allFomcStatements.length} statements), B3 e Fed de Atlanta.
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AnnotationProvider>
      <ObservatoryContent />
    </AnnotationProvider>
  );
}

export default App;
