# Observatório de Política Monetária (Copom & FOMC)

Uma plataforma analítica avançada para economistas, analistas de mercado e pesquisadores macroeconômicos acompanharem as decisões, sinalizações e expectativas dos comitês de política monetária do **Brasil (Copom / Banco Central do Brasil)** e dos **Estados Unidos (FOMC / Federal Reserve)**.

---

## 🚀 Funcionalidades Principais

### 1. ⚖️ Comparador de Comunicados (Statement Diff & Tone Analysis)
- **Comparação Palavra a Palavra e Parágrafo a Parágrafo**:
  - Destaque visual em tempo real: trechos inseridos em **verde**, trechos removidos em **vermelho riscado**.
  - Modos de visualização flexíveis: **Unificado (Inline)** e **Lado a Lado (Split View)**.
  - Métricas automáticas de alteração: total de palavras adicionadas, palavras excluídas e rastreamento de mudanças no *Forward Guidance*.
  - Seletor dinâmico de reuniões históricas para comparar quaisquer duas reuniões.

### 2. 📜 Leitor de Atas
- Dado real, atualizado sozinho todo dia (ver [`scripts/README.md`](scripts/README.md)): comunicado +
  ata de cada reunião do Copom (via API do Bacen) e statement + minutes de cada reunião do FOMC (via
  site do Fed), cobrindo as 24 reuniões mais recentes de cada comitê.
- Leitor com tipografia editorial financeira (*serif*) para leitura profunda e confortável.
- Índice estrutural lateral (*Table of Contents*) para salto rápido entre seções.
- Selecione qualquer trecho do texto pra grifar, riscar ou anotar (ver item 5).

### 3. 📊 Probabilidades de Mercado
Dado real dos dois lados, atualizado sozinho todo dia (ver [`scripts/README.md`](scripts/README.md)
pra fonte, metodologia e limitações de cada um):
- **Brasil (Copom)**:
  - Curva de juros futuros de DI1 (B3), interpolada pra achar a taxa a termo implícita entre cada
    reunião do Copom e a seguinte, comparada com a Selic da reunião anterior.
  - Distribuição de probabilidade entre os passos de 25bps mais próximos da variação implícita.
  - Taxa terminal implícita no ciclo e data esperada.
- **Estados Unidos (FOMC)**:
  - Distribuição de probabilidade por faixa de juros-alvo, direto do *Market Probability Tracker* do
    Fed de Atlanta (implícita nos futuros de Fed Funds — mesma ideia do CME FedWatch, calculada de
    forma independente e aberta, já que o CME bloqueia acesso automatizado aos dados dele).
  - Comparativo histórico da probabilidade: *Hoje*, *1 Dia Atrás*, *1 Semana Atrás*, *1 Mês Atrás*.
  - Taxa terminal implícita no ciclo e data esperada.

### 4. 🎙️ Calendário & Transcrições de Discursos dos Membros
- **FOMC** — dado real, atualizado sozinho todo dia: texto integral de cada discurso, direto do feed
  oficial do Federal Reserve (`federalreserve.gov/feeds/speeches.xml`), com data, local, cargo de quem
  falou e link pra fonte. Diferenciação entre **membros com direito a voto sempre** (Chair, Vice Chair,
  Governor, presidente do Fed de Nova York) e os demais.
- **Copom** — ainda sem fonte automatizada (ver [`scripts/README.md`](scripts/README.md)).
- O que este recurso **não** faz: não classifica tom (*hawkish*/*dovish*) nem quem é membro votante do
  momento, nem escolhe "citações-chave" automaticamente — isso é leitura, não extração de dado, e
  ficou fora de propósito pra não fabricar análise em nome de terceiros.
- Alerta visual do **Período de Silêncio (*Blackout Period*)** em que declarações são vedadas.

### 5. ✏️ Grifos e Anotações no Texto
- Selecione qualquer frase ou parágrafo nos comunicados ou nas atas para abrir o menu flutuante:
  - 🟡 **Grifar**: quatro cores (amarelo, verde, vermelho, azul) — sem sentido pré-definido, é livre pra
    você usar como quiser.
  - <s>**Riscar**</s>: marque trechos superados ou que perderam relevância.
  - 💬 **Comentar**: adicione uma nota pessoal vinculada ao trecho.
- Tudo fica salvo localmente no navegador (`localStorage`) — nunca se perde ao recarregar a página, mas
  também não sai desse navegador (não há caderno/exportação centralizada das anotações).

### 6. 🎯 Dot Plot (SEP) do FOMC
- Compara dois releases quaisquer do *Summary of Economic Projections* — mediana, tendência central e
  faixa completa da taxa de juros projetada, ano a ano. Dado real, direto dos PDFs trimestrais que o
  Fed publica (não é o gráfico de pontos em si, que só existe como imagem — é o resumo estatístico da
  mesma informação, em número). Exclusivo do FOMC; o Copom não tem equivalente.

### 7. ⚖️ Dissidências
- Histórico completo de votação de cada reunião, dos dois comitês, com filtro pra ver só as reuniões
  com dissidência:
  - **Copom**: desde a 21ª reunião (1998), via planilha oficial do Bacen. Votante nomeado individualmente
    a partir da 167ª reunião (2012); antes disso, só o placar agregado.
  - **FOMC**: desde 1936, via planilha oficial do Fed de St. Louis (dissidentes por nome quando
    registrado, direção do voto — a favor de aperto ou de alívio).

---

## 🛠️ Stack Tecnológico

- **Frontend**:
  - [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Lucide React](https://lucide.dev/) (iconografia financeira e editorial)
  - [diff (jsdiff)](https://github.com/kpdecker/jsdiff) (motor de diff de alta performance)
- **Backend & Data Pipeline (Python)**:
  - Python com `requests`, `beautifulsoup4`, `pandas`, `pdfplumber` no diretório `scripts/` (ver
    [`scripts/requirements.txt`](scripts/requirements.txt)).
  - Conectores para API do Banco Central do Brasil e portal do Federal Reserve.

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ ou 20+
- npm (ou pnpm / yarn)
- Python 3.10+ (opcional, para rodar os scripts de coleta)

### Instalação e Execução

```bash
# 1. Clonar o repositório
git clone https://github.com/guivaraschinalves/observatorio-politica-monetaria.git
cd observatorio-politica-monetaria

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra no navegador em `http://localhost:5173`.

### Executando Scripts de Ingestão (Python)

```bash
# Usando o ambiente virtual de dados econômicos:
/home/guilherme/.venvs/dados-economicos/bin/python scripts/fetch_copom.py
/home/guilherme/.venvs/dados-economicos/bin/python scripts/fetch_fomc.py
/home/guilherme/.venvs/dados-economicos/bin/python scripts/calc_probabilities.py
```

Isso é opcional para uso local — os comunicados do Copom e do FOMC já se atualizam sozinhos todo dia
via GitHub Actions. Detalhes em [`scripts/README.md`](scripts/README.md).

---

## 📄 Licença
Desenvolvido para análise macroeconômica. Todos os direitos reservados à Follow The Money.
