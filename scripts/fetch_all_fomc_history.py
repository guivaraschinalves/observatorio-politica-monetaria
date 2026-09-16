#!/usr/bin/env python3
"""
Extrai o histórico COMPLETO de declarações (statements) do FOMC desde 2000 até a última reunião.

A base é um CSV de terceiros (github.com/vtasca/fed-statement-scraping) que
cobre bem o histórico mas atualiza com atraso — historicamente até algumas
semanas depois de cada reunião nova. Pra não deixar a reunião mais recente de
fora enquanto isso, complementa com as reuniões que já têm statement no
site oficial do Fed mas ainda não apareceram no CSV, usando o mesmo padrão de
URL previsível (monetary{YYYYMMDD}a.htm) que fetch_fomc_dotplot.py já usa pro
SEP. Isso se auto-corrige sozinho: no dia em que o CSV alcançar essas
reuniões, elas voltam a vir de lá.
"""
import os
import re
import pandas as pd
import json
import requests
from datetime import date, datetime
from bs4 import BeautifulSoup

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
URL = 'https://raw.githubusercontent.com/vtasca/fed-statement-scraping/master/communications.csv'
CALENDAR_URL = "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

# Rodapé do site do Fed que o CSV de terceiros às vezes inclui junto com o
# texto real do statement ("For media inquiries, please email... or call
# 202-452-2955." e o link "Implementation Note issued <data>") — não é parte
# do comunicado, e como só aparece em algumas reuniões (a nota de
# implementação nem sempre existe) virava ruído falso no comparador de
# statements, marcado como "removido" numa reunião só por estar ausente na
# outra. Filtrado aqui e no fallback abaixo, pros dois caminhos ficarem
# sempre consistentes.
BOILERPLATE_RE = re.compile(r"^(for media inquiries|implementation note issued)\b", re.IGNORECASE)


def clean_fomc_text(raw_text):
    if not isinstance(raw_text, str) or not raw_text.strip():
        return []

    # Split into paragraphs by double newlines or clean breaks
    lines = raw_text.replace('\r\n', '\n').split('\n\n')
    paragraphs = []
    for line in lines:
        cleaned = re.sub(r'\s+', ' ', line).strip()
        if cleaned and len(cleaned) > 15 and not BOILERPLATE_RE.match(cleaned):
            # Skip boilerplate disclaimers if any
            paragraphs.append(cleaned)
    return paragraphs


def busca_statements_recentes_direto_do_fed(datas_existentes):
    try:
        r = requests.get(CALENDAR_URL, headers=HEADERS, timeout=20)
        r.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"    (não consegui buscar o calendário do Fed pra checar reuniões recentes: {e})")
        return []

    datas_calendario = sorted(set(re.findall(r"monetary(\d{8})a\.htm", r.text)))
    novos = []
    for d in datas_calendario:
        dt = datetime.strptime(d, "%Y%m%d").date()
        if dt > date.today() or dt.isoformat() in datas_existentes:
            continue
        url = f"https://www.federalreserve.gov/newsevents/pressreleases/monetary{d}a.htm"
        try:
            rr = requests.get(url, headers=HEADERS, timeout=20)
            rr.raise_for_status()
        except requests.exceptions.RequestException:
            continue
        rr.encoding = "utf-8"

        soup = BeautifulSoup(rr.text, "html.parser")
        release_p = soup.find("p", class_="releaseTime")
        if not release_p:
            continue
        # O corpo do statement são os <p> sem classe logo depois do parágrafo
        # "For release at..." — os com classe são metadado (data, timestamp).
        paragraphs = []
        for p in release_p.find_all_next("p"):
            if p.get("class"):
                continue
            texto = re.sub(r"\s+", " ", p.get_text(" ", strip=True)).strip()
            if not texto:
                continue
            baixo = texto.lower()
            if "media inquiries" in baixo or "last update" in baixo:
                break
            if len(texto) > 15 and not BOILERPLATE_RE.match(texto):
                paragraphs.append(texto)
        if not paragraphs:
            continue

        iso = dt.isoformat()
        novos.append({
            "id": f"fomc-{iso}",
            "meetingNumber": f"FOMC {dt.strftime('%B %Y')}",
            "date": iso,
            "title": f"FOMC Statement - {iso}",
            "paragraphs": paragraphs,
            "fullText": "\n\n".join(paragraphs),
        })
    return novos


def main():
    print("[+] Baixando dataset de comunicações do FOMC...")
    df = pd.read_csv(URL)
    statements = df[df['Type'] == 'Statement'].copy()
    print(f"[+] Total de statements FOMC encontrados: {len(statements)}")

    # Sort descending by date
    statements['Date'] = pd.to_datetime(statements['Date'])
    statements = statements.sort_values(by='Date', ascending=False)

    results = []
    for idx, row in statements.iterrows():
        dt_str = row['Date'].strftime('%Y-%m-%d')
        year_str = row['Date'].strftime('%B %Y')
        raw_text = str(row['Text'])
        paragraphs = clean_fomc_text(raw_text)

        results.append({
            "id": f"fomc-{dt_str}",
            "meetingNumber": f"FOMC {year_str}",
            "date": dt_str,
            "title": f"FOMC Statement - {dt_str}",
            "paragraphs": paragraphs,
            "fullText": "\n\n".join(paragraphs)
        })

    print("[+] Checando se há reunião recente ainda não presente nesse dataset...")
    datas_existentes = {r["date"] for r in results}
    extras = busca_statements_recentes_direto_do_fed(datas_existentes)
    if extras:
        print(f"    +{len(extras)} statement(s) recentes direto do site oficial do Fed.")
        results.extend(extras)
    results.sort(key=lambda r: r["date"], reverse=True)

    output_path = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_statements_all.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"[✓] Sucesso! {len(results)} statements do FOMC salvos em {output_path}")

if __name__ == "__main__":
    main()
