import React, { useState, useMemo } from 'react';
import { MeetingData, Committee, RpmReference } from '../../types/monetary';
import { TextAnnotatorWrapper } from '../annotations/TextAnnotatorWrapper';
import { RpmDrawer } from './RpmDrawer';
import { BookOpen, Bookmark, Sparkles, ChevronRight } from 'lucide-react';

interface MinutesReaderProps {
  meetings: MeetingData[];
  committee: Committee;
}

export const MinutesReader: React.FC<MinutesReaderProps> = ({ meetings, committee }) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [activeRpmRef, setActiveRpmRef] = useState<RpmReference | null>(null);

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

  const rpmRefsMap = useMemo(() => {
    const map = new Map<string, RpmReference>();
    currentMeeting?.rpmReferences?.forEach((ref) => {
      map.set(ref.id, ref);
    });
    return map;
  }, [currentMeeting]);

  if (!currentMeeting) {
    return <div className="p-8 text-center text-gray-500">Nenhuma ata disponível.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Selecione a Reunião / Ata:
          </span>
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg px-3 py-1.5 font-medium focus:ring-blue-500 focus:border-blue-500"
          >
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.meetingNumber} ({m.date}) - Taxa: {m.rateDecision}
              </option>
            ))}
          </select>
        </div>

        {/* Quick info badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {committee === 'copom'
                ? 'Atas com Referências Cruzadas ao RPM'
                : 'Minutes with SEP Dot Plot References'}
            </span>
          </span>
        </div>
      </div>

      {/* Main Reading Container with Sticky Table of Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents & RPM Links Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs sticky top-28 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                <span>Estrutura do Documento</span>
              </h3>
              <nav className="mt-2.5 space-y-1 text-xs">
                {sections.map(([secTitle], idx) => (
                  <a
                    key={idx}
                    href={`#sec-${idx}`}
                    className="flex items-center justify-between text-gray-600 hover:text-blue-600 py-1 px-1.5 rounded hover:bg-gray-50 transition-colors"
                  >
                    <span className="truncate">{secTitle}</span>
                    <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                  </a>
                ))}
              </nav>
            </div>

            {/* Direct RPM Links in this meeting */}
            {currentMeeting.rpmReferences && currentMeeting.rpmReferences.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Referências ao RPM ({committee === 'copom' ? 'Bacen' : 'Fed'})</span>
                </h3>
                <div className="mt-2 space-y-1.5">
                  {currentMeeting.rpmReferences.map((ref) => (
                    <button
                      key={ref.id}
                      onClick={() => setActiveRpmRef(ref)}
                      className="w-full text-left p-2 rounded-lg bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 transition-colors group"
                    >
                      <div className="text-[11px] font-bold text-emerald-900 line-clamp-1 group-hover:text-emerald-950">
                        {ref.title}
                      </div>
                      <div className="text-[10px] text-emerald-700">{ref.quarter} • {ref.chapter}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reader Body */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs">
            {/* Document Header */}
            <div className="border-b border-gray-200 pb-6 mb-8 text-center sm:text-left">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                {committee === 'copom' ? 'Banco Central do Brasil • Copom' : 'Federal Reserve • FOMC'}
              </span>
              <h1 className="text-2xl font-bold font-serif text-gray-900 mt-1">
                Ata da {currentMeeting.meetingNumber} ({currentMeeting.date})
              </h1>
              <p className="text-sm text-gray-600 mt-2 font-serif max-w-3xl leading-relaxed">
                {currentMeeting.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium text-gray-700">
                  Taxa fixada: <strong>{currentMeeting.rateDecision}</strong>
                </span>
                <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium text-gray-700">
                  Votação: <strong>{currentMeeting.voteSplit}</strong>
                </span>
                <span className="text-blue-600 font-medium">
                  💡 Dica: Selecione qualquer texto com o mouse para grifar, riscar ou anotar.
                </span>
              </div>
            </div>

            {/* Sections and Paragraphs */}
            <div className="space-y-8 font-serif">
              {sections.map(([secTitle, paragraphs], secIdx) => (
                <div key={`sec-${secIdx}`} id={`sec-${secIdx}`} className="space-y-4">
                  <h2 className="text-base font-sans font-bold text-gray-800 pb-2 border-b border-gray-100 tracking-tight">
                    {secTitle}
                  </h2>
                  <div className="space-y-5">
                    {paragraphs.map((p) => {
                      const rpmRef = p.rpmRefId ? rpmRefsMap.get(p.rpmRefId) : null;
                      return (
                        <div
                          key={p.id}
                          className="p-4 rounded-xl border border-transparent hover:border-gray-200 hover:bg-stone-50/40 transition-all"
                        >
                          <TextAnnotatorWrapper
                            documentId={`minutes-${currentMeeting.id}`}
                            paragraphId={p.id}
                            text={p.text}
                            className="text-base text-gray-800 leading-relaxed"
                          />

                          {/* Interactive RPM Cross Reference Badge */}
                          {rpmRef && (
                            <div className="mt-3 flex items-center">
                              <button
                                onClick={() => setActiveRpmRef(rpmRef)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 transition-colors shadow-2xs"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Ver no Relatório de Política Monetária (RPM):</span>
                                <strong className="underline">{rpmRef.title}</strong>
                                <span className="text-emerald-600 font-bold">↗</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RPM Reference Side Drawer */}
      <RpmDrawer reference={activeRpmRef} onClose={() => setActiveRpmRef(null)} />
    </div>
  );
};
