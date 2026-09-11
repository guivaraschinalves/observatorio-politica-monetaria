import React, { useState, useMemo } from 'react';
import { MeetingData, Committee } from '../../types/monetary';
import { TextAnnotatorWrapper } from '../annotations/TextAnnotatorWrapper';
import { BookOpen, Bookmark, ChevronRight } from 'lucide-react';

interface MinutesReaderProps {
  meetings: MeetingData[];
  committee: Committee;
}

export const MinutesReader: React.FC<MinutesReaderProps> = ({ meetings, committee }) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');

  const currentMeeting = useMemo(() => {
    return meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  }, [meetings, selectedMeetingId]);

  // Group minutes paragraphs by section
  const sections = useMemo(() => {
    if (!currentMeeting) return [];
    const map = new Map<string, typeof currentMeeting.minutes>();
    currentMeeting.minutes.forEach((p) => {
      const sec = p.section || 'Geral';
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)?.push(p);
    });
    return Array.from(map.entries());
  }, [currentMeeting]);

  if (!currentMeeting) {
    return <div className="p-8 text-center text-[var(--ink-muted)]">Nenhuma ata disponível.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
            Selecione a Reunião / Ata:
          </span>
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="bg-[var(--page-bg)] border border-[var(--border)] text-[var(--ink)] text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-hidden focus:ring-1 focus:ring-[var(--brand)]"
          >
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.meetingNumber} ({m.date}) - Taxa: {m.rateDecision}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Reading Container with Sticky Table of Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents Sidebar */}
        <div className="space-y-4">
          <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs sticky top-28">
            <h3 className="text-xs font-mono font-bold text-[var(--ink)] uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span>Estrutura da Ata</span>
            </h3>
            <nav className="mt-2.5 space-y-1 text-xs">
              {sections.map(([secTitle], idx) => (
                <a
                  key={idx}
                  href={`#sec-${idx}`}
                  className="flex items-center justify-between text-[var(--ink-secondary)] hover:text-[var(--brand)] py-1 px-1.5 rounded hover:bg-[var(--page-bg)] transition-colors"
                >
                  <span className="truncate">{secTitle}</span>
                  <ChevronRight className="w-3 h-3 text-[var(--ink-muted)] shrink-0" />
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Reader Body */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[var(--surface)] p-8 rounded-xl border border-[var(--border)] shadow-xs">
            {/* Document Header */}
            <div className="border-b border-[var(--border)] pb-6 mb-8 text-center sm:text-left">
              <span className="text-xs font-mono font-bold text-[var(--brand)] uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {committee === 'copom' ? 'Banco Central do Brasil • Copom' : 'Federal Reserve • FOMC'}
              </span>
              <h1 className="text-2xl font-bold font-serif text-[var(--ink)] mt-1">
                Ata da {currentMeeting.meetingNumber} ({currentMeeting.date})
              </h1>
              <p className="text-sm text-[var(--ink-secondary)] mt-2 font-serif max-w-3xl leading-relaxed">
                {currentMeeting.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-muted)]">
                <span className="bg-[var(--page-bg)] px-2.5 py-1 rounded-md font-medium text-[var(--ink)] border border-[var(--border)]">
                  Taxa fixada: <strong>{currentMeeting.rateDecision}</strong>
                </span>
                <span className="bg-[var(--page-bg)] px-2.5 py-1 rounded-md font-medium text-[var(--ink)] border border-[var(--border)]">
                  Votação: <strong>{currentMeeting.voteSplit}</strong>
                </span>
                <span className="text-[var(--brand)] font-medium">
                  💡 Selecione qualquer texto com o mouse para grifar ou anotar.
                </span>
              </div>
            </div>

            {/* Sections and Paragraphs */}
            <div className="space-y-8 font-serif">
              {sections.map(([secTitle, paragraphs], secIdx) => (
                <div key={`sec-${secIdx}`} id={`sec-${secIdx}`} className="space-y-4">
                  <h2 className="text-base font-sans font-bold text-[var(--ink)] pb-2 border-b border-[var(--border)] tracking-tight">
                    {secTitle}
                  </h2>
                  <div className="space-y-5">
                    {paragraphs.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl border border-transparent hover:border-[var(--border)] hover:bg-[var(--page-bg)]/50 transition-all"
                      >
                        <TextAnnotatorWrapper
                          documentId={`minutes-${currentMeeting.id}`}
                          paragraphId={p.id}
                          text={p.text}
                          className="text-base text-[var(--ink)] leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
