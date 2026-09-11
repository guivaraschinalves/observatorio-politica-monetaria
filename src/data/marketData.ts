import { MarketOverview } from '../types/monetary';
import fomcMarketRaw from './fomc_market_overview.json';

export const copomMarketOverview: MarketOverview = {
  committee: 'copom',
  lastUpdated: '10 de Setembro de 2026 - 17:15 BRT',
  terminalRate: '14.50%',
  terminalDate: 'Junho/2026',
  totalCutsOrHikesExpectedBps: 25,
  meetings: [
    {
      id: 'copom-next-1',
      meetingDate: '06 de Maio de 2026',
      daysToMeeting: 14,
      currentRate: '14.25%',
      impliedRate: '14.46%',
      expectedChangeBps: 21,
      probabilities: [
        { rateLabel: '14.25% (Manutenção)', changeBps: 0, probability: 16 },
        { rateLabel: '14.50% (+0.25 p.p.)', changeBps: 25, probability: 78 },
        { rateLabel: '14.75% (+0.50 p.p.)', changeBps: 50, probability: 6 }
      ],
      historicalProbabilities: {
        current: 78,
        oneDayAgo: 74,
        oneWeekAgo: 65,
        oneMonthAgo: 42
      }
    },
    {
      id: 'copom-next-2',
      meetingDate: '17 de Junho de 2026',
      daysToMeeting: 56,
      currentRate: '14.25%',
      impliedRate: '14.52%',
      expectedChangeBps: 27,
      probabilities: [
        { rateLabel: '14.25% (0 acumulado)', changeBps: 0, probability: 12 },
        { rateLabel: '14.50% (+25 bps acumulados)', changeBps: 25, probability: 68 },
        { rateLabel: '14.75% (+50 bps acumulados)', changeBps: 50, probability: 20 }
      ],
      historicalProbabilities: {
        current: 68,
        oneDayAgo: 66,
        oneWeekAgo: 58,
        oneMonthAgo: 35
      }
    },
    {
      id: 'copom-next-3',
      meetingDate: '05 de Agosto de 2026',
      daysToMeeting: 105,
      currentRate: '14.25%',
      impliedRate: '14.48%',
      expectedChangeBps: 23,
      probabilities: [
        { rateLabel: '14.25% (Manutenção)', changeBps: 0, probability: 25 },
        { rateLabel: '14.50% (Pausa no topo)', changeBps: 25, probability: 62 },
        { rateLabel: '14.25% ou menor (-corte)', changeBps: -25, probability: 13 }
      ]
    },
    {
      id: 'copom-next-4',
      meetingDate: '16 de Setembro de 2026',
      daysToMeeting: 147,
      currentRate: '14.25%',
      impliedRate: '14.35%',
      expectedChangeBps: 10,
      probabilities: [
        { rateLabel: '14.50% (Pausa)', changeBps: 25, probability: 54 },
        { rateLabel: '14.25% (-25 bps corte inicial)', changeBps: 0, probability: 36 },
        { rateLabel: '14.00% (-50 bps corte)', changeBps: -25, probability: 10 }
      ]
    }
  ]
};

// Dados reais do Market Probability Tracker do Fed de Atlanta — ver
// scripts/fetch_fomc_probabilities.py. Atualiza sozinho todo dia (mesmo
// workflow que atualiza os comunicados).
export const fomcMarketOverview: MarketOverview = fomcMarketRaw as MarketOverview;
