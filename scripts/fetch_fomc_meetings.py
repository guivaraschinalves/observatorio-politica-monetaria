#!/usr/bin/env python3
"""
Reconstrói src/data/fomc_meetings.json (comunicado + minutes de cada reunião,
usado pelo Leitor de Atas) inteiramente a partir de fontes públicas —
substitui um conjunto anterior que era fabricado.

Fontes:
- src/data/fomc_statements_all.json (já gerado por fetch_all_fomc_history.py
  nesta mesma execução): texto real do statement de cada reunião, inclusive
  a lista de votos ("Voting for..."/"Voting against...").
- federalreserve.gov/monetarypolicy/fomcminutesYYYYMMDD.htm: texto real das
  minutes de cada reunião — URL previsível a partir da data da reunião, então
  não precisa de índice/listagem separada.
- FRED (St. Louis Fed), séries DFEDTARU/DFEDTARL: limite superior e inferior
  do target range dos Fed Funds, direto do CSV público do FRED — não depende
  de interpretar frações por extenso ("4-1/4 to 4-1/2 percent") no texto do
  statement.

Só entram no resultado as reuniões com as três coisas resolvidas: statement,
minutes (a página existe e casa com o layout esperado) e range de juros.
"""
import os
import re
import json
import csv
import io
import time
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STATEMENTS_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_statements_all.json")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_meetings.json")

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
MINUTES_URL = "https://www.federalreserve.gov/monetarypolicy/fomcminutes{}.htm"
FRED_CSV_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv"
# Limite de reuniões no resultado final: minutes do FOMC são documentos longos,
# e isso tudo vai embutido direto no JS do site (sem endpoint próprio pra
# buscar sob demanda) — 24 reuniões é ~3 anos de histórico e mantém o tamanho
# do bundle razoável.
MAX_REUNIOES = 24


def limpa(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()


def busca_serie_fred(series_id: str, desde: str):
    # Sem headers customizados de propósito: o FRED trava/timeout numa faixa
    # grande de datas quando o User-Agent se apresenta como navegador (o WAF
    # deles parece tratar isso como suspeito); com o UA-padrão do `requests`
    # responde na hora.
    params = {"id": series_id, "cosd": desde, "coed": datetime.today().date().isoformat()}
    texto = None
    for tentativa in range(4):
        try:
            r = requests.get(FRED_CSV_URL, params=params, timeout=60)
            r.raise_for_status()
            texto = r.text
            break
        except requests.exceptions.RequestException as e:
            print(f"    (tentativa {tentativa + 1} falhou buscando {series_id}: {e}, tentando de novo)")
            time.sleep(3)
    if texto is None:
        raise RuntimeError(f"Não consegui buscar a série {series_id} do FRED.")
    leitor = csv.reader(io.StringIO(texto))
    next(leitor)  # cabeçalho
    pontos = []
    for linha in leitor:
        if len(linha) < 2 or linha[1] in (".", ""):
            continue
        pontos.append((datetime.strptime(linha[0], "%Y-%m-%d").date(), float(linha[1])))
    pontos.sort(key=lambda p: p[0])
    return pontos


def valor_antes_e_depois(serie, data_reuniao):
    antes = None
    depois = None
    limite = data_reuniao + timedelta(days=6)
    for d, v in serie:
        if d <= data_reuniao:
            antes = v
        elif data_reuniao < d <= limite and depois is None:
            depois = v
    return antes, depois


VOTING_FOR_RE = re.compile(r"Voting for the monetary policy action (?:was|were) (.+?)\.\s*(?:Voting against|$)", re.IGNORECASE)
VOTING_AGAINST_RE = re.compile(r"Voting against (?:this action|the monetary policy action) (?:was|were) (.+)", re.IGNORECASE)


def conta_nomes(trecho: str) -> int:
    # nomes são separados por ";" quando tem cargo junto ("Nome, Cargo; Nome; ...");
    # cai pra "," quando é só uma lista simples de nomes.
    partes = re.split(r";", trecho) if ";" in trecho else re.split(r",| and ", trecho)
    return len([p for p in partes if limpa(p)])


def extrai_vote_split(paragraphs):
    for p in paragraphs:
        m_for = VOTING_FOR_RE.search(p)
        if m_for:
            n_for = conta_nomes(m_for.group(1))
            m_against = VOTING_AGAINST_RE.search(p)
            n_against = conta_nomes(m_against.group(1)) if m_against else 0
            return f"{n_for}x{n_against}" if n_against else f"Unânime ({n_for}x0)"
    return "Ver votação no statement"


def busca_minutes(data_iso: str):
    data_url = data_iso.replace("-", "")
    r = requests.get(MINUTES_URL.format(data_url), headers=HEADERS, timeout=20)
    if r.status_code != 200:
        return None
    r.encoding = "utf-8"
    soup = BeautifulSoup(r.text, "html.parser")
    artigo = soup.find(id="article")
    if not artigo:
        return None

    secoes = []
    atual = None
    for p in artigo.find_all("p", recursive=False):
        strong = p.find("strong")
        lidera_com_strong = bool(strong and p.contents and p.contents[0] == strong)
        texto_completo = limpa(p.get_text())
        if not texto_completo:
            continue
        if "Return to text" in p.get_text():
            continue  # notas de rodapé numeradas no fim do documento

        if lidera_com_strong:
            titulo = limpa(strong.get_text())
            resto = limpa(p.get_text()[len(strong.get_text()):])
            atual = {"title": titulo, "paragraphs": []}
            secoes.append(atual)
            if resto:
                atual["paragraphs"].append(resto)
        else:
            if atual is None:
                atual = {"title": "Geral", "paragraphs": []}
                secoes.append(atual)
            atual["paragraphs"].append(texto_completo)

    if not secoes or not any(s["paragraphs"] for s in secoes):
        return None
    return secoes


def main():
    with open(STATEMENTS_PATH, encoding="utf-8") as f:
        statements = json.load(f)
    print(f"[+] {len(statements)} statements carregados.")

    # Só olha os mais recentes (com folga sobre MAX_REUNIOES, pra sobrar
    # reuniões suficientes depois de descartar as sem minutes reconhecíveis).
    statements = sorted(statements, key=lambda s: s["date"], reverse=True)[: MAX_REUNIOES * 3]

    primeira_data = min(s["date"] for s in statements)
    print(f"[+] Buscando o target range de Fed Funds (FRED) desde {primeira_data}...")
    serie_upper = busca_serie_fred("DFEDTARU", primeira_data)
    serie_lower = busca_serie_fred("DFEDTARL", primeira_data)
    print(f"    {len(serie_upper)} pontos.")

    print("[+] Buscando minutes no site do Fed...")
    minutes_por_data = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futuros = {executor.submit(busca_minutes, s["date"]): s["date"] for s in statements}
        done = 0
        for fut in as_completed(futuros):
            data = futuros[fut]
            done += 1
            if done % 40 == 0:
                print(f"    progresso: {done}/{len(statements)}")
            try:
                minutes_por_data[data] = fut.result()
            except Exception as e:
                print(f"    (aviso: erro buscando minutes de {data}: {e})")
                minutes_por_data[data] = None

    resultados = []
    puladas_sem_minutes = 0
    sem_range = 0

    for idx, s in enumerate(statements):
        data_reuniao = datetime.strptime(s["date"], "%Y-%m-%d").date()

        secoes = minutes_por_data.get(s["date"])
        if not secoes:
            puladas_sem_minutes += 1
            continue

        upper_antes, upper_depois = valor_antes_e_depois(serie_upper, data_reuniao)
        lower_antes, lower_depois = valor_antes_e_depois(serie_lower, data_reuniao)
        if None in (upper_antes, upper_depois, lower_antes, lower_depois):
            sem_range += 1
            continue

        rate_decision = f"{lower_depois:.2f}% - {upper_depois:.2f}%"
        previous_rate = f"{lower_antes:.2f}% - {upper_antes:.2f}%"
        change_bps = round((lower_depois - lower_antes) * 100)

        minutes = []
        for si, sec in enumerate(secoes):
            for pi, texto in enumerate(sec["paragraphs"]):
                minutes.append({"id": f"m{idx}-s{si}-p{pi}", "section": sec["title"], "text": texto})

        statement_paragraphs = [
            {"id": f"c{idx}-p{i}", "text": texto}
            for i, texto in enumerate(s["paragraphs"])
        ]

        decisao_par = next(
            (p for p in s["paragraphs"] if "decided to" in p.lower() and ("target range" in p.lower() or "federal funds rate" in p.lower())),
            None,
        )
        summary = decisao_par or (s["paragraphs"][0] if s["paragraphs"] else s["title"])
        guidance_par = next(
            (p for p in reversed(s["paragraphs"]) if "committee" in p.lower() and ("assess" in p.lower() or "monitor" in p.lower() or "outlook" in p.lower())),
            None,
        )
        key_guidance = guidance_par or summary

        resultados.append({
            "id": f"fomc-{s['date']}",
            "committee": "fomc",
            "meetingNumber": s["meetingNumber"],
            "date": s["date"],
            "rateDecision": rate_decision,
            "changeBps": change_bps,
            "previousRate": previous_rate,
            "voteSplit": extrai_vote_split(s["paragraphs"]),
            "summary": summary,
            "keyGuidance": key_guidance,
            "statement": statement_paragraphs,
            "minutes": minutes,
        })

    resultados.sort(key=lambda m: m["date"], reverse=True)
    resultados = resultados[:MAX_REUNIOES]

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    print(f"[✓] Sucesso! {len(resultados)} reuniões (statement + minutes + range) salvas em {OUTPUT_PATH}")
    print(f"    {puladas_sem_minutes} sem minutes disponíveis/reconhecíveis, {sem_range} sem range resolvido no FRED.")


if __name__ == "__main__":
    main()
