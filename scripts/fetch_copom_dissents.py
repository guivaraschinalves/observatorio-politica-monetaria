#!/usr/bin/env python3
"""
Histórico de votações do Copom desde a 21ª reunião (1998) — direto da
planilha oficial que o próprio Bacen publica e mantém:
https://www.bcb.gov.br/content/controleinflacao/controleinflacao_docs/votacoes-copom/historico-votacoes-Copom.xlsx

Nomeação individual de quem votou só existe a partir da 167ª reunião (30 de
maio de 2012, segundo a própria planilha — antes disso, o boletim registra só
o placar agregado, ex. "7 x 1", sem dizer quem ficou em cada lado).
"""
import os
import json

import requests
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "copom_dissents.json")
TMP_XLSX_PATH = os.path.join(SCRIPT_DIR, "..", ".copom_votes_tmp.xlsx")

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
XLSX_URL = "https://www.bcb.gov.br/content/controleinflacao/controleinflacao_docs/votacoes-copom/historico-votacoes-Copom.xlsx"

COLUNAS = [
    "Reuniao", "Data", "DecisaoSelic", "VariacaoSelic", "Placar",
    "Votante", "VotoVariacao", "VotoMenosDecisao", "Major", "Disson",
]


def num(v):
    try:
        return float(str(v).replace(",", "."))
    except (TypeError, ValueError):
        return None


def main():
    print("[+] Buscando a planilha de votações do Copom (Bacen)...")
    r = requests.get(XLSX_URL, headers=HEADERS, timeout=60)
    r.raise_for_status()
    with open(TMP_XLSX_PATH, "wb") as f:
        f.write(r.content)

    try:
        df = pd.read_excel(TMP_XLSX_PATH, sheet_name="Português", header=12)
    finally:
        os.remove(TMP_XLSX_PATH)

    df = df.iloc[:, 10:20]
    df.columns = COLUNAS
    df["Reuniao"] = pd.to_numeric(df["Reuniao"], errors="coerce")
    df = df[pd.notna(df["Reuniao"])].copy()
    df["Reuniao"] = df["Reuniao"].astype(int)
    print(f"    {df['Reuniao'].nunique()} reuniões na planilha.")

    resultados = []
    for reuniao, grupo in df.groupby("Reuniao"):
        primeira = grupo.iloc[0]
        data = primeira["Data"]
        data_iso = data.date().isoformat() if hasattr(data, "date") else str(data)[:10]
        placar = str(primeira["Placar"]).strip()
        tem_nomes = grupo["Votante"].notna().any()

        votos = []
        if tem_nomes:
            for _, linha in grupo.iterrows():
                nome = linha["Votante"]
                if pd.isna(nome):
                    continue
                votos.append({
                    "name": str(nome).strip(),
                    "count": 1,
                    "preferredChangeBps": round(num(linha["VotoVariacao"]) * 100) if num(linha["VotoVariacao"]) is not None else None,
                    "diffFromDecisionBps": round(num(linha["VotoMenosDecisao"]) * 100) if num(linha["VotoMenosDecisao"]) is not None else None,
                })
        else:
            for _, linha in grupo.iterrows():
                contagem = None
                for col in ("Major", "Disson"):
                    v = linha[col]
                    if pd.notna(v) and v not in (0, 0.0):
                        contagem = int(v)
                        break
                votos.append({
                    "name": None,
                    "count": contagem,
                    "preferredChangeBps": round(num(linha["VotoVariacao"]) * 100) if num(linha["VotoVariacao"]) is not None else None,
                    "diffFromDecisionBps": round(num(linha["VotoMenosDecisao"]) * 100) if num(linha["VotoMenosDecisao"]) is not None else None,
                })

        unanime = placar in ("Unanimidade", "Consenso") or all(
            (v["diffFromDecisionBps"] is None or v["diffFromDecisionBps"] == 0) for v in votos
        )

        decisao = num(primeira["DecisaoSelic"])
        variacao = num(primeira["VariacaoSelic"])

        # A planilha lista o presidente do Copom como primeiro votante de
        # cada reunião (conferido contra o histórico real de presidentes do
        # Bacen) — só existe quando a reunião tem votante nomeado (167ª em
        # diante).
        presidente = str(primeira["Votante"]).strip() if tem_nomes and pd.notna(primeira["Votante"]) else None

        resultados.append({
            "id": f"copom-dissent-{reuniao}",
            "committee": "copom",
            "meetingNumber": f"{reuniao}ª Reunião",
            "date": data_iso,
            "rateDecision": f"{decisao:.2f}%" if decisao is not None else None,
            "changeBps": round(variacao * 100) if variacao is not None else None,
            "placar": placar,
            "unanimous": unanime,
            "namedVotes": bool(tem_nomes),
            "chair": presidente,
            "votes": votos,
        })

    resultados.sort(key=lambda r: r["date"], reverse=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    com_dissenso = sum(1 for r in resultados if not r["unanimous"])
    print(f"[✓] Sucesso! {len(resultados)} reuniões do Copom salvas em {OUTPUT_PATH}")
    print(f"    {com_dissenso} com dissidência, desde {resultados[-1]['date']}.")


if __name__ == "__main__":
    main()
