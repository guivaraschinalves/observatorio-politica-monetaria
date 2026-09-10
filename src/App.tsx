import React, { useState } from 'react';
import { Committee } from './types/monetary';
import { AnnotationProvider, useAnnotations } from './context/AnnotationContext';
import { copomMeetings } from './data/copomData';
import { fomcMeetings } from './data/fomcData';
import { copomMarketOverview, fomcMarketOverview } from './data/marketData';
import { speechesData } from './data/speechesData';
import { Header } from './components/layout/Header';
import { StatementComparator } from './components/diff/StatementComparator';
import { MinutesReader } from './components/minutes/MinutesReader';
import { MarketProbabilitiesView } from './components/probabilities/MarketProbabilitiesView';
import { SpeechesCalendar } from './components/speeches/SpeechesCalendar';
import { NotesNotebookView } from './components/annotations/NotesNotebookView';

const ObservatoryContent: React.FC = () => {
  const [committee, setCommittee] = useState<Committee>('copom');
  const [activeTab, setActiveTab] = useState<'comparator' | 'minutes' | 'probabilities' | 'speeches' | 'notes'>('comparator');
  const { annotations } = useAnnotations();

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
        totalAnnotationsCount={annotations.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'comparator' && (
          <StatementComparator meetings={meetings} committee={committee} />
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

        {activeTab === 'notes' && (
          <NotesNotebookView />
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
            Fontes: Banco Central do Brasil (Bacen), Federal Reserve Board (Fed), B3 e CME Group.
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
