export type Committee = 'copom' | 'fomc';

export interface StatementParagraph {
  id: string;
  section?: string;
  text: string;
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
}

export interface SpeechItem {
  id: string;
  committee: Committee;
  speaker: string;
  role: string;
  date: string; // YYYY-MM-DD
  time?: string;
  event: string;
  location: string;
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

export interface DotPlotRange {
  low: number;
  high: number;
}

export interface DotPlotRelease {
  id: string;
  date: string; // YYYY-MM-DD
  sourceUrl: string;
  years: string[]; // ex: ['2026', '2027', '2028', 'Longer run']
  median: number[];
  centralTendency: DotPlotRange[];
  range: DotPlotRange[];
}

export interface FomcDissenter {
  name: string; // sobrenome, como vem na planilha do Fed de St. Louis
  magnitudeBps: number | null; // null quando não dá pra extrair do texto do statement
}

export interface FomcVoteRecord {
  id: string;
  committee: 'fomc';
  meetingNumber: string;
  date: string; // YYYY-MM-DD
  chair: string | null;
  unanimous: boolean;
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  dissenters: FomcDissenter[];
}

export interface CopomVote {
  name: string | null; // null quando a planilha só tem o placar agregado (antes da 167ª reunião)
  count: number | null;
  preferredChangeBps: number | null;
  diffFromDecisionBps: number | null;
}

export interface CopomVoteRecord {
  id: string;
  committee: 'copom';
  meetingNumber: string;
  date: string; // YYYY-MM-DD
  rateDecision: string | null;
  changeBps: number | null;
  placar: string;
  unanimous: boolean;
  namedVotes: boolean;
  chair: string | null;
  votes: CopomVote[];
}
