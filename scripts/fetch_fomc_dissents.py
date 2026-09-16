#!/usr/bin/env python3
"""
Histórico de dissidências do FOMC desde 1936 — direto da planilha oficial do
Federal Reserve Bank of St. Louis, apêndice de dados do artigo "Making Sense
of Dissents: A History of FOMC Dissents" (Thornton & Wheelock, St. Louis Fed
Review, 2014), mantida atualizada por eles até hoje.

https://www.stlouisfed.org/-/media/project/frbstl/stlouisfed/files/excel/fomc_dissents_data.xlsx

Isso substitui a ideia inicial de tentar extrair quem dissentiu e por que a
partir de regex em cima do texto dos statements — essa planilha é a fonte
primária, oficial, e cobre 90 anos (o texto dos statements com "Voting
for/against" só existe de 2002 pra cá, mesmo assim com formato inconsistente
demais pra confiar 100% num parser caseiro).

Uma limitação real dela: nas décadas mais antigas (até uns anos 1970-80) ela
só registra CONTAGEM de dissidentes, sem nome — a coluna de nomes começa a
vir preenchida quando a documentação da época passou a registrar isso.
"""
import os
import re
import json
from datetime import datetime

import requests
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_dissents.json")
TMP_XLSX_PATH = os.path.join(SCRIPT_DIR, "..", ".fomc_dissents_tmp.xlsx")

# Sem headers customizados de propósito: como no FRED, esse domínio (também
# atrás de Akamai) trava/dá erro de HTTP2 quando o User-Agent se parece com
# navegador; com o UA-padrão do `requests` funciona de primeira.
XLSX_URL = "https://www.stlouisfed.org/-/media/project/frbstl/stlouisfed/files/excel/fomc_dissents_data.xlsx"

MESES = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
]


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

    resultados = []
    for _, row in df.iterrows():
        data = row["FOMC Meeting"]
        if pd.isna(data):
            continue
        data_iso = data.date().isoformat() if hasattr(data, "date") else str(data)[:10]
        dissentiu = str(row["Dissent (Y or N)"]).strip().upper() == "Y"

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
            "governorsDissenting": num_ou_zero(row.get("Number Governors Dissenting")),
            "presidentsDissenting": num_ou_zero(row.get("Number Presidents Dissenting")),
            "dissentersTighter": separa_nomes(row.get("Dissenters Tighter")),
            "dissentersEasier": separa_nomes(row.get("Dissenters Easier")),
            "dissentersOther": separa_nomes(row.get("Dissenters Other/Indeterminate")),
        })

    resultados.sort(key=lambda r: r["date"], reverse=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    com_dissenso = sum(1 for r in resultados if not r["unanimous"])
    print(f"[✓] Sucesso! {len(resultados)} reuniões do FOMC salvas em {OUTPUT_PATH}")
    print(f"    {com_dissenso} com dissidência, desde {resultados[-1]['date']}.")


if __name__ == "__main__":
    main()
