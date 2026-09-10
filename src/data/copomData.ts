import { MeetingData } from '../types/monetary';

export const copomMeetings: MeetingData[] = [
  {
    id: 'copom-2026-03',
    committee: 'copom',
    meetingNumber: '277ª Reunião',
    date: '2026-03-18',
    rateDecision: '14.25%',
    changeBps: 25,
    previousRate: '14.00%',
    voteSplit: 'Unânime (9x0)',
    summary: 'O Copom elevou a taxa Selic em 0,25 ponto percentual, para 14,25% a.a., reforçando a necessidade de uma política monetária significativamente contracionista por período suficientemente prolongado para assegurar a convergência da inflação à meta.',
    keyGuidance: 'O Comitê enfatiza que os passos futuros da política monetária continuarão dependendo da evolução da dinâmica inflacionária, das expectativas de inflação, das projeções do modelo de referência e do balanço de riscos.',
    rpmReferences: [
      {
        id: 'rpm-proj-inflacao-2026q1',
        topic: 'Projeções do Modelo de Referência',
        title: 'Trajetória de Inflação e Hipóteses do Modelo',
        chapter: 'Capítulo 2: Cenário Prospectivo',
        quarter: 'Mar/2026',
        summary: 'Projeções de inflação acumulada em 12 meses no horizonte relevante (3º trimestre de 2027) situam-se em 3,4% no cenário de referência, acima da meta contínua de 3,00%.',
        keyInsights: [
          'Preço do petróleo estimado em USD 78/barril ao longo do horizonte relevante.',
          'Câmbio partindo de USD/BRL 5,85 com dinâmica baseada na paridade do poder de compra.',
          'Expectativas do Boletim Focus de longo prazo ancoradas parcialmente em 3,80%.'
        ],
        chartDescription: 'Gráfico 2.4 - Leque de Projeções do IPCA com intervalos de probabilidade de 30%, 50% e 90%.',
        pdfPage: 48
      },
      {
        id: 'rpm-hiato-trabalho-2026q1',
        topic: 'Hiato do Produto e Mercado de Trabalho',
        title: 'Estimativas do Hiato do Produto e Pressões Salariais',
        chapter: 'Box 1: Dinâmica do Mercado de Trabalho e Hiato',
        quarter: 'Mar/2026',
        summary: 'Avaliação quantitativa de que o hiato do produto permanece em terreno positivo (demanda aquecida), impulsionado pelo consumo das famílias e pelo rendimento real em patamar historicamente elevado.',
        keyInsights: [
          'Taxa de desemprego medida pela PNAD Contínua em mínimas históricas (6,2%).',
          'Rendimento médio real habitual crescendo a 3,8% a.a., pressionando o setor de serviços intensivo em mão de obra.',
          'Hiato do produto estimado entre +0,6% e +1,1% do PIB potencial.'
        ],
        chartDescription: 'Gráfico B1.2 - Decomposição das medidas de Hiato (Função de Produção vs. Filtro HP univariado).',
        pdfPage: 32
      },
      {
        id: 'rpm-fiscal-risco-2026q1',
        topic: 'Balanço de Riscos e Cenário Fiscal',
        title: 'Prêmio de Risco Fiscal e Expectativas de Inflação',
        chapter: 'Capítulo 3: Balanço de Riscos e Conduta',
        quarter: 'Mar/2026',
        summary: 'O Comitê detalha os canais de transmissão da política fiscal para a monetária, salientando o impacto da percepção de sustentabilidade da dívida pública sobre a curva de juros longa e a desancoragem de expectativas.',
        keyInsights: [
          'Prêmio de risco na curva a termo (NTN-B longa acima de 6,60% a.a.).',
          'Canal de expectativas: a indefinição na consolidação fiscal eleva as projeções de agentes para horizontes de 2027-2028.',
          'Assimetria de riscos ainda pendente para o lado altista da inflação.'
        ],
        pdfPage: 54
      }
    ],
    statement: [
      {
        id: 'c26-p1',
        section: 'Decisão',
        text: 'Em sua 277ª reunião, o Comitê de Política Monetária (Copom) decidiu, por unanimidade, elevar a taxa Selic em 0,25 ponto percentual, para 14,25% a.a.'
      },
      {
        id: 'c26-p2',
        section: 'Cenário Externo',
        text: 'O ambiente externo permanece volátil e marcado pela incerteza em torno da trajetória da política monetária nas principais economias avançadas, em especial nos Estados Unidos, e pelas tensões geopolíticas. Os bancos centrais das principais economias permanecem determinados em promover a convergência das taxas de inflação aos seus objetivos em um ambiente de mercados de trabalho resilientes.'
      },
      {
        id: 'c26-p3',
        section: 'Conjuntura Doméstica',
        text: 'Em relação ao cenário doméstico, o conjunto dos indicadores de atividade econômica e do mercado de trabalho segue exibindo dinamismo acima do esperado. A inflação cheia e as medidas de inflação subjacente situam-se acima da meta para a inflação nas divulgações mais recentes.',
        rpmRefId: 'rpm-hiato-trabalho-2026q1'
      },
      {
        id: 'c26-p4',
        section: 'Projeções e Modelos',
        text: 'As expectativas de inflação para 2026 e 2027 apuradas pela pesquisa Focus encontram-se em torno de 4,7% e 4,0%, respectivamente. As projeções de inflação do Copom em seu cenário de referência situam-se em 4,6% em 2026 e 3,4% no horizonte relevante de política monetária (3º trimestre de 2027). Esse cenário supõe trajetória de taxa de juros extraída da pesquisa Focus e taxa de câmbio partindo de R$ 5,85/US$.',
        rpmRefId: 'rpm-proj-inflacao-2026q1'
      },
      {
        id: 'c26-p5',
        section: 'Balanço de Riscos',
        text: 'O Comitê mantém a avaliação de que o balanço de riscos para suas projeções de inflação apresenta assimetria altista. Entre os riscos de alta para o cenário inflacionário e as expectativas de inflação, destacam-se: (i) uma maior persistência das pressões inflacionárias globais; e (ii) uma maior resiliência na inflação de serviços do que a projetada em função de um hiato do produto mais positivo e de políticas fiscais expansionistas.',
        rpmRefId: 'rpm-fiscal-risco-2026q1'
      },
      {
        id: 'c26-p6',
        section: 'Conduta e Guidance',
        text: 'Considerando a evolução do processo de desinflação, os cenários avaliados, o balanço de riscos e o amplo conjunto de informações disponíveis, o Copom decidiu elevar a taxa Selic em 0,25 p.p., para 14,25% a.a., e entende que essa decisão é compatível com a estratégia de convergência da inflação para o redor da meta ao longo do horizonte relevante. O Comitê reafirma seu firme compromisso com a convergência da inflação à meta e enfatiza que os passos futuros continuarão dependendo da evolução dos dados.'
      }
    ],
    minutes: [
      {
        id: 'm26-p1',
        section: 'A) Atualização da conjuntura econômica',
        text: '1. No âmbito externo, a conjuntura permanece desafiadora, com elevada incerteza sobre o ritmo de desinflação e o início do ciclo de afrouxamento nas economias centrais. O Copom notou que os índices de gerentes de compras (PMI) globais sugerem atividade ainda em expansão moderada, enquanto núcleos de inflação de serviços exibem rigidez persistente.'
      },
      {
        id: 'm26-p2',
        section: 'A) Atualização da conjuntura econômica',
        text: '2. No cenário doméstico, os membros do Copom debateram extensamente os dados do PIB do último trimestre e os indicadores de alta frequência do IBC-Br. Constatou-se que o consumo das famílias permanece sustentado pela expansão da massa salarial real e pelas transferências governamentais, mantendo a economia operando acima do seu potencial produtivo.',
        rpmRefId: 'rpm-hiato-trabalho-2026q1'
      },
      {
        id: 'm26-p3',
        section: 'B) Cenário e projeções de inflação',
        text: '3. A inflação de serviços, particularmente os serviços subjacentes que guardam maior correlação com o custo unitário do trabalho, continuou rodando em patamares incompatíveis com o cumprimento da meta contínua de 3,0%. Os membros pontuaram que a descompressão nos preços de bens industriais não tem sido suficiente para compensar o desvio nos componentes de serviços e alimentos.',
        rpmRefId: 'rpm-proj-inflacao-2026q1'
      },
      {
        id: 'm26-p4',
        section: 'B) Cenário e projeções de inflação',
        text: '4. O Comitê reiterou que uma política fiscal crível e comprometida com a sustentabilidade das contas públicas desempenha papel essencial na ancoragem das expectativas de inflação e na redução dos prêmios de risco dos ativos financeiros, facilitando a transmissão da política monetária.',
        rpmRefId: 'rpm-fiscal-risco-2026q1'
      },
      {
        id: 'm26-p5',
        section: 'C) Conduta da política monetária',
        text: '5. Diante desse quadro, os membros avaliaram duas opções táticas: a manutenção da taxa Selic em 14,00% com reforço enfático na comunicação sobre manutenção prolongada, versus a continuidade do aperto com elevação residual de 0,25 p.p. O colegiado concluiu por unanimidade que o ajuste marginal para 14,25% a.a. fornecia um seguro adicional indispensável para conter a inércia dos contratos e ancorar as projeções de longo prazo.'
      },
      {
        id: 'm26-p6',
        section: 'C) Conduta da política monetária',
        text: '6. Em relação aos próximos passos, o Comitê optou por não emitir uma sinalização contratada (forward guidance explícito), mantendo flexibilidade total para calibrar a taxa básica em função dos dados que serão divulgados até a reunião de maio.'
      }
    ]
  },
  {
    id: 'copom-2026-01',
    committee: 'copom',
    meetingNumber: '276ª Reunião',
    date: '2026-01-28',
    rateDecision: '14.00%',
    changeBps: 50,
    previousRate: '13.50%',
    voteSplit: 'Unânime (9x0)',
    summary: 'O Copom elevou a taxa básica de juros em 0,50 ponto percentual, para 14,00% a.a., alertando para a deterioração das expectativas de inflação e a persistência da demanda agregada aquecida.',
    keyGuidance: 'O Comitê antecipa que a magnitude do ciclo de aperto dependerá do ritmo de desaceleração da atividade econômica e da convergência das expectativas apuradas na pesquisa Focus.',
    rpmReferences: [
      {
        id: 'rpm-2025q4-inflacao',
        topic: 'Projeções Trimestrais',
        title: 'Relatório de Inflação - Projeções de Dezembro',
        chapter: 'Capítulo 2: Cenário Central',
        quarter: 'Dez/2025',
        summary: 'Projeções do Copom indicavam inflação de 4,3% para 2026 sob taxa Selic terminal de 13,50%, evidenciando a necessidade de ajuste adicional.',
        keyInsights: [
          'Deterioração das expectativas de inflação de médio prazo para 4,1%.',
          'Resiliência do mercado de trabalho com taxa de desocupação em 6,4%.'
        ],
        pdfPage: 42
      }
    ],
    statement: [
      {
        id: 'c25-p1',
        section: 'Decisão',
        text: 'Em sua 276ª reunião, o Comitê de Política Monetária (Copom) decidiu, por unanimidade, elevar a taxa Selic em 0,50 ponto percentual, para 14,00% a.a.'
      },
      {
        id: 'c25-p2',
        section: 'Cenário Externo',
        text: 'O ambiente externo mostra-se desafiador, com persistência nas taxas de juros globais de longo prazo e volatilidade nos preços de commodities energéticas. Os principais bancos centrais mundiais prosseguem cautelosos quanto à flexibilização monetária.'
      },
      {
        id: 'c25-p3',
        section: 'Conjuntura Doméstica',
        text: 'No ambiente doméstico, os indicadores econômicos continuam a apontar força na demanda agregada, refletindo o crescimento real dos rendimentos e das concessões de crédito. A inflação corrente mantém-se pressionada, com núcleos em níveis desconfortáveis.'
      },
      {
        id: 'c25-p4',
        section: 'Projeções e Modelos',
        text: 'As expectativas de inflação coletadas pelo Boletim Focus para 2026 elevaram-se para 4,8%. Em seu cenário de referência, a projeção do Copom situa-se em 4,7% para 2026 e 3,6% para o horizonte relevante de 18 meses, com câmbio a R$ 5,90/US$ e Selic de mercado.'
      },
      {
        id: 'c25-p5',
        section: 'Balanço de Riscos',
        text: 'O balanço de riscos para a inflação segue inclinado para cima. O Comitê sublinha os riscos decorrentes de uma desancoragem adicional das expectativas e de estímulos fiscais que sustentem o consumo acima da capacidade potencial da economia.'
      },
      {
        id: 'c25-p6',
        section: 'Conduta e Guidance',
        text: 'Considerando os cenários prospectivos e o balanço de riscos, o Copom optou pela elevação de 0,50 p.p. na taxa Selic, atingindo 14,00% a.a. O Comitê avalia que o ritmo atual é apropriado para mitigar os efeitos secundários dos choques de preços e assegurar a convergência da inflação rumo à meta contínua.'
      }
    ],
    minutes: [
      {
        id: 'm25-p1',
        section: 'A) Atualização da conjuntura econômica',
        text: '1. O colegiado examinou a evolução recente da atividade doméstica, ressaltando que o crescimento do PIB no trimestre anterior superou as estimativas de mercado, revelando vigor no setor de serviços e na formação bruta de capital fixo.'
      },
      {
        id: 'm25-p2',
        section: 'B) Cenário e projeções de inflação',
        text: '2. Houve unanimidade quanto à gravidade da desancoragem das expectativas na pesquisa Focus, que afeta a formação de preços na economia e impõe custos mais elevados para o processo de convergência.'
      },
      {
        id: 'm25-p3',
        section: 'C) Conduta da política monetária',
        text: '3. O Comitê julgou que um aumento de 0,50 ponto percentual era o instrumento necessário para demonstrar determinação inequívoca no combate à inflação, mantendo abertas as opções para os encontros subsequentes.'
      }
    ]
  }
];
