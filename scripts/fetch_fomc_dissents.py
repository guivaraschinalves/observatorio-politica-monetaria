#!/usr/bin/env python3
"""
Histórico de dissidências do FOMC desde 1936 — direto da planilha oficial do
Federal Reserve Bank of St. Louis, apêndice de dados do artigo "Making Sense
of Dissents: A History of FOMC Dissents" (Thornton & Wheelock, St. Louis Fed
Review, 2014), mantida atualizada por eles até hoje.

https://www.stlouisfed.org/-/media/project/frbstl/stlouisfed/files/excel/fomc_dissents_data.xlsx

Essa planilha dá o nome (sobrenome) de quem dissentiu e a direção (a favor de
aperto/alívio/outro motivo), mas não o tamanho do passo que cada um preferia.
Pra isso, cruza com src/data/fomc_statements_all.json (o texto real do
"Voting against ... who preferred/supported ...") e tenta extrair um número:
- "by X percentage point(s)" / "by/of X basis points" → direto.
- "to/at W to Z percent" (alvo absoluto) → compara com a decisão de fato
  daquela mesma reunião (extraída do "Committee decided to ... at/to A to B
  percent" no mesmo texto) pra achar a diferença.
- "no change"/"maintain the existing/current target range" (sem número) → 0.

Quando nada disso bate — boa parte das dissidências de 2008-2015 foram sobre
orientação futura (forward guidance) ou compra de ativos, não sobre um nível
específico de juros —, o campo fica sem número (null), não um chute.

Essa planilha do St. Louis Fed também atualiza com atraso (igual o CSV de
comunicados que fetch_all_fomc_history.py usa) — pode não ter ainda a
reunião mais recente. Pra essa não ficar de fora, complementa lendo o placar
geral ("approved ... by a N – M vote") e, se houver, o "Voting against"
direto do texto do statement (o mesmo `fomc_statements_all.json`, que já tem
seu próprio fallback pra reunião recente via site oficial do Fed) — sem
posição do Chair na planilha ainda, herda o último Chair conhecido. Se
autocorrige quando a planilha alcançar essa reunião.
"""
import os
import re
import json
from datetime import datetime

import requests
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STATEMENTS_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_statements_all.json")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_dissents.json")
TMP_XLSX_PATH = os.path.join(SCRIPT_DIR, "..", ".fomc_dissents_tmp.xlsx")

# Sem headers customizados de propósito: como no FRED, esse domínio (também
# atrás de Akamai) trava/dá erro de HTTP2 quando o User-Agent se parece com
# navegador; com o UA-padrão do `requests` funciona de primeira.
XLSX_URL = "https://www.stlouisfed.org/-/media/project/frbstl/stlouisfed/files/excel/fomc_dissents_data.xlsx"

MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

DECISAO_RE = re.compile(
    r"decided to \w+ the target range for the federal funds rate (?:at|to) ([\d\-/]+) to ([\d\-/]+) percent",
    re.IGNORECASE,
)
VOTANDO_CONTRA_RE = re.compile(r"Voting against[^.]*?(?:was|were):?\s*(.+?)(?:\s*Absent|$)", re.IGNORECASE)
# Para no primeiro "meeting"/"time" (fecho natural dessas frases no corpus),
# em vez de parar só em "." — um "." dentro de uma inicial do meio do nome
# seguinte (ex. "Beth M. Hammack") cortava a cláusula errado e vazava um
# pedaço do próximo nome pra dentro dela.
QUEM_RE = re.compile(r"who .+?(?:meeting|time)\b")
NOME_RE = re.compile(r"[A-Z][a-zA-Z.]+ (?:[A-Z]\. )?[A-Z][a-zA-Z]+")
VOTO_GERAL_RE = re.compile(r"by a (\d+)\s*[–—-]\s*(\d+) vote", re.IGNORECASE)


def formata_data(d) -> str:
    return f"{d.day} {MESES[d.month - 1]} {d.year}"


def separa_nomes(v):
    if pd.isna(v):
        return []
    return [n.strip() for n in str(v).split(",") if n.strip()]


def num_ou_zero(v):
    if pd.isna(v):
        return 0
    return int(v)


def parse_percentual(s: str):
    s = s.strip()
    m = re.match(r"^(\d+)-(\d+)/(\d+)$", s)
    if m:
        inteiro, num, den = (int(x) for x in m.groups())
        return inteiro + num / den
    m = re.match(r"^(\d+)/(\d+)$", s)
    if m:
        num, den = (int(x) for x in m.groups())
        return num / den
    m = re.match(r"^(\d+(?:\.\d+)?)$", s)
    if m:
        return float(m.group(1))
    return None


def extrai_decisao_bps(texto_completo: str):
    m = DECISAO_RE.search(texto_completo)
    if not m:
        return None
    a, b = parse_percentual(m.group(1)), parse_percentual(m.group(2))
    if a is None or b is None:
        return None
    return round((a + b) / 2 * 100)


def extrai_magnitude_bps(clausula: str, decisao_bps):
    sinal = -1 if re.search(r"lower|decrease|reduc|cut", clausula, re.IGNORECASE) else 1

    m = re.search(r"by (\d+(?:/\d+)?)\s*percentage point", clausula, re.IGNORECASE)
    if m:
        v = parse_percentual(m.group(1))
        if v is not None:
            return round(sinal * v * 100)

    m = re.search(r"(\d+)\s*basis points?", clausula, re.IGNORECASE)
    if m:
        return sinal * int(m.group(1))

    if re.search(r"no change|maintain(?:ing|ed)? (?:the|existing|current)? ?target", clausula, re.IGNORECASE) and not re.search(r"\d", clausula):
        return 0

    if decisao_bps is not None:
        m = re.search(r"(?:to|at) (\d[\d\-/]*) to (\d[\d\-/]*) percent", clausula, re.IGNORECASE)
        if m:
            a, b = parse_percentual(m.group(1)), parse_percentual(m.group(2))
            if a is not None and b is not None:
                alvo_bps = round((a + b) / 2 * 100)
                return alvo_bps - decisao_bps

    return None


def monta_indice_magnitudes(statements):
    """{data_iso: {sobrenome: magnitude_bps}} — só pras reuniões com frase de
    votação reconhecível no texto do statement.

    Isola primeiro só o trecho "Voting against ... " (pra não pegar um "who"
    de qualquer outra parte do texto) e depois anda clausula por clausula,
    em ordem, atribuindo a cada uma só os nomes que aparecem ENTRE o fim da
    clausula anterior e o início dela — sem isso, o texto de uma clausula
    "vaza" pra trás e atribui o motivo errado a quem já foi processado
    numa clausula anterior (ex.: "A, quem preferia X; e B e C, quem
    preferiam Y" atribuindo Y também para A)."""
    indice = {}
    for s in statements:
        texto_completo = " ".join(s["paragraphs"])
        m_against = VOTANDO_CONTRA_RE.search(texto_completo)
        if not m_against:
            continue
        against_texto = m_against.group(1)
        decisao_bps = extrai_decisao_bps(texto_completo)

        por_sobrenome = {}
        cursor = 0
        for m_clausula in QUEM_RE.finditer(against_texto):
            clausula = m_clausula.group()
            trecho_antes = against_texto[cursor:m_clausula.start()]
            cursor = m_clausula.end()

            magnitude = extrai_magnitude_bps(clausula, decisao_bps)
            if magnitude is None:
                continue
            for nome in NOME_RE.findall(trecho_antes):
                sobrenome = nome.strip().split()[-1]
                por_sobrenome[sobrenome] = magnitude
        if por_sobrenome:
            indice[s["date"]] = por_sobrenome
    return indice


def monta_fallback_recentes(statements, datas_existentes, indice_magnitudes, ultimo_chair):
    novos = []
    for s in statements:
        if s["date"] in datas_existentes:
            continue
        texto_completo = " ".join(s["paragraphs"])
        m_voto = VOTO_GERAL_RE.search(texto_completo)
        if not m_voto:
            continue
        votes_for, votes_against = int(m_voto.group(1)), int(m_voto.group(2))

        magnitudes = indice_magnitudes.get(s["date"], {})
        dissidentes = []
        m_against = VOTANDO_CONTRA_RE.search(texto_completo)
        if m_against:
            for nome in NOME_RE.findall(m_against.group(1)):
                sobrenome = nome.strip().split()[-1]
                dissidentes.append({"name": sobrenome, "magnitudeBps": magnitudes.get(sobrenome)})

        d = datetime.strptime(s["date"], "%Y-%m-%d").date()
        novos.append({
            "id": f"fomc-dissent-{s['date']}",
            "committee": "fomc",
            "meetingNumber": f"FOMC {formata_data(d)}",
            "date": s["date"],
            "chair": ultimo_chair,
            "unanimous": votes_against == 0,
            "totalVotes": votes_for + votes_against,
            "votesFor": votes_for,
            "votesAgainst": votes_against,
            "dissenters": dissidentes,
        })
    return novos


def main():
    print("[+] Buscando a planilha de dissidências do FOMC (St. Louis Fed)...")
    r = requests.get(XLSX_URL, timeout=60)
    r.raise_for_status()
    with open(TMP_XLSX_PATH, "wb") as f:
        f.write(r.content)

    try:
        df = pd.read_excel(TMP_XLSX_PATH, sheet_name="Data", header=3)
    finally:
        os.remove(TMP_XLSX_PATH)

    df = df.dropna(subset=["FOMC Meeting"])
    print(f"    {len(df)} reuniões na planilha.")

    with open(STATEMENTS_PATH, encoding="utf-8") as f:
        statements = json.load(f)
    indice_magnitudes = monta_indice_magnitudes(statements)
    print(f"    magnitude do dissenso resolvida em {len(indice_magnitudes)} reuniões (via texto do statement).")

    resultados = []
    for _, row in df.iterrows():
        data = row["FOMC Meeting"]
        if pd.isna(data):
            continue
        data_iso = data.date().isoformat() if hasattr(data, "date") else str(data)[:10]
        dissentiu = str(row["Dissent (Y or N)"]).strip().upper() == "Y"

        magnitudes = indice_magnitudes.get(data_iso, {})
        dissidentes = []
        for sobrenome in (
            separa_nomes(row.get("Dissenters Tighter"))
            + separa_nomes(row.get("Dissenters Easier"))
            + separa_nomes(row.get("Dissenters Other/Indeterminate"))
        ):
            dissidentes.append({
                "name": sobrenome,
                "magnitudeBps": magnitudes.get(sobrenome),
            })

        resultados.append({
            "id": f"fomc-dissent-{data_iso}",
            "committee": "fomc",
            "meetingNumber": f"FOMC {formata_data(data)}",
            "date": data_iso,
            "chair": row.get("Chair") if not pd.isna(row.get("Chair")) else None,
            "unanimous": not dissentiu,
            "totalVotes": num_ou_zero(row.get("FOMC Votes")),
            "votesFor": num_ou_zero(row.get("Votes for Action")),
            "votesAgainst": num_ou_zero(row.get("Votes Against Action")),
            "dissenters": dissidentes,
        })

    resultados.sort(key=lambda r: r["date"], reverse=True)

    datas_existentes = {r["date"] for r in resultados}
    ultimo_chair = resultados[0]["chair"] if resultados else None
    extras = monta_fallback_recentes(statements, datas_existentes, indice_magnitudes, ultimo_chair)
    if extras:
        print(f"    +{len(extras)} reunião(ões) recente(s) direto do texto do statement (ainda não na planilha do St. Louis Fed).")
        resultados = extras + resultados
        resultados.sort(key=lambda r: r["date"], reverse=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    com_dissenso = sum(1 for r in resultados if not r["unanimous"])
    with_mag = sum(1 for r in resultados for d in r["dissenters"] if d["magnitudeBps"] is not None)
    total_diss = sum(len(r["dissenters"]) for r in resultados)
    print(f"[✓] Sucesso! {len(resultados)} reuniões do FOMC salvas em {OUTPUT_PATH}")
    print(f"    {com_dissenso} com dissidência, desde {resultados[-1]['date']}. Magnitude resolvida em {with_mag}/{total_diss} dissidentes.")


if __name__ == "__main__":
    main()
