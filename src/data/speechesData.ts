import { SpeechItem } from '../types/monetary';

export const speechesData: SpeechItem[] = [
  {
    id: 'speech-galipolo-2026-03-24',
    committee: 'copom',
    speaker: 'Gabriel Galípolo',
    role: 'Presidente do Banco Central do Brasil',
    isVoter: true,
    date: '2026-03-24',
    time: '10:00 BRT',
    event: 'Evento Anual da Febraban',
    location: 'São Paulo, SP',
    tone: 'hawkish',
    title: 'Autonomia, Disciplina Monetária e Ancoragem das Expectativas',
    summary: 'Galípolo destacou que o Banco Central não hesitará em manter a taxa Selic em patamar restritivo por quanto tempo for necessário para trazer a inflação à meta contínua de 3%, apontando que o mercado de trabalho aquecido exige cautela redobrada.',
    keyQuotes: [
      '“Não existe qualquer tolerância da diretoria colegiada com a desancoragem de expectativas. Se for necessário mais aperto ou juros altos por mais tempo, faremos sem hesitação.”',
      '“O hiato do produto positivo e a taxa de desemprego em mínimas históricas geram uma dinâmica salarial que o Banco Central precisa monitorar de perto.”',
      '“Nossa função de reação é técnica e orientada exclusivamente pelo cumprimento do mandato de estabilidade de preços.”'
    ],
    fullTranscript: `Bom dia a todos os presentes. Agradeço o convite da Febraban para este debate fundamental sobre as perspectivas macroeconômicas do Brasil.

Gostaria de começar reforçando o compromisso inegociável da diretoria do Banco Central com a meta de inflação. Em nosso regime de meta contínua de 3,0%, a convergência da inflação no horizonte relevante é a nossa bússola exclusiva.

Nas últimas reuniões, o Copom avaliou que a resiliência da atividade doméstica e o dinamismo do mercado de trabalho — com desemprego em patamar historicamente baixo e ganhos salariais reais robustos — têm sustentado a demanda das famílias em patamares que mantêm a inflação de serviços pressionada. Quando observamos os núcleos de inflação de serviços, percebemos que a velocidade da desinflação arrefeceu.

Paralelamente, a desancoragem das expectativas de inflação de médio e longo prazo na pesquisa Focus é um fator que nos preocupa diretamente. Quando os formadores de preços e agentes do mercado financeiro projetam inflação persistentemente acima do centro da meta, o custo da desinflação aumenta. O Banco Central não aceitará essa desancoragem como um dado consolidado. A política monetária está em campo profundamente restritivo e permanecerá assim pelo tempo que for estritamente indispensável para garantir a ancoragem plena.

Sobre o ambiente externo, seguimos atentos à condução das taxas de juros nas economias desenvolvidas e à volatilidade cambial associada a incertezas geopolíticas. O canal de transmissão cambial, combinado com a curva a termo doméstica, exige que a calibragem de juros seja conduzida com pragmatismo e serenidade. Muito obrigado.`,
    topics: ['Meta de Inflação', 'Mercado de Trabalho', 'Expectativas Focus', 'Cenário Externo'],
    sourceUrl: 'https://www.bcb.gov.br'
  },
  {
    id: 'speech-guillen-2026-03-20',
    committee: 'copom',
    speaker: 'Diogo Guillen',
    role: 'Diretor de Política Econômica',
    isVoter: true,
    date: '2026-03-20',
    time: '14:30 BRT',
    event: 'Seminário de Política Monetária da FGV/IBRE',
    location: 'Rio de Janeiro, RJ',
    tone: 'hawkish',
    title: 'Modelos Macroeconômicos e os Canais de Transmissão da Selic',
    summary: 'Guillen detalhou a metodologia do Relatório de Política Monetária (RPM), reforçando as estimativas de hiato do produto positivo e a necessidade de absorver os efeitos secundários de choques fiscais e cambiais.',
    keyQuotes: [
      '“Quando olhamos o hiato desagregado, a capacidade instalada e a taxa de utilização da mão de obra estão tensionadas nos setores voltados ao mercado interno.”',
      '“O horizonte relevante de 18 meses exige que estejamos focados nas projeções para o terceiro trimestre de 2027.”'
    ],
    fullTranscript: `Agradeço aos professores do IBRE pelo convite. Minha apresentação de hoje foca nas premissas técnicas do nosso modelo de projeção semi-estrutural publicado no último Relatório de Política Monetária.

Como destacamos no Box 1 do RPM de março, a mensuração do PIB potencial passou por revisões decorrentes da rigidez da oferta em determinados setores e da rápida recuperação da população ocupada. Nossas estimativas de hiato do produto mostram que a economia brasileira vem operando acima do seu produto potencial há vários trimestres consecutivos.

Nesse contexto, o papel da taxa Selic não é apenas atuar sobre o crédito, mas fundamentalmente sobre a taxa neutra de juros percebida e a formação de expectativas de longo prazo. A transmissão da política monetária se dá com defasagens conhecidas, e por isso nossa mira precisa estar calibrada no horizonte relevante de 18 meses, onde as projeções condicionais do modelo ainda demandam política restritiva.`,
    topics: ['Hiato do Produto', 'RPM', 'Modelos Econométricos'],
    sourceUrl: 'https://www.bcb.gov.br'
  },
  {
    id: 'speech-powell-2026-03-25',
    committee: 'fomc',
    speaker: 'Jerome H. Powell',
    role: 'Chair, Federal Reserve',
    isVoter: true,
    date: '2026-03-25',
    time: '12:30 ET',
    event: 'Economic Club of New York Luncheon',
    location: 'New York, NY',
    tone: 'neutral',
    title: 'The Economic Outlook and Monetary Policy Strategy',
    summary: 'Powell emphasized a balanced approach to the dual mandate, confirming that rate cuts remain data-dependent while noting that the labor market has normalized and inflation is gradually approaching the 2 percent target.',
    keyQuotes: [
      '“We are navigating between two risks: easing too quickly could undo our progress on inflation, while waiting too long could needlessly weaken employment.”',
      '“The economy is strong overall, and we do not need to be in a hurry to recalibrate policy to our neutral setting.”',
      '“Every meeting is live, and our decisions will continue to be guided by the totality of incoming data.”'
    ],
    fullTranscript: `Good afternoon. It is a pleasure to be back at the Economic Club of New York.

At our meeting last week, the FOMC decided to lower our policy interest rate by 25 basis points to 4-1/4 to 4-1/2 percent. This recalibration reflects our growing confidence that inflation continues on a sustainable path toward our 2 percent goal, while the labor market has cooled to a state that is roughly in balance.

The U.S. economy has continued to expand at a solid clip. Real GDP grew at an estimated 2.1 percent in the first quarter, driven by steady consumer spending and ongoing investment in technology and infrastructure. At the same time, the labor market has moved back toward pre-pandemic conditions. Job gains have moderated, job openings have declined toward normal historical ratios relative to unemployed workers, and wage growth has decelerated to a pace more consistent with price stability over time.

As we look ahead, we face two-sided risks. If economic activity remains firmer than expected and inflation stalls above 2 percent, we have the flexibility to slow or pause further reductions. Conversely, if the labor market were to experience unexpected deterioration, we have ample policy room to respond. We are not on a preset course. We will take decisions meeting by meeting based on incoming data and economic projections. Thank you.`,
    topics: ['Dual Mandate', 'Labor Market', 'Data-Dependency', 'Inflation Progress'],
    sourceUrl: 'https://www.federalreserve.gov'
  },
  {
    id: 'speech-waller-2026-03-22',
    committee: 'fomc',
    speaker: 'Christopher J. Waller',
    role: 'Governor, Federal Reserve Board',
    isVoter: true,
    date: '2026-03-22',
    time: '09:15 ET',
    event: 'Global Interdependence Center Conference',
    location: 'Philadelphia, PA',
    tone: 'dovish',
    title: 'Neutral Rates and the Trajectory of Policy Recalibration',
    summary: 'Waller argued that with inflation close to target and wage growth normalizing, the federal funds rate is still significantly above neutral, supporting gradual easing toward a 3.0%-3.5% range.',
    keyQuotes: [
      '“With policy rates still roughly 100 to 150 basis points above most estimates of neutral, continuing with measured rate reductions makes good economic sense.”',
      '“I see no evidence that the labor market is overheating; in fact, we should be vigilant against excessive softening.”'
    ],
    fullTranscript: `Thank you for having me today. My remarks will focus on the path of monetary policy and our assessment of the neutral rate of interest, or r-star.

Over the past two years, monetary policy successfully lowered headline and core inflation from peaks near 9 percent to within striking distance of our 2 percent objective. Throughout this period, many feared a sharp rise in unemployment would be required. Instead, we witnessed an orderly rebalancing of supply and demand across labor and product markets.

Today, my assessment is that the real federal funds rate remains firmly in restrictive territory. Even after our recent 25 basis point reduction, the real policy rate is near 2 percent—well above the 0.5 to 1.0 percent range commonly estimated for the neutral real rate. In my view, unless new inflation shocks emerge, we should proceed with gradual, deliberate adjustments toward neutral to protect the gains we have achieved in employment.`,
    topics: ['Neutral Rate', 'R-Star', 'Rate Cuts', 'Labor Market'],
    sourceUrl: 'https://www.federalreserve.gov'
  },
  {
    id: 'speech-bowman-2026-03-21',
    committee: 'fomc',
    speaker: 'Michelle W. Bowman',
    role: 'Governor, Federal Reserve Board',
    isVoter: true,
    date: '2026-03-21',
    time: '15:00 ET',
    event: 'Florida Bankers Association Annual Forum',
    location: 'Orlando, FL',
    tone: 'hawkish',
    title: 'Why Vigilance on Inflation Remains Crucial',
    summary: 'Bowman explained her dissent at the March FOMC meeting, arguing that core inflation remains sticky and fiscal spending could re-accelerate price pressures, making rate cuts premature.',
    keyQuotes: [
      '“I dissented because I believe cutting rates while core PCE remains above 2.5 percent sends the wrong signal to markets and households.”',
      '“We cannot declare victory on inflation while housing services and fiscal deficits continue to push in the opposite direction.”'
    ],
    fullTranscript: `Good afternoon. I am pleased to address the Florida Bankers Association.

As you know, at our FOMC meeting last week, I cast a dissenting vote against the decision to reduce the target range for the federal funds rate. Today I want to share the rationale behind my vote.

While I welcome the progress made on inflation over the past year, I remain concerned that the disinflationary momentum has slowed. Core PCE inflation has hovered around 2.6 percent, with housing costs remaining elevated and consumer services inflation proving stubborn.

Moreover, consumer spending continues to show remarkable resilience, supported by substantial ongoing federal fiscal expansion. In an environment where the supply side of the economy may face renewed supply chain or geopolitical bottlenecks, lowering policy restriction prematurely carries the risk of entrenching above-target inflation. In my judgment, keeping rates steady until we see clear and compelling evidence of convergence to 2 percent was the more prudent course.`,
    topics: ['Dissent', 'Inflation Persistence', 'Fiscal Impact', 'Core PCE'],
    sourceUrl: 'https://www.federalreserve.gov'
  }
];
