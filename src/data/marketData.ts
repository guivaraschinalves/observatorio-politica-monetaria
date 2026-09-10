import { MarketOverview } from '../types/monetary';

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

export const fomcMarketOverview: MarketOverview = {
  committee: 'fomc',
  lastUpdated: 'September 10, 2026 - 16:00 ET',
  terminalRate: '3.75% - 4.00%',
  terminalDate: 'December 2026',
  totalCutsOrHikesExpectedBps: -50,
  meetings: [
    {
      id: 'fomc-next-1',
      meetingDate: 'May 06, 2026',
      daysToMeeting: 14,
      currentRate: '4.25% - 4.50%',
      impliedRate: '4.18%',
      expectedChangeBps: -18,
      probabilities: [
        { rateLabel: '4.25% - 4.50% (Hold)', changeBps: 0, probability: 28 },
        { rateLabel: '4.00% - 4.25% (-25 bps cut)', changeBps: -25, probability: 69 },
        { rateLabel: '3.75% - 4.00% (-50 bps cut)', changeBps: -50, probability: 3 }
      ],
      historicalProbabilities: {
        current: 69,
        oneDayAgo: 65,
        oneWeekAgo: 58,
        oneMonthAgo: 45
      }
    },
    {
      id: 'fomc-next-2',
      meetingDate: 'June 17, 2026',
      daysToMeeting: 56,
      currentRate: '4.25% - 4.50%',
      impliedRate: '4.05%',
      expectedChangeBps: -35,
      probabilities: [
        { rateLabel: '4.25% - 4.50% (Hold)', changeBps: 0, probability: 11 },
        { rateLabel: '4.00% - 4.25% (-25 bps)', changeBps: -25, probability: 52 },
        { rateLabel: '3.75% - 4.00% (-50 bps)', changeBps: -50, probability: 37 }
      ],
      historicalProbabilities: {
        current: 52,
        oneDayAgo: 50,
        oneWeekAgo: 46,
        oneMonthAgo: 38
      }
    },
    {
      id: 'fomc-next-3',
      meetingDate: 'July 29, 2026',
      daysToMeeting: 98,
      currentRate: '4.25% - 4.50%',
      impliedRate: '3.94%',
      expectedChangeBps: -48,
      probabilities: [
        { rateLabel: '4.00% - 4.25%', changeBps: -25, probability: 24 },
        { rateLabel: '3.75% - 4.00%', changeBps: -50, probability: 58 },
        { rateLabel: '3.50% - 3.75%', changeBps: -75, probability: 18 }
      ]
    },
    {
      id: 'fomc-next-4',
      meetingDate: 'September 23, 2026',
      daysToMeeting: 154,
      currentRate: '4.25% - 4.50%',
      impliedRate: '3.82%',
      expectedChangeBps: -62,
      probabilities: [
        { rateLabel: '3.75% - 4.00%', changeBps: -50, probability: 48 },
        { rateLabel: '3.50% - 3.75%', changeBps: -75, probability: 42 },
        { rateLabel: '3.25% - 3.50%', changeBps: -100, probability: 10 }
      ]
    }
  ]
};
