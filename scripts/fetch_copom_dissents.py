#!/usr/bin/env python3
"""
Histórico de votações do Copom desde a 21ª reunião (1998) — direto da
planilha oficial que o próprio Bacen publica e mantém:
https://www.bcb.gov.br/content/controleinflacao/controleinflacao_docs/votacoes-copom/historico-votacoes-Copom.xlsx

Nomeação individual de quem votou só existe a partir da 167ª reunião (30 de
maio de 2012, segundo a própria planilha — antes disso, o boletim registra só
o placar agregado, ex. "7 x 1", sem dizer quem ficou em cada lado). Pra
colorir o gráfico por presidente também nas reuniões mais antigas, usa a
lista de mandatos abaixo (fonte: bcb.gov.br/acessoinformacao/galeriaexpresidentes,
conferida contra https://pt.wikipedia.org/wiki/Anexo:Lista_de_presidentes_do_Banco_Central_do_Brasil,
já que a página do Bacen é só uma SPA sem conteúdo em HTML puro pra extrair).
"""
import os
import json
import re
from datetime import date

import requests
import pandas as pd

COMUNICADOS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "copom_comunicados_all.json")

TAXA_DECIDIDA_RE = re.compile(r"taxa b[aá]sica de juros para\s+([\d,]+)%", re.IGNORECASE)
VOTARAM_RE = re.compile(r"Votaram por essa decis[aã]o os seguintes membros do Comit[eê]:\s*(.+?)\.", re.IGNORECASE | re.DOTALL)
NOME_RE = re.compile(r"([A-ZÀ-Ý][^,;]+?)(?:\s*\(presidente\))?(?:,| e |$)")


def monta_fallback_recentes(reunioes_existentes):
    """Comunicados mais recentes que a última reunião já presente na
    planilha oficial do Bacen (que costuma demorar dias/semanas pra
    incorporar a reunião mais nova) — extrai placar e votantes direto do
    texto do comunicado, no mesmo padrão do fallback já usado para o FOMC em
    fetch_fomc_dissents.py. Só cobre o caso unânime, mais comum na era
    Galípolo ("Votaram por essa decisão os seguintes membros do Comitê:
    fulano, beltrano e sicrano.") — um dissenso com fraseado diferente fica
    sem fallback até a planilha oficial ser atualizada, que sobrescreve isso
    automaticamente na próxima execução.
    """
    if not os.path.exists(COMUNICADOS_PATH):
        return []
    comunicados = json.load(open(COMUNICADOS_PATH, encoding="utf-8"))
    novos = []
    for c in comunicados:
        numero = c.get("number")
        if numero is None or numero in reunioes_existentes:
            continue
        texto = " ".join(c.get("paragraphs", []))
        m_taxa = TAXA_DECIDIDA_RE.search(texto)
        m_votaram = VOTARAM_RE.search(texto)
        if not m_taxa or not m_votaram:
            continue
        decisao = float(m_taxa.group(1).replace(",", "."))
        nomes = [n.strip() for n in NOME_RE.findall(m_votaram.group(1)) if n.strip()]
        if not nomes:
            continue
        presidente = nomes[0]
        votos = [{"name": nome, "count": 1, "preferredChangeBps": None, "diffFromDecisionBps": 0} for nome in nomes]
        novos.append({
            "id": f"copom-dissent-{numero}",
            "committee": "copom",
            "meetingNumber": f"{numero}ª Reunião",
            "date": c["date"],
            "rateDecision": f"{decisao:.2f}%",
            "changeBps": None,
            "placar": "Unanimidade",
            "unanimous": True,
            "namedVotes": True,
            "chair": presidente,
            "votes": votos,
        })
    return novos

# (data de início, nome) — cobre só o período em que já temos reuniões
# (desde 1998). O mandato de Roberto Campos Neto aparece fragmentado no
# Bacen/Wikipedia por causa da mudança pra mandato fixo em 2021 e da troca de
# governo em 2023, mas é a mesma pessoa o tempo todo — tratado aqui como um
# período só. A vacância de ~2 meses entre a saída de Goldfajn (31/12/2018) e a
# posse de Campos Neto (28/2/2019) fica atribuída ao Goldfajn por
# simplicidade — a 220ª reunião (6/2/2019) cai bem nesse intervalo e
# tecnicamente não teve presidente formal, então essa atribuição pontual é
# aproximada, não um dado conferido. Reunião antes de ago/1997 fica sem
# presidente atribuído, em vez de chutar.
MANDATOS_PRESIDENCIA = [
    (date(1997, 8, 20), "Gustavo Franco"),
    (date(1999, 3, 4), "Armínio Fraga"),
    (date(2003, 1, 1), "Henrique Meirelles"),
    (date(2011, 1, 1), "Alexandre Antonio Tombini"),  # mesmo nome usado na planilha a partir da 167ª reunião
    (date(2016, 6, 9), "Ilan Goldfajn"),
    (date(2019, 2, 28), "Roberto de Oliveira Campos Neto"),
    (date(2025, 1, 1), "Gabriel Muricca Galípolo"),
]


def presidente_em(data_reuniao: date):
    candidato = None
    for inicio, nome in MANDATOS_PRESIDENCIA:
        if inicio <= data_reuniao:
            candidato = nome
        else:
            break
    return candidato

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
        # diante). Pra reuniões mais antigas, completa com a lista de
        # mandatos (real, mas datada por dia — não por reunião).
        if tem_nomes and pd.notna(primeira["Votante"]):
            presidente = str(primeira["Votante"]).strip()
        else:
            data_dt = data.date() if hasattr(data, "date") else None
            presidente = presidente_em(data_dt) if data_dt else None

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

    # Fallback: comunicados mais novos que a planilha oficial ainda não
    # incorporou (ela costuma demorar dias/semanas após cada reunião) — ver
    # monta_fallback_recentes() acima. Autocorrige sozinho: quando a planilha
    # alcançar essas reuniões, elas somem do fallback (já estarão em
    # reunioes_existentes) e passam a vir da fonte oficial de novo.
    reunioes_existentes = set(df["Reuniao"].unique().tolist())
    novos = monta_fallback_recentes(reunioes_existentes)
    if novos:
        anterior = resultados[0] if resultados else None
        for n in novos:
            if anterior and anterior.get("rateDecision"):
                taxa_anterior = float(anterior["rateDecision"].rstrip("%").replace(",", "."))
                taxa_nova = float(n["rateDecision"].rstrip("%").replace(",", "."))
                n["changeBps"] = round((taxa_nova - taxa_anterior) * 100)
        resultados = novos + resultados
        resultados.sort(key=lambda r: r["date"], reverse=True)
        print(f"    +{len(novos)} reunião(ões) recente(s) via fallback do texto do comunicado (planilha oficial ainda não atualizou).")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    com_dissenso = sum(1 for r in resultados if not r["unanimous"])
    print(f"[✓] Sucesso! {len(resultados)} reuniões do Copom salvas em {OUTPUT_PATH}")
    print(f"    {com_dissenso} com dissidência, desde {resultados[-1]['date']}.")


if __name__ == "__main__":
    main()
