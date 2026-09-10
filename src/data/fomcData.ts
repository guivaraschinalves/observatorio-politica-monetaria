import { MeetingData } from '../types/monetary';

export const fomcMeetings: MeetingData[] = [
  {
    id: 'fomc-2026-03',
    committee: 'fomc',
    meetingNumber: 'March 2026 Meeting',
    date: '2026-03-18',
    rateDecision: '4.25% - 4.50%',
    changeBps: -25,
    previousRate: '4.50% - 4.75%',
    voteSplit: 'Majority (10-2, Bowman & Schmid dissenting)',
    summary: 'The Federal Open Market Committee decided to lower the target range for the federal funds rate by 25 basis points to 4-1/4 to 4-1/2 percent, citing balanced risks to inflation and employment, while two members preferred maintaining the rate.',
    keyGuidance: 'In considering additional adjustments to the target range for the federal funds rate, the Committee will carefully assess incoming data, the evolving outlook, and the balance of risks.',
    rpmReferences: [
      {
        id: 'fomc-sep-2026q1',
        topic: 'Summary of Economic Projections (SEP / Dot Plot)',
        title: 'March 2026 SEP Projections & Median Terminal Rate',
        chapter: 'SEP Appendix: Target Rate Trajectory',
        quarter: 'Mar/2026',
        summary: 'The median participant projected the federal funds rate at 3.9% at the end of 2026 and 3.4% at the end of 2027, with the long-run neutral rate estimated at 3.0%.',
        keyInsights: [
          'Core PCE inflation projected at 2.4% in 2026 and 2.1% in 2027.',
          'Real GDP growth forecast revised slightly upward to 2.1% for 2026.',
          'Unemployment rate expected to stabilize around 4.2%.'
        ],
        chartDescription: 'Figure 2: Distribution of FOMC participants’ judgment on the appropriate level of the target federal funds rate.',
        pdfPage: 12
      },
      {
        id: 'fomc-qt-balance-sheet',
        topic: 'Balance Sheet Reduction (Quantitative Tightening)',
        title: 'Adjustment in the Pace of Balance Sheet Runoff',
        chapter: 'Policy Implementation Note',
        quarter: 'Mar/2026',
        summary: 'The Committee announced it will slow the monthly cap on Treasury redemptions from $25 billion to $20 billion, leaving the agency debt and MBS redemption cap unchanged at $35 billion.',
        keyInsights: [
          'Designed to ensure an orderly transition toward ample reserves regime.',
          'Overnight Reverse Repo (ON RRP) facility take-up has stabilized near $150 billion.'
        ],
        pdfPage: 5
      }
    ],
    statement: [
      {
        id: 'f26-p1',
        section: 'Economic Assessment',
        text: 'Recent indicators suggest that economic activity has continued to expand at a solid pace. Job gains have moderated, and the unemployment rate has edged up but remains low. Inflation has made substantial progress toward the Committee’s 2 percent objective but remains somewhat elevated.'
      },
      {
        id: 'f26-p2',
        section: 'Mandate & Balance of Risks',
        text: 'The Committee seeks to achieve maximum employment and inflation at the rate of 2 percent over the longer run. The Committee judges that the risks to achieving its employment and inflation goals are roughly in balance. The economic outlook is uncertain, and the Committee is attentive to the risks to both sides of its dual mandate.'
      },
      {
        id: 'f26-p3',
        section: 'Rate Decision',
        text: 'In support of its goals, the Committee decided to lower the target range for the federal funds rate by 1/4 percentage point to 4-1/4 to 4-1/2 percent. In considering additional adjustments to the target range for the federal funds rate, the Committee will carefully assess incoming data, the evolving outlook, and the balance of risks.',
        rpmRefId: 'fomc-sep-2026q1'
      },
      {
        id: 'f26-p4',
        section: 'Balance Sheet (QT)',
        text: 'The Committee will continue reducing its holdings of Treasury securities and agency debt and agency mortgage-backed securities, though at a moderately adjusted pace consistent with plans announced previously.',
        rpmRefId: 'fomc-qt-balance-sheet'
      },
      {
        id: 'f26-p5',
        section: 'Assessment Criteria',
        text: 'In assessing the appropriate stance of monetary policy, the Committee will continue to monitor the implications of incoming information for the economic outlook. The Committee’s assessments will take into account a wide range of information, including readings on labor market conditions, inflation pressures and inflation expectations, and financial and international developments.'
      },
      {
        id: 'f26-p6',
        section: 'Voting Record',
        text: 'Voting for the monetary policy action were Jerome H. Powell, Chair; John C. Williams, Vice Chair; Thomas I. Barkin; Michael S. Barr; Raphael W. Bostic; Lisa D. Cook; Mary C. Daly; Philip N. Jefferson; Adriana D. Kugler; and Christopher J. Waller. Voting against the action were Michelle W. Bowman and Jeffrey R. Schmid, who preferred to maintain the target range for the federal funds rate at 4-1/2 to 4-3/4 percent at this meeting.'
      }
    ],
    minutes: [
      {
        id: 'fm26-p1',
        section: 'Staff Review of the Economic Situation',
        text: 'The information available at the time of the meeting suggested that real gross domestic product (GDP) continued to rise at a solid pace in the first quarter. Payroll employment gains cooled to an average of 140,000 per month over the previous three months. The consumer price index (CPI) and core PCE deflator demonstrated continued disinflation in core services excluding housing, although housing services inflation declined more slowly than anticipated.'
      },
      {
        id: 'fm26-p2',
        section: 'Participants’ Views on Current Conditions and Outlook',
        text: 'In discussing the household sector, participants noted that consumer spending remained healthy, supported by steady real income growth and solid balance sheets for higher-income households. However, several participants observed signs of increased financial strain among lower- and middle-income families, reflected in rising credit card and auto loan delinquency rates.'
      },
      {
        id: 'fm26-p3',
        section: 'Committee Policy Action & Forward Guidance',
        text: 'In their discussion of monetary policy, all participants agreed that it was appropriate to maintain a data-dependent approach. A significant majority favored reducing the target range by 25 basis points, viewing this recalibration as consistent with supporting a durable labor market expansion while inflation continues its trajectory toward 2 percent. Two participants dissented, emphasizing that underlying inflation measures remained stubborn and warranted maintaining the prevailing restriction longer.',
        rpmRefId: 'fomc-sep-2026q1'
      }
    ]
  },
  {
    id: 'fomc-2026-01',
    committee: 'fomc',
    meetingNumber: 'January 2026 Meeting',
    date: '2026-01-28',
    rateDecision: '4.50% - 4.75%',
    changeBps: 0,
    previousRate: '4.50% - 4.75%',
    voteSplit: 'Unanimous (12-0)',
    summary: 'The Federal Open Market Committee decided to maintain the target range for the federal funds rate at 4-1/2 to 4-3/4 percent, waiting for greater confidence that inflation is moving sustainably toward 2 percent.',
    keyGuidance: 'The Committee does not expect it will be appropriate to reduce the target range until it has gained greater confidence that inflation is moving sustainably toward 2 percent.',
    rpmReferences: [],
    statement: [
      {
        id: 'f25-p1',
        section: 'Economic Assessment',
        text: 'Recent indicators suggest that economic activity has continued to expand at a solid pace. Job gains have remained strong, and the unemployment rate has stayed low. Inflation has eased over the past year but remains elevated.'
      },
      {
        id: 'f25-p2',
        section: 'Mandate & Balance of Risks',
        text: 'The Committee seeks to achieve maximum employment and inflation at the rate of 2 percent over the longer run. The Committee judges that the risks to achieving its employment and inflation goals are moving into better balance. The economic outlook is uncertain, and the Committee remains highly attentive to inflation risks.'
      },
      {
        id: 'f25-p3',
        section: 'Rate Decision',
        text: 'In support of its goals, the Committee decided to maintain the target range for the federal funds rate at 4-1/2 to 4-3/4 percent. In considering any adjustments to the target range for the federal funds rate, the Committee will carefully assess incoming data, the evolving outlook, and the balance of risks. The Committee does not expect it will be appropriate to reduce the target range until it has gained greater confidence that inflation is moving sustainably toward 2 percent.'
      },
      {
        id: 'f25-p4',
        section: 'Balance Sheet (QT)',
        text: 'The Committee will continue reducing its holdings of Treasury securities and agency debt and agency mortgage-backed securities, as described in its previously announced plans.'
      },
      {
        id: 'f25-p5',
        section: 'Assessment Criteria',
        text: 'In assessing the appropriate stance of monetary policy, the Committee will continue to monitor the implications of incoming information for the economic outlook. The Committee’s assessments will take into account a wide range of information, including readings on labor market conditions, inflation pressures and inflation expectations, and financial and international developments.'
      },
      {
        id: 'f25-p6',
        section: 'Voting Record',
        text: 'Voting for the monetary policy action were Jerome H. Powell, Chair; John C. Williams, Vice Chair; Thomas I. Barkin; Michael S. Barr; Raphael W. Bostic; Michelle W. Bowman; Lisa D. Cook; Mary C. Daly; Philip N. Jefferson; Adriana D. Kugler; Jeffrey R. Schmid; and Christopher J. Waller.'
      }
    ],
    minutes: [
      {
        id: 'fm25-p1',
        section: 'Economic Review',
        text: 'Participants observed that financial conditions had eased in recent months, with equity markets reaching new highs and corporate credit spreads narrowing. Several participants expressed caution that financial conditions easing prematurely could impede the disinflation process.'
      }
    ]
  }
];
