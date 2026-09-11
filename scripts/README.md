# Scripts de Coleta & Ingestão de Dados Macroeconômicos

Este diretório contém os scripts em Python para atualização periódica dos dados do **Observatório de Política Monetária**.

## Atualização automática

`fetch_all_copom_history.py`, `fetch_all_fomc_history.py` (comunicados) e `fetch_fomc_probabilities.py`
(probabilidades de mercado do FOMC) rodam sozinhos todo dia via
[`.github/workflows/atualizar-dados.yml`](../.github/workflows/atualizar-dados.yml) (GitHub Actions,
08:00 de Brasília). Se algo mudou, o workflow comita o JSON atualizado em `main` e publica o site em
`gh-pages` na sequência — sem precisar rodar nada manualmente. Também dá pra disparar na hora pela aba
**Actions → Atualiza dados e publica → Run workflow** no GitHub.

Limitações conhecidas de cada fonte, então "sempre atualizado" tem esse limite:
- **Comunicados do Copom**: API pública do próprio Bacen (`bcb.gov.br/api/...`) — reflete o comunicado
  assim que ele é publicado.
- **Comunicados do FOMC**: depende do CSV de um repositório comunitário
  ([`vtasca/fed-statement-scraping`](https://github.com/vtasca/fed-statement-scraping)), que não é
  oficial do Fed — pode demorar alguns dias após uma reunião até esse repositório ser atualizado.
- **Probabilidades do FOMC**: vêm do *Market Probability Tracker* do Fed de Atlanta (dado público,
  atualizado por eles todo dia útil) — não é a metodologia CME FedWatch (essa é proprietária e bloqueia
  acesso automatizado pelos termos de uso do CME Group), mas mede a mesma coisa — probabilidade
  implícita nos futuros de Fed Funds — de forma independente.
- **Probabilidades do Copom**: ainda não automatizadas. Precisariam da curva de DI1 futuro da B3, e os
  endpoints públicos antigos que outros projetos usavam para isso (`www2.bmf.com.br/.../TxRef1.asp` e
  similares) estão fora do ar; o site atual da B3 é protegido por Cloudflare. `copomMarketOverview` em
  `src/data/marketData.ts` continua com números de exemplo até termos uma fonte confiável.

## Rodando manualmente
Instale as dependências (ambiente virtual já configurado nesta máquina, ou `pip install -r requirements.txt`
em qualquer outro lugar):
```bash
/home/guilherme/.venvs/dados-economicos/bin/python fetch_all_copom_history.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_all_fomc_history.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_fomc_probabilities.py
```

## Arquivos:
- `fetch_all_copom_history.py`: Coleta o histórico completo de comunicados do Copom via API do Bacen
  e regrava `src/data/copom_comunicados_all.json`. **Roda automaticamente** (ver acima).
- `fetch_all_fomc_history.py`: Reconstrói `src/data/fomc_statements_all.json` a partir do dataset de
  statements do FOMC. **Roda automaticamente** (ver acima).
- `fetch_fomc_probabilities.py`: Extrai a distribuição de probabilidades por reunião do Market
  Probability Tracker do Fed de Atlanta e regrava `src/data/fomc_market_overview.json`. **Roda
  automaticamente** (ver acima).
- `fetch_copom.py` / `fetch_fomc.py`: verificações pontuais/exploratórias, não usadas pelo workflow.
- `calc_probabilities.py`: fórmula simples de passo implícito a partir da curva de DI1 — ponto de
  partida para quando a fonte de dados do Copom for resolvida, não usada pelo workflow ainda.
- `requirements.txt`: dependências Python dos scripts acima (`requests`, `beautifulsoup4`, `pandas`).
