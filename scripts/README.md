# Scripts de Coleta & Ingestão de Dados Macroeconômicos

Este diretório contém os scripts em Python para atualização periódica dos dados do **Observatório de Política Monetária**.

## Ambiente Recomendado
Utilize o ambiente virtual Python já configurado:
```bash
/home/guilherme/.venvs/dados-economicos/bin/python fetch_copom.py
/home/guilherme/.venvs/dados-economicos/bin/python fetch_fomc.py
/home/guilherme/.venvs/dados-economicos/bin/python calc_probabilities.py
```

## Arquivos:
- `fetch_copom.py`: Coleta os comunicados, atas e publicações do Copom no portal do Bacen.
- `fetch_fomc.py`: Consulta o calendário e comunicados de decisão do FOMC.
- `calc_probabilities.py`: Fórmulas de cálculo de passos e probabilidades implícitas (DI1 e Fed Funds Futures).
