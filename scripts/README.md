# Scripts de Coleta & Ingestão de Dados Macroeconômicos

Este diretório contém os scripts em Python para atualização periódica dos dados do **Observatório de Política Monetária**.

## Atualização automática

`fetch_all_copom_history.py` e `fetch_all_fomc_history.py` — os que alimentam o comparador de
comunicados — rodam sozinhos todo dia via
[`.github/workflows/atualizar-dados.yml`](../.github/workflows/atualizar-dados.yml) (GitHub Actions,
08:00 de Brasília). Se uma reunião nova mudou os dados, o workflow comita o JSON atualizado em
`main` e publica o site em `gh-pages` na sequência — sem precisar rodar nada manualmente. Também dá
pra disparar na hora pela aba **Actions → Atualiza dados e publica → Run workflow** no GitHub.

Duas fontes têm limitação conhecida, então "sempre atualizado" tem esse limite:
- **Copom**: API pública do próprio Bacen (`bcb.gov.br/api/...`) — reflete o comunicado assim que ele
  é publicado.
- **FOMC**: depende do CSV de um repositório comunitário
  ([`vtasca/fed-statement-scraping`](https://github.com/vtasca/fed-statement-scraping)), que não é
  oficial do Fed — pode demorar alguns dias após uma reunião até esse repositório ser atualizado.

## Rodando manualmente
Instale as dependências (ambiente virtual já configurado nesta máquina, ou `pip install -r requirements.txt`
em qualquer outro lugar):
```bash
/home/guilherme/.venvs/dados-economicos/bin/python fetch_all_copom_history.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_all_fomc_history.py
/home/guilherme/.venvs/dados-economicos/bin/python calc_probabilities.py
```

## Arquivos:
- `fetch_all_copom_history.py`: Coleta o histórico completo de comunicados do Copom via API do Bacen
  e regrava `src/data/copom_comunicados_all.json`. **Roda automaticamente** (ver acima).
- `fetch_all_fomc_history.py`: Reconstrói `src/data/fomc_statements_all.json` a partir do dataset de
  statements do FOMC. **Roda automaticamente** (ver acima).
- `fetch_copom.py` / `fetch_fomc.py`: verificações pontuais/exploratórias, não usadas pelo workflow.
- `calc_probabilities.py`: Fórmulas de cálculo de passos e probabilidades implícitas (DI1 e Fed Funds Futures).
- `requirements.txt`: dependências Python dos scripts acima (`requests`, `beautifulsoup4`, `pandas`).
