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

### 2. 📜 Leitor de Atas com Referências Cruzadas ao RPM (Bacen) e SEP (Fed)
- Leitor com tipografia editorial financeira (*serif*) para leitura profunda e confortável.
- Índice estrutural lateral (*Table of Contents*) para salto rápido entre seções.
- **Conexão Direta com o Relatório de Política Monetária (RPM / antigo RTI)**:
  - Badges interativos no texto das atas do Copom (ex: `[RPM ↗ Box 1: Hiato do Produto]`, `[RPM ↗ Trajetória de Inflação e Projeções]`).
  - Ao clicar, abre-se uma gaveta lateral (*Drawer*) com os extratos, premissas de modelos, números-chave e descrição dos gráficos do RPM sem precisar sair da leitura da ata.

### 3. 📊 Probabilidades de Mercado
- **Estados Unidos (FOMC)** — dado real, atualizado sozinho todo dia (ver [`scripts/README.md`](scripts/README.md)):
  - Distribuição de probabilidade por faixa de juros-alvo, direto do *Market Probability Tracker* do
    Fed de Atlanta (implícita nos futuros de Fed Funds — mesma ideia do CME FedWatch, calculada de
    forma independente e aberta, já que o CME bloqueia acesso automatizado aos dados dele).
  - Comparativo histórico da probabilidade: *Hoje*, *1 Dia Atrás*, *1 Semana Atrás*, *1 Mês Atrás*.
  - Taxa terminal implícita no ciclo e data esperada.
- **Brasil (Copom)** — ainda com dados de exemplo, não uma fonte ao vivo:
  - A ideia é precificar a partir da curva a termo de juros **DI1 da B3**, mas os endpoints públicos
    que dariam esse dado sem chave/assinatura não estão respondendo no momento (ver
    [`scripts/README.md`](scripts/README.md) para o que já foi tentado). Falta encontrar uma fonte
    confiável antes de automatizar esse lado.

### 4. 🎙️ Calendário & Transcrições de Discursos dos Membros
- Linha do tempo completa dos pronunciamentos públicos e testemunhos dos membros do Copom (Galípolo, Diretores) e FOMC (Powell, Governadores, Presidentes regionais).
- Diferenciação clara entre **membros com direito a voto** e membros não-votantes.
- Classificação de tom de política monetária: **Hawkish** (inclinado a aperto/juros altos), **Dovish** (inclinado a alívio/cortes) ou **Neutro**.
- Modal com a **transcrição / discurso integral**, destaques de citações-chave (*key quotes*), tópicos e links oficiais.
- Alerta visual do **Período de Silêncio (*Blackout Period*)** em que declarações são vedadas.

### 5. 📝 Caderno Interativo de Anotações, Grifos e Riscos
- **Interação Direta sobre o Texto**:
  - Selecione qualquer frase ou parágrafo com o cursor para abrir o menu flutuante.
  - 🟡 **Grifar**: Escolha entre Amarelo clássico, Verde (*Dovish*), Vermelho (*Hawkish*) ou Azul (*Neutro/Técnico*).
  - <s>**Riscar (Strikethrough)**</s>: Marque trechos superados ou que perderam relevância.
  - 💬 **Anotar**: Adicione notas pessoais de análise diretamente vinculadas ao parágrafo.
  - 🏷️ **Tag de Tom**: Classifique o trecho como Hawkish ou Dovish.
- **Persistência Automática**:
  - Todas as anotações ficam salvas localmente no navegador (`localStorage`), garantindo que nunca se percam ao recarregar a página.
- **Exportação para Relatórios**:
  - Botão de exportação para **Markdown (.md)** e cópia rápida para a área de transferência, pronto para colar em relatórios ou newsletters.

---

## 🛠️ Stack Tecnológico

- **Frontend**:
  - [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Lucide React](https://lucide.dev/) (iconografia financeira e editorial)
  - [diff (jsdiff)](https://github.com/kpdecker/jsdiff) (motor de diff de alta performance)
- **Backend & Data Pipeline (Python)**:
  - Python 3.13 com `httpx`, `requests`, `beautifulsoup4`, `pandas` no diretório `scripts/`.
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
