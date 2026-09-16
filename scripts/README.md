# Scripts de Coleta & Ingestão de Dados Macroeconômicos

Este diretório contém os scripts em Python para atualização periódica dos dados do **Observatório de Política Monetária**.

## Atualização automática

`fetch_all_copom_history.py`, `fetch_all_fomc_history.py` (comunicados), `fetch_fomc_probabilities.py`
e `fetch_copom_probabilities.py` (probabilidades de mercado), `fetch_fomc_speeches.py` (discursos),
`fetch_copom_meetings.py`/`fetch_fomc_meetings.py` (atas/minutes), `fetch_copom_dissents.py`/
`fetch_fomc_dissents.py` (histórico de votações), `fetch_fomc_dotplot.py` (dot plot/SEP) e
`fetch_fomc_implementation_notes.py` (nota de implementação) rodam sozinhos todo dia via
[`.github/workflows/atualizar-dados.yml`](../.github/workflows/atualizar-dados.yml) (GitHub Actions,
08:00 de Brasília). Se algo mudou, o workflow comita o JSON atualizado em `main` e publica o site em
`gh-pages` na sequência — sem precisar rodar nada manualmente. Também dá pra disparar na hora pela aba
**Actions → Atualiza dados e publica → Run workflow** no GitHub.

Os scripts de probabilidade e o de discursos rodam com `continue-on-error` no workflow: eles dependem
de páginas/endpoints que não são uma API documentada (ver limitações abaixo), então se algum quebrar
por uma mudança de formato do lado de lá, isso não trava a atualização dos comunicados nem o deploy —
o JSON antigo continua no ar até alguém consertar o parsing.

Limitações conhecidas de cada fonte, então "sempre atualizado" tem esse limite:
- **Comunicados do Copom**: API pública do próprio Bacen (`bcb.gov.br/api/...`) — reflete o comunicado
  assim que ele é publicado.
- **Comunicados do FOMC**: a base é o CSV de um repositório comunitário
  ([`vtasca/fed-statement-scraping`](https://github.com/vtasca/fed-statement-scraping)), que não é
  oficial do Fed — pode demorar dias/semanas após uma reunião até esse repositório ser atualizado (já
  aconteceu de faltar uma reunião no meio do histórico, não só a mais recente). Pra não deixar a
  reunião mais nova de fora nesse meio-tempo, `fetch_all_fomc_history.py` complementa checando
  `fomccalendars.htm` por reuniões com statement já publicado no site oficial mas ainda ausentes do
  CSV, e busca o texto direto de `federalreserve.gov/newsevents/pressreleases/monetary{YYYYMMDD}a.htm`
  nesses casos — mesmo padrão de URL previsível que `fetch_fomc_dotplot.py` já usa pro SEP. Se auto-
  corrige sozinho: no dia em que o CSV alcançar essas reuniões, elas voltam a vir de lá. Também filtra
  duas linhas de rodapé do site do Fed que o CSV às vezes inclui junto com o texto real ("For media
  inquiries..." e o link "Implementation Note issued ...") — como só apareciam nalgumas reuniões,
  viravam ruído falso ("removido"/"adicionado") no comparador.
- **Probabilidades do FOMC**: vêm do *Market Probability Tracker* do Fed de Atlanta (dado público,
  atualizado por eles todo dia útil), extraído de variáveis JavaScript embutidas na página (não é uma
  API JSON separada) — se o Fed de Atlanta reestruturar a página, o parsing quebra e precisa de ajuste.
  Não é a metodologia CME FedWatch (essa é proprietária e bloqueia acesso automatizado pelos termos de
  uso do CME Group), mas mede a mesma coisa — probabilidade implícita nos futuros de Fed Funds — de
  forma independente.
- **Probabilidades do Copom**: vêm da curva de juros futuros de DI1 negociada na B3, via
  `arquivos.b3.com.br/api/download` — um endpoint de download de arquivos que a própria B3 usa no
  portal público dela, mas que não tem documentação oficial (achado por engenharia reversa da SPA do
  portal). Pode quebrar se a B3 mudar esse portal. As datas das reuniões do Copom vêm de
  `copom_calendar.json` (ver abaixo) porque o Bacen não tem API pública pra isso.
- **Discursos do FOMC**: vêm do feed RSS oficial do Federal Reserve
  (`federalreserve.gov/feeds/speeches.xml`) — cada discurso é extraído da própria página oficial dele,
  texto integral real, sem invenção. Não classifica tom (hawkish/dovish) nem quem é membro votante do
  momento — isso é leitura/análise, não extração de dado, e fica de fora de propósito.
- **Discursos do Copom**: ainda não automatizados. O conjunto anterior (Galípolo, Guillen) era
  fictício — texto e citações inventados atribuídos a essas pessoas — e foi removido por esse motivo,
  não só por estar desatualizado. Falta achar, do lado do Bacen, uma fonte equivalente ao feed do Fed.
- **Atas do Copom** (`fetch_copom_meetings.py`): comunicado real (já coletado) + ata real, via
  `copom/atas_detalhes` na API do Bacen — mesmo padrão do endpoint de comunicados, mas as atas de
  antes de ~2016-2020 usam um HTML de formato antigo (exportado de Word) que o parser não entende, ou
  o campo de texto vem vazio na API — essas reuniões ficam de fora, não entram com texto incompleto ou
  chutado. A taxa Selic antes/depois de cada reunião vem da série 432 do SGS (Meta Selic oficial), não
  de tentar achar o número certo no meio do texto do comunicado. Fica limitado às 24 reuniões mais
  recentes (ver `MAX_REUNIOES` no script) pra não inflar demais o tamanho do site — sem isso o texto
  das atas ia parar direto no JavaScript da página.
- **Minutes do FOMC** (`fetch_fomc_meetings.py`): statement real (já coletado, com a lista de votos
  "Voting for"/"Voting against" incluída) + minutes reais, direto de
  `federalreserve.gov/monetarypolicy/fomcminutesAAAAMMDD.htm` — URL previsível a partir da data da
  reunião. O target range de Fed Funds antes/depois de cada reunião vem das séries DFEDTARU/DFEDTARL do
  FRED (St. Louis Fed), não de tentar interpretar frações por extenso ("4-1/4 to 4-1/2 percent") no
  texto do statement. Também limitado a 24 reuniões pelo mesmo motivo de tamanho do bundle.
  Curiosidade de depuração: o CSV do FRED trava/dá timeout quando o `User-Agent` da requisição se
  apresenta como navegador — o script de propósito não manda header nenhum nessa chamada específica.
- **Histórico de votações do Copom** (`fetch_copom_dissents.py`): direto da planilha oficial que o
  próprio Bacen publica e mantém
  ([`historico-votacoes-Copom.xlsx`](https://www.bcb.gov.br/content/controleinflacao/controleinflacao_docs/votacoes-copom/historico-votacoes-Copom.xlsx)),
  desde a 21ª reunião (1998). Votante nomeado individualmente só a partir da 167ª reunião (30/5/2012,
  segundo a própria planilha) — antes disso só o placar agregado ("7 x 1" etc.), sem dizer quem ficou
  em cada lado. Nada aqui é extraído de HTML/regex — é a fonte primária do Bacen. O campo `chair` usa
  o primeiro votante listado em cada reunião (a planilha lista o presidente do Copom primeiro —
  conferido contra o histórico real: Tombini, Goldfajn, Campos Neto, Galípolo aparecem nas datas
  certas). Pras reuniões sem votante nomeado (antes de 2012), completa com uma lista de mandatos
  presidenciais colada à mão no próprio script (`MANDATOS_PRESIDENCIA`) — a página do Bacen com essa
  galeria (`bcb.gov.br/acessoinformacao/galeriaexpresidentes`) é uma SPA sem conteúdo em HTML puro pra
  buscar automaticamente, então usei a tabela da Wikipédia como fonte, conferida contra o Bacen.
  Atualize essa lista à mão se um novo presidente assumir. **Fallback pra reunião recém-decidida**: a
  planilha oficial do Bacen demora dias/semanas pra incorporar a reunião mais nova — `monta_fallback_recentes()`
  cobre esse vão lendo `copom_comunicados_all.json` (já teria sido atualizado por
  `fetch_all_copom_history.py` antes) e extraindo placar/votantes direto da frase padrão "Votaram por
  essa decisão os seguintes membros do Comitê: ...", mesmo princípio do fallback do FOMC. Só cobre o
  caso unânime (o mais comum na era Galípolo); um dissenso com fraseado diferente fica sem fallback até
  a planilha real chegar, que sobrescreve o registro do fallback automaticamente na próxima execução.
- **Histórico de dissidências do FOMC** (`fetch_fomc_dissents.py`): a planilha oficial do Federal
  Reserve Bank of St. Louis
  ([`fomc_dissents_data.xlsx`](https://www.stlouisfed.org/-/media/project/frbstl/stlouisfed/files/excel/fomc_dissents_data.xlsx)),
  apêndice do artigo "Making Sense of Dissents: A History of FOMC Dissents" — cobre desde 1936 e é
  atualizada por eles próprios —, dá nome (sobrenome) e direção de cada dissidente, mas não o tamanho
  do passo que cada um preferia. Pra isso, o script cruza com o texto de
  `fomc_statements_all.json` (o "Voting against ... who preferred/supported ...") e tenta extrair um
  número: direto quando o texto diz "by X percentage point(s)"/"X basis points", por comparação com a
  decisão de fato quando o texto usa um alvo absoluto ("to/at W to Z percent"), ou 0 quando é
  "no change"/"maintain". Boa parte das dissidências de 2008-2015 foram sobre orientação futura ou
  compra de ativos, não sobre um nível de juros específico — nesses casos o campo fica `null`, não um
  chute. Cobertura é boa nos anos recentes (~90% desde 2024) e cai bastante quanto mais raro/antigo o
  formato da frase. Mesma observação do FRED sobre `User-Agent`: sem headers customizados nessa
  chamada.
- **Dot plot (SEP) do FOMC** (`fetch_fomc_dotplot.py`): o Fed não publica a posição de cada
  participante no gráfico de pontos como número — só como posição num gráfico de dispersão dentro do
  PDF, o que não dá pra extrair sem reconhecimento de imagem/vetor. O que ele publica como texto de
  verdade, na Tabela 1 de cada PDF trimestral
  (`federalreserve.gov/monetarypolicy/files/fomcprojtabl{AAAAMMDD}.pdf`), é a mediana, a tendência
  central e a faixa completa da taxa de juros projetada — é isso que o script extrai (com
  `pdfplumber`). Lista de PDFs disponíveis vem da página de calendário do FOMC, que só mantém uns 5-6
  anos pra trás.
- **Nota de Implementação do FOMC** (`fetch_fomc_implementation_notes.py`): documento operacional
  separado do comunicado, com os parâmetros técnicos de verdade — taxa do IORB (juros sobre reservas),
  taxas das operações compromissadas (repo/RRP), taxa de redesconto (primary credit) e a diretriz
  formal ao Desk de Nova York. URL previsível
  (`federalreserve.gov/newsevents/pressreleases/monetary{AAAAMMDD}a1.htm` — igual à do comunicado, só
  com "1" no final), descoberta checando toda reunião de `fomc_statements_all.json` e ignorando 404.
  Só existe como release separada desde 2016; reuniões mais antigas ficam de fora, não fabricadas.
  Aparece no Comparador de Comunicados como uma segunda opção de documento, exclusiva do FOMC.

## Rodando manualmente
Instale as dependências (ambiente virtual já configurado nesta máquina, ou `pip install -r requirements.txt`
em qualquer outro lugar):
```bash
/home/guilherme/.venvs/dados-economicos/bin/python fetch_all_copom_history.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_all_fomc_history.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_fomc_probabilities.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_copom_probabilities.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_fomc_speeches.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_copom_meetings.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_fomc_meetings.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_copom_dissents.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_fomc_dissents.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_fomc_dotplot.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_fomc_implementation_notes.py
```

`fetch_copom_meetings.py` precisa que `src/data/copom_comunicados_all.json` já exista (rode
`fetch_all_copom_history.py` antes); `fetch_fomc_meetings.py` precisa de `fomc_statements_all.json` da
mesma forma.

## Arquivos:
- `fetch_all_copom_history.py`: Coleta o histórico completo de comunicados do Copom via API do Bacen
  e regrava `src/data/copom_comunicados_all.json`. **Roda automaticamente** (ver acima).
- `fetch_all_fomc_history.py`: Reconstrói `src/data/fomc_statements_all.json` a partir do dataset de
  statements do FOMC, complementado com as reuniões recentes que ainda não chegaram nesse dataset (ver
  limitação acima). **Roda automaticamente** (ver acima).
- `fetch_fomc_probabilities.py`: Extrai a distribuição de probabilidades por reunião do Market
  Probability Tracker do Fed de Atlanta e regrava `src/data/fomc_market_overview.json`. **Roda
  automaticamente** (ver acima).
- `fetch_copom_probabilities.py`: Monta a curva de juros futuros de DI1 a partir dos arquivos públicos
  da B3, interpola pra achar a taxa a termo implícita entre cada reunião e a seguinte, e regrava
  `src/data/copom_market_overview.json`. **Roda automaticamente** (ver acima). Metodologia comentada no
  topo do próprio arquivo.
- `copom_calendar.json`: as datas das próximas reuniões do Copom, coladas à mão a partir do calendário
  que o Bacen divulga uma vez por ano. **Atualize esta lista quando o Bacen soltar o calendário do ano
  seguinte** (normalmente no fim do ano anterior) — sem isso, `fetch_copom_probabilities.py` para de
  conseguir calcular reuniões novas.
- `fetch_fomc_speeches.py`: lê o feed RSS de discursos do Fed, extrai o texto real de cada um e regrava
  `src/data/fomc_speeches.json`. **Roda automaticamente** (ver acima).
- `fetch_copom_meetings.py`: junta comunicado real + ata real de cada reunião do Copom e regrava
  `src/data/copom_meetings.json` (usado pelo Leitor de Atas). **Roda automaticamente** (ver acima).
- `fetch_fomc_meetings.py`: junta statement real + minutes reais de cada reunião do FOMC e regrava
  `src/data/fomc_meetings.json` (usado pelo Leitor de Atas). **Roda automaticamente** (ver acima).
- `fetch_copom_dissents.py`: baixa a planilha oficial de votações do Bacen e regrava
  `src/data/copom_dissents.json` (usado na aba Dissidências). **Roda automaticamente** (ver acima).
- `fetch_fomc_dissents.py`: baixa a planilha oficial de dissidências do Fed de St. Louis e regrava
  `src/data/fomc_dissents.json` (usado na aba Dissidências). **Roda automaticamente** (ver acima).
- `fetch_fomc_dotplot.py`: extrai a mediana/tendência central/faixa da taxa de juros de cada release
  trimestral do SEP e regrava `src/data/fomc_dotplot.json` (usado na aba Dot Plot). **Roda
  automaticamente** (ver acima).
- `fetch_fomc_implementation_notes.py`: busca a nota de implementação de cada reunião (desde 2016) e
  regrava `src/data/fomc_implementation_notes.json` (opção "Nota de Implementação" no Comparador de
  Comunicados). **Roda automaticamente** (ver acima).
- `fetch_copom.py` / `fetch_fomc.py`: verificações pontuais/exploratórias, não usadas pelo workflow.
- `calc_probabilities.py`: protótipo inicial da ideia usada em `fetch_copom_probabilities.py`, mantido
  por referência — não é mais chamado por nada.
- `requirements.txt`: dependências Python dos scripts acima (`requests`, `beautifulsoup4`, `pandas`,
  `xlrd` — só pra ler a planilha de feriados da ANBIMA, que vem em `.xls` antigo —, `openpyxl` — pras
  planilhas `.xlsx` de votações — e `pdfplumber` — pros PDFs do dot plot).
