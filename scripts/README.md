# Scripts de Coleta & Ingestão de Dados Macroeconômicos

Este diretório contém os scripts em Python para atualização periódica dos dados do **Observatório de Política Monetária**.

## Atualização automática

`fetch_all_copom_history.py`, `fetch_all_fomc_history.py` (comunicados), `fetch_fomc_probabilities.py`
e `fetch_copom_probabilities.py` (probabilidades de mercado) e `fetch_fomc_speeches.py` (discursos)
rodam sozinhos todo dia via
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
- **Comunicados do FOMC**: depende do CSV de um repositório comunitário
  ([`vtasca/fed-statement-scraping`](https://github.com/vtasca/fed-statement-scraping)), que não é
  oficial do Fed — pode demorar alguns dias após uma reunião até esse repositório ser atualizado.
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
  texto integral real, sem invenção. Não inclui análise: `tone` (hawkish/dovish) vem sempre `neutral`
  e `keyQuotes`/`topics` vêm vazios, porque isso é leitura humana, não extração de dado — ver o
  comentário no topo do próprio script. `isVoter` só é confiável para quem sempre vota (Chair, Vice
  Chair, Governor, presidente do Fed de Nova York); presidentes regionais com voto rotativo saem como
  `false` por padrão.
- **Discursos do Copom**: ainda não automatizados. O conjunto anterior (Galípolo, Guillen) era
  fictício — texto e citações inventados atribuídos a essas pessoas — e foi removido por esse motivo,
  não só por estar desatualizado. Falta achar, do lado do Bacen, uma fonte equivalente ao feed do Fed.

## Rodando manualmente
Instale as dependências (ambiente virtual já configurado nesta máquina, ou `pip install -r requirements.txt`
em qualquer outro lugar):
```bash
/home/guilherme/.venvs/dados-economicos/bin/python fetch_all_copom_history.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_all_fomc_history.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_fomc_probabilities.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_copom_probabilities.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_fomc_speeches.py
```

## Arquivos:
- `fetch_all_copom_history.py`: Coleta o histórico completo de comunicados do Copom via API do Bacen
  e regrava `src/data/copom_comunicados_all.json`. **Roda automaticamente** (ver acima).
- `fetch_all_fomc_history.py`: Reconstrói `src/data/fomc_statements_all.json` a partir do dataset de
  statements do FOMC. **Roda automaticamente** (ver acima).
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
- `fetch_copom.py` / `fetch_fomc.py`: verificações pontuais/exploratórias, não usadas pelo workflow.
- `calc_probabilities.py`: protótipo inicial da ideia usada em `fetch_copom_probabilities.py`, mantido
  por referência — não é mais chamado por nada.
- `requirements.txt`: dependências Python dos scripts acima (`requests`, `beautifulsoup4`, `pandas`,
  `xlrd` — esse último só pra ler a planilha de feriados da ANBIMA, que vem em `.xls` antigo).
