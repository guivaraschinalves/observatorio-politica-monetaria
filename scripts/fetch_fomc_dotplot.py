#!/usr/bin/env python3
"""
"Dot plot" do FOMC (Summary of Economic Projections) — real, direto dos PDFs
que o próprio Fed publica em cada reunião de março/junho/setembro/dezembro:
federalreserve.gov/monetarypolicy/files/fomcprojtabl{AAAAMMDD}.pdf

O Fed NÃO publica a posição de cada ponto (cada "dot") como número — só como
posição num gráfico de dispersão dentro do PDF (Figura 2), que não dá pra
extrair como dado sem reconhecimento de imagem/vetor. O que ele publica como
TEXTO de verdade, na Tabela 1 de cada PDF, é a mediana, a tendência central
(exclui os 3 mais altos e os 3 mais baixos) e o intervalo completo da taxa de
juros projetada por reunião, para cada ano do horizonte + longo prazo. É
exatamente esse resumo estatístico do "dot plot" que este script extrai — não
é o gráfico de pontos em si, mas é a mesma informação em número, sem invenção.

Lista de PDFs disponíveis vem da página de calendário do FOMC (mantém uns 5-6
anos de histórico); não achei um arquivo com o histórico completo.
"""
import os
import re
import json
from datetime import datetime

import requests
import pdfplumber

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_dotplot.json")
TMP_PDF_PATH = os.path.join(SCRIPT_DIR, "..", ".sep_tmp.pdf")

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
CALENDAR_URL = "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"
PDF_LINK_RE = re.compile(r"/monetarypolicy/files/fomcprojtabl(\d{8})\.pdf")


def busca_lista_pdfs():
    r = requests.get(CALENDAR_URL, headers=HEADERS, timeout=20)
    r.raise_for_status()
    datas = sorted(set(PDF_LINK_RE.findall(r.text)))
    return [
        (datetime.strptime(d, "%Y%m%d").date(), f"https://www.federalreserve.gov/monetarypolicy/files/fomcprojtabl{d}.pdf")
        for d in datas
    ]


def parse_sep_pdf(caminho_local: str):
    with pdfplumber.open(caminho_local) as pdf:
        texto = None
        for page in pdf.pages:
            t = page.extract_text() or ""
            if "Table 1." in t and "Federalfundsrate" in t.replace(" ", ""):
                texto = t
                break
    if not texto:
        return None

    linhas = texto.split("\n")

    # O horizonte muda de tamanho ao longo do ano: releases de março/junho
    # mostram [ano atual, +1, +2, Longer run] (4 colunas por bloco); os de
    # setembro/dezembro acrescentam mais um ano de projeção (5 colunas). O
    # cabeçalho vem assim: "2025 2026 2027 2028 Longer 2025 2026 ... Longer
    # run run run" — os anos aparecem 3x (Mediana/Tendência Central/Faixa)
    # e "Longer"+"run" quebram em tokens separados.
    anos = None
    for i, l in enumerate(linhas):
        ls = l.strip()
        # o cabeçalho de anos ("Variable 2025 2026 ... Longer run") às vezes
        # cai na mesma linha de "Variable", às vezes na linha seguinte —
        # varia de release pra release conforme o quebra-linha do PDF.
        if ls == "Variable":
            partes = linhas[i + 1].split()
        elif ls.startswith("Variable ") and ls.split()[1][:1].isdigit():
            partes = ls.split()[1:]
        else:
            continue

        n_longer = partes.count("Longer")
        if n_longer == 0 or n_longer % 3 != 0:
            return None
        bloco = []
        for tok in partes:
            if tok == "Longer":
                bloco.append("Longer run")
            elif tok == "run":
                continue  # já virou parte de "Longer run" acima
            else:
                bloco.append(tok)
        # bloco agora tem 3 repetições do mesmo conjunto de anos
        tamanho = len(bloco) // 3
        anos = bloco[:tamanho]
        break
    if not anos:
        return None
    n = len(anos)

    linha_fed_funds = None
    for l in linhas:
        if l.replace(" ", "").startswith("Federalfundsrate"):
            linha_fed_funds = l
            break
    if not linha_fed_funds:
        return None

    # remove o rótulo (vem colado ao primeiro número, ex: "Federalfundsrate 3.8 ...")
    valores = linha_fed_funds.replace("Federalfundsrate", "").split()
    if len(valores) != n * 3:
        return None

    def num(v):
        return float(v.replace(",", "."))

    def faixa(v):
        if "–" in v:
            lo, hi = v.split("–")
            return {"low": num(lo), "high": num(hi)}
        return {"low": num(v), "high": num(v)}

    mediana = [num(v) for v in valores[0:n]]
    tendencia_central = [faixa(v) for v in valores[n : 2 * n]]
    intervalo = [faixa(v) for v in valores[2 * n : 3 * n]]

    return {
        "years": anos,
        "median": mediana,
        "centralTendency": tendencia_central,
        "range": intervalo,
    }


def main():
    print("[+] Buscando lista de SEPs (dot plot) do FOMC...")
    pdfs = busca_lista_pdfs()
    print(f"    {len(pdfs)} releases encontrados.")

    resultados = []
    for data_release, url in pdfs:
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            r.raise_for_status()
            with open(TMP_PDF_PATH, "wb") as f:
                f.write(r.content)
            dados = parse_sep_pdf(TMP_PDF_PATH)
        except Exception as e:
            print(f"    (aviso: erro processando {url}: {e})")
            continue
        finally:
            if os.path.exists(TMP_PDF_PATH):
                os.remove(TMP_PDF_PATH)

        if not dados:
            print(f"    (aviso: não consegui achar a tabela de fed funds em {url}, pulando)")
            continue

        resultados.append({
            "id": f"sep-{data_release.isoformat()}",
            "date": data_release.isoformat(),
            "sourceUrl": url,
            **dados,
        })

    resultados.sort(key=lambda r: r["date"], reverse=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    print(f"[✓] Sucesso! {len(resultados)} releases do dot plot (SEP) salvos em {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
