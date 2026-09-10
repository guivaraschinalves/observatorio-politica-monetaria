export type Committee = 'copom' | 'fomc';

export interface RpmReference {
  id: string;
  topic: string;
  title: string;
  chapter: string;
  quarter: string; // ex: 'Mar/2026' ou 'Dez/2025'
  summary: string;
  keyInsights: string[];
  chartDescription?: string;
  pdfPage?: number;
  url?: string;
}

export interface StatementParagraph {
  id: string;
  section?: string;
  text: string;
  rpmRefId?: string; // id de RpmReference se aplicável
}

export interface MeetingData {
  id: string; // ex: 'copom-2026-03'
  committee: Committee;
  meetingNumber: string; // ex: '269ª' ou 'March 2026'
  date: string; // YYYY-MM-DD
  rateDecision: string; // ex: '10.75%' ou '5.25% - 5.50%'
  changeBps: number; // +25, -25, 0
  previousRate: string;
  voteSplit: string; // ex: 'Unânime (9x0)'
  summary: string;
  keyGuidance: string;
  statement: StatementParagraph[];
  minutes: StatementParagraph[];
  rpmReferences?: RpmReference[];
}

export interface SpeechItem {
  id: string;
  committee: Committee;
  speaker: string;
  role: string;
  isVoter: boolean;
  date: string; // YYYY-MM-DD
  time?: string;
  event: string;
  location: string;
  tone: 'hawkish' | 'dovish' | 'neutral';
  title: string;
  summary: string;
  keyQuotes: string[];
  fullTranscript: string;
  topics: string[];
  sourceUrl?: string;
}

export interface ProbabilityBucket {
  rateLabel: string;
  changeBps: number;
  probability: number; // 0 to 100
}

export interface MarketMeetingProbability {
  id: string;
  meetingDate: string;
  daysToMeeting: number;
  currentRate: string;
  impliedRate: string;
  expectedChangeBps: number;
  probabilities: ProbabilityBucket[];
  historicalProbabilities?: {
    current: number;
    oneDayAgo: number;
    oneWeekAgo: number;
    oneMonthAgo: number;
  };
}

export interface MarketOverview {
  committee: Committee;
  lastUpdated: string;
  terminalRate: string;
  terminalDate: string;
  totalCutsOrHikesExpectedBps: number;
  meetings: MarketMeetingProbability[];
}
