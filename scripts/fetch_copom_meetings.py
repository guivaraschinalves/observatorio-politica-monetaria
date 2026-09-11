#!/usr/bin/env python3
"""
Reconstrói src/data/copom_meetings.json (comunicado + ata de cada reunião,
usado pelo Leitor de Atas) inteiramente a partir de fontes públicas do Bacen —
substitui um conjunto anterior que era fabricado (reunião, taxa e texto
inventados).

Fontes:
- src/data/copom_comunicados_all.json (já gerado por fetch_all_copom_history.py
  nesta mesma execução): texto real do comunicado de cada reunião.
- API do Bacen (copom/atas + copom/atas_detalhes): texto real da ata de cada
  reunião. Atas anteriores a ~2016 usam um HTML de formato antigo (exportado
  de Word) que este parser não entende — são puladas, não adivinhadas.
- Série 432 do SGS (Meta Selic definida pelo Copom): a taxa antes e depois de
  cada reunião vem daqui, não de um regex sobre o texto do comunicado — é a
  fonte oficial e não depende de "achar o número certo" no meio do texto.

Uma reunião só entra no resultado final se tiver as três coisas: comunicado,
ata em formato reconhecível, e taxa resolvida na série do SGS.
"""
import os
import re
import json
import time
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
COMUNICADOS_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "copom_comunicados_all.json")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "copom_meetings.json")

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Accept": "application/json"}
ATAS_LIST_URL = "https://www.bcb.gov.br/api/servico/sitebcb/copom/atas?quantidade=500"
# Limite de reuniões no resultado final: ata + comunicado por reunião é bastante
# texto, e isso tudo vai embutido direto no JS do site (sem endpoint próprio
# pra buscar sob demanda) — 24 reuniões é ~3 anos de histórico e mantém o
# tamanho do bundle razoável.
MAX_REUNIOES = 24
ATA_DETALHE_URL = "https://www.bcb.gov.br/api/servico/sitebcb/copom/atas_detalhes?nro_reuniao={}"
SGS_SELIC_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados"


def limpa(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()


def busca_selic_historico(desde: str):
    """Baixa a série 432 (Meta Selic) em janelas de até 10 anos e devolve
    lista ordenada de (date, taxa_pct)."""
    inicio = datetime.strptime(desde, "%Y-%m-%d").date()
    fim_total = datetime.today().date()
    pontos = []
    cursor = inicio
    while cursor <= fim_total:
        fim_janela = min(cursor.replace(year=cursor.year + 9), fim_total)
        params = {
            "formato": "json",
            "dataInicial": cursor.strftime("%d/%m/%Y"),
            "dataFinal": fim_janela.strftime("%d/%m/%Y"),
        }
        dados = None
        for tentativa in range(4):
            try:
                r = requests.get(SGS_SELIC_URL, params=params, headers=HEADERS, timeout=60)
                r.raise_for_status()
                dados = r.json()
                break
            except (requests.exceptions.RequestException, ValueError) as e:
                corpo = r.text[:200] if "r" in dir() and hasattr(r, "text") else ""
                print(f"    (tentativa {tentativa + 1} falhou: {e} | corpo: {corpo!r}, tentando de novo)")
                time.sleep(3)
        if dados is None:
            raise RuntimeError(f"Não consegui buscar a série do SGS para a janela {cursor}–{fim_janela}.")
        for item in dados:
            d = datetime.strptime(item["data"], "%d/%m/%Y").date()
            pontos.append((d, float(item["valor"])))
        cursor = fim_janela + timedelta(days=1)
    pontos.sort(key=lambda p: p[0])
    return pontos


def taxa_antes_e_depois(serie, data_reuniao):
    """A Meta Selic da série do SGS só reflete a decisão a partir do dia
    seguinte à reunião (no próprio dia da decisão ainda vale a taxa antiga).
    Por isso: taxa "antes" é o último valor até a própria data da reunião
    (inclusive), e "depois" é o primeiro valor estritamente depois dela,
    em até 6 dias corridos (cobre fins de semana/feriado)."""
    antes = None
    depois = None
    limite = data_reuniao + timedelta(days=6)
    for d, taxa in serie:
        if d <= data_reuniao:
            antes = taxa
        elif data_reuniao < d <= limite and depois is None:
            depois = taxa
    return antes, depois


def parse_ata_moderna(html_texto: str):
    """Extrai seções/parágrafos do formato usado desde ~2016. Devolve None se
    não reconhecer o formato (ata antiga)."""
    soup = BeautifulSoup(html_texto, "html.parser")
    nodes = soup.find_all(["h3", "p"], class_=["secao", "paragrafo"])
    if not nodes:
        return None

    secoes = []
    atual = None
    for node in nodes:
        classes = node.get("class") or []
        if "secao" in classes:
            atual = {"title": limpa(node.get_text()), "paragraphs": []}
            secoes.append(atual)
        elif "paragrafo" in classes:
            texto = limpa(node.get_text())
            if not texto:
                continue
            if atual is None:
                atual = {"title": "Geral", "paragraphs": []}
                secoes.append(atual)
            atual["paragraphs"].append(texto)

    if not secoes or not any(s["paragraphs"] for s in secoes):
        return None
    return secoes


VOTOU_RE = re.compile(r"Votaram por essa decis[aã]o os seguintes membros[^:]*:\s*(.+?)\.", re.IGNORECASE)


def extrai_vote_split(secoes):
    for sec in secoes:
        for p in sec["paragraphs"]:
            m = VOTOU_RE.search(p)
            if m:
                nomes = m.group(1)
                # separa por vírgula e por " e " antes do último nome
                partes = re.split(r",| e ", nomes)
                n = len([x for x in partes if limpa(x)])
                if n > 0:
                    return f"Unânime ({n} votos)"
    return "Ver votação na ata"


def busca_ata(nro: int):
    r = requests.get(ATA_DETALHE_URL.format(nro), headers=HEADERS, timeout=20)
    if r.status_code != 200:
        return None
    conteudo = r.json().get("conteudo") or []
    if not conteudo:
        return None
    texto_ata = conteudo[0].get("textoAta", "")
    return parse_ata_moderna(texto_ata)


def main():
    with open(COMUNICADOS_PATH, encoding="utf-8") as f:
        comunicados = json.load(f)
    comunicados_por_numero = {c["number"]: c for c in comunicados}

    print(f"[+] {len(comunicados)} comunicados carregados.")

    primeira_data = min(c["date"] for c in comunicados)
    print(f"[+] Buscando a série histórica da Meta Selic desde {primeira_data}...")
    serie_selic = busca_selic_historico(primeira_data)
    print(f"    {len(serie_selic)} pontos na série.")

    print("[+] Buscando atas na API do Bacen...")
    resultados = []
    # Só olha as mais recentes (com folga sobre MAX_REUNIOES, pra sobrar
    # reuniões suficientes depois de descartar as com ata em formato antigo).
    numeros = sorted(comunicados_por_numero.keys(), reverse=True)[: MAX_REUNIOES * 3]
    with ThreadPoolExecutor(max_workers=8) as executor:
        futuros = {executor.submit(busca_ata, nro): nro for nro in numeros}
        puladas_formato_antigo = 0
        sem_taxa = 0
        done = 0
        for fut in as_completed(futuros):
            nro = futuros[fut]
            done += 1
            if done % 40 == 0:
                print(f"    progresso: {done}/{len(numeros)}")
            try:
                secoes = fut.result()
            except Exception as e:
                print(f"    (aviso: erro buscando ata {nro}: {e})")
                continue
            if not secoes:
                puladas_formato_antigo += 1
                continue

            comunicado = comunicados_por_numero[nro]
            data_reuniao = datetime.strptime(comunicado["date"], "%Y-%m-%d").date()
            antes, depois = taxa_antes_e_depois(serie_selic, data_reuniao)
            if antes is None or depois is None:
                sem_taxa += 1
                continue

            minutes = []
            for si, sec in enumerate(secoes):
                for pi, texto in enumerate(sec["paragraphs"]):
                    minutes.append({"id": f"m{nro}-s{si}-p{pi}", "section": sec["title"], "text": texto})

            statement = [
                {"id": f"c{nro}-p{i}", "text": texto}
                for i, texto in enumerate(comunicado["paragraphs"])
            ]

            decisao_par = next((p for p in comunicado["paragraphs"] if "Copom decidiu" in p), None)
            summary = decisao_par or (comunicado["paragraphs"][0] if comunicado["paragraphs"] else comunicado["title"])
            guidance_par = next(
                (p for p in reversed(comunicado["paragraphs"]) if "seguirá" in p or "próximos passos" in p.lower() or "balanço de riscos" in p.lower()),
                None,
            )
            key_guidance = guidance_par or summary

            resultados.append({
                "id": f"copom-{nro}",
                "committee": "copom",
                "meetingNumber": f"{nro}ª Reunião",
                "date": comunicado["date"],
                "rateDecision": f"{depois:.2f}%",
                "changeBps": round((depois - antes) * 100),
                "previousRate": f"{antes:.2f}%",
                "voteSplit": extrai_vote_split(secoes),
                "summary": summary,
                "keyGuidance": key_guidance,
                "statement": statement,
                "minutes": minutes,
            })

    resultados.sort(key=lambda m: m["date"], reverse=True)
    resultados = resultados[:MAX_REUNIOES]

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    print(f"[✓] Sucesso! {len(resultados)} reuniões (comunicado + ata + taxa) salvas em {OUTPUT_PATH}")
    print(f"    {puladas_formato_antigo} atas puladas (formato antigo, sem parser), {sem_taxa} sem taxa resolvida na série do SGS.")


if __name__ == "__main__":
    main()
