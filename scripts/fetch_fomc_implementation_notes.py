#!/usr/bin/env python3
"""
Implementation Notes do FOMC — a nota operacional que o Board publica junto
com o comunicado, com os parâmetros técnicos que a política monetária vira
na prática: taxa do IORB (juros sobre reservas), taxas de operações
compromissadas (repo/RRP), taxa de redesconto (primary credit) e a diretriz
formal ao Desk de Nova York. É o documento certo pra comparar reunião a
reunião quando o que importa é a mecânica de implementação, não só a
decisão anunciada no comunicado.

Só existe como documento distinto (URL própria) a partir de 2018 — antes
disso esses parâmetros vinham embutidos no próprio comunicado ou nem
existiam nesse formato (o regime de reservas abundantes só começou depois
da crise de 2008, e a nota como release separada veio ainda mais tarde).
Reuniões mais antigas simplesmente não entram aqui — não é fabricado.

Fonte oficial: mesmo padrão de URL previsível do comunicado
(federalreserve.gov/newsevents/pressreleases/monetary{YYYYMMDD}a.htm), só
que com "1" no final (monetary{YYYYMMDD}a1.htm). Descobre sozinho quais
datas têm nota checando todas as reuniões de fomc_statements_all.json e
ignorando as que devolvem 404 — não depende de um índice à parte.
"""
import os
import re
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup, NavigableString

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STATEMENTS_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_statements_all.json")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_implementation_notes.json")
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}


def extrai_paragrafos(soup):
    h3 = soup.find("h3")
    if not h3:
        return None
    heading_row = h3.find_parent("div", class_="row")
    if not heading_row:
        return None
    content_row = heading_row.find_next_sibling("div", class_="row")
    if not content_row:
        return None
    container = content_row.find("div")
    if not container:
        return None

    paragrafos = []
    for tag in container.find_all(["p", "li"]):
        if tag.name == "li":
            # Só o texto que é filho direto do <li> — um <li> que embrulha um
            # <p> ou um <blockquote> (a diretriz ao Desk vem assim) já tem
            # esse conteúdo capturado separadamente, como "p" próprio, quando
            # o loop chegar nele.
            texto = "".join(str(c) for c in tag.contents if isinstance(c, NavigableString))
        else:
            texto = tag.get_text(" ", strip=True)
        texto = re.sub(r"\s+", " ", texto).strip()
        if texto:
            paragrafos.append(texto)
    return paragrafos or None


def busca_uma(data_iso):
    d = data_iso.replace("-", "")
    url = f"https://www.federalreserve.gov/newsevents/pressreleases/monetary{d}a1.htm"
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
    except requests.exceptions.RequestException:
        return None
    if r.status_code != 200:
        return None
    r.encoding = "utf-8"
    soup = BeautifulSoup(r.text, "html.parser")
    paragrafos = extrai_paragrafos(soup)
    if not paragrafos:
        return None

    dt = datetime.strptime(data_iso, "%Y-%m-%d").date()
    return {
        "id": f"fomc-impl-{data_iso}",
        "meetingNumber": f"FOMC {dt.strftime('%B %Y')}",
        "date": data_iso,
        "title": f"Implementation Note - {data_iso}",
        "paragraphs": paragrafos,
        "fullText": "\n\n".join(paragrafos),
        "sourceUrl": url,
    }


def main():
    with open(STATEMENTS_PATH, encoding="utf-8") as f:
        statements = json.load(f)
    datas = sorted({s["date"] for s in statements}, reverse=True)

    print(f"[+] Checando notas de implementação em até {len(datas)} reuniões (site oficial do Fed)...")
    resultados = []
    with ThreadPoolExecutor(max_workers=12) as ex:
        futuros = {ex.submit(busca_uma, d): d for d in datas}
        feitos = 0
        for fut in as_completed(futuros):
            feitos += 1
            if feitos % 40 == 0:
                print(f"    progresso: {feitos}/{len(datas)}")
            r = fut.result()
            if r:
                resultados.append(r)

    resultados.sort(key=lambda r: r["date"], reverse=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    print(f"[✓] Sucesso! {len(resultados)} notas de implementação salvas em {OUTPUT_PATH}")
    if resultados:
        print(f"    Desde {resultados[-1]['date']} até {resultados[0]['date']}.")


if __name__ == "__main__":
    main()
