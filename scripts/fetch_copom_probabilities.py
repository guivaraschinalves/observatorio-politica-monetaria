#!/usr/bin/env python3
"""
Probabilidades de mercado para o Copom, extraídas da curva de juros futuros
de DI1 negociada na B3 — sem chave de API, sem assinatura.

Fontes, todas públicas:
- B3 (arquivos.b3.com.br): arquivo diário "TradeInformationConsolidatedFile"
  (taxa de ajuste de cada vencimento do DI1) e "InstrumentsConsolidatedFile"
  (data de vencimento exata de cada contrato). Portal aberto de dados de
  negociação da própria B3, sem login.
- BCB (api.bcb.gov.br, série 432): Meta Selic atual.
- ANBIMA (anbima.com.br): calendário de feriados nacionais, para contar dias
  úteis do jeito que a curva de DI1 é cotada (base 252).
- scripts/copom_calendar.json: datas das reuniões do Copom — o Bacen não tem
  API pública para isso, então mantemos essa lista à mão (atualizar 1x/ano).

Metodologia (bootstrap de taxa a termo, o método padrão pra isso):
1. Interpola a curva de DI1 (log-linear sobre o fator de desconto, a
   convenção usual pra essa curva) pra achar a taxa de zero-cupom em
   qualquer prazo, não só nos vencimentos negociados.
2. Pra cada reunião, calcula a taxa a termo implícita no intervalo entre ela
   e a reunião seguinte — essa é a Selic que o mercado espera que vigore
   *depois* da decisão daquela reunião.
3. Reunião a reunião, compara com a taxa da reunião anterior (a primeira
   compara com a Meta Selic atual) pra achar a variação em bps.
4. Como o número que sai do passo 3 raramente é um múltiplo redondo de 25bps,
   distribui a probabilidade entre os dois múltiplos de 25 mais próximos por
   interpolação linear — a mesma lógica de calc_probabilities.py, generalizada
   pra qualquer tamanho de passo.

Isso NÃO é "Opções de Copom" (que também têm prêmio de risco e sorriso de
volatilidade embutidos) — é só a curva futura de DI1, mais simples e mais
fácil de defender de forma automatizada. Documentado assim no README.
"""
import os
import re
import json
import math
from datetime import date, datetime, timedelta

import requests
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "copom_market_overview.json")
CALENDAR_PATH = os.path.join(SCRIPT_DIR, "copom_calendar.json")

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

B3_REQUEST_URL = "https://arquivos.b3.com.br/api/download/requestname"
B3_DOWNLOAD_URL = "https://arquivos.b3.com.br/api/download/"
SELIC_META_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/5?formato=json"
ANBIMA_FERIADOS_URL = "https://www.anbima.com.br/feriados/arqs/feriados_nacionais.xls"

MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]


def formata_data(d: date) -> str:
    return f"{d.day} de {MESES[d.month - 1].capitalize()} de {d.year}"


def br_float(s: str):
    s = (s or "").strip()
    if not s:
        return None
    return float(s.replace(".", "").replace(",", "."))


# ---------- Feriados / dias úteis ----------

def busca_feriados():
    resp = requests.get(ANBIMA_FERIADOS_URL, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    tmp_path = os.path.join(SCRIPT_DIR, "..", ".feriados_anbima_tmp.xls")
    with open(tmp_path, "wb") as f:
        f.write(resp.content)
    try:
        df = pd.read_excel(tmp_path, engine="xlrd")
        df["Data"] = pd.to_datetime(df["Data"], errors="coerce")
        df = df.dropna(subset=["Data"])
        return set(df["Data"].dt.date.tolist())
    finally:
        os.remove(tmp_path)


def dias_uteis_entre(d1: date, d2: date, feriados: set) -> int:
    """Conta dias úteis entre d1 (exclusive) e d2 (inclusive), base 252."""
    if d2 <= d1:
        return 0
    dias = pd.bdate_range(start=d1 + timedelta(days=1), end=d2)
    dias = [d.date() for d in dias if d.date() not in feriados]
    return len(dias)


# ---------- B3 ----------

def busca_arquivo_b3(file_name: str, data_str: str):
    r = requests.get(
        B3_REQUEST_URL, params={"fileName": file_name, "date": data_str},
        headers=HEADERS, timeout=20,
    )
    if r.status_code != 200:
        return None
    token = r.json().get("token")
    if not token:
        return None
    r2 = requests.get(B3_DOWNLOAD_URL, params={"token": token}, headers=HEADERS, timeout=60)
    if r2.status_code != 200:
        return None
    return r2.text


def busca_ultimo_pregao(file_name: str, a_partir_de: date, max_dias_volta=10):
    """Tenta a data pedida e volta dia a dia até achar um pregão com dado."""
    for i in range(max_dias_volta):
        d = a_partir_de - timedelta(days=i)
        texto = busca_arquivo_b3(file_name, d.isoformat())
        if texto:
            return d, texto
    raise RuntimeError(f"Não encontrei pregão da B3 nos últimos {max_dias_volta} dias a partir de {a_partir_de}.")


def parse_vencimentos_di1(texto_instrumentos: str):
    """TckrSymb -> data de vencimento (XprtnDt), só contratos DI1."""
    linhas = texto_instrumentos.splitlines()
    header = linhas[1].split(";")
    idx_ticker = header.index("TckrSymb")
    idx_asst = header.index("Asst")
    idx_xprtn = header.index("XprtnDt")
    vencimentos = {}
    for linha in linhas[2:]:
        campos = linha.split(";")
        if len(campos) <= max(idx_ticker, idx_asst, idx_xprtn):
            continue
        if campos[idx_asst] != "DI1":
            continue
        try:
            vencimentos[campos[idx_ticker]] = datetime.strptime(campos[idx_xprtn], "%Y-%m-%d").date()
        except ValueError:
            continue
    return vencimentos


def parse_curva_di1(texto_negocios: str, vencimentos: dict, hoje: date):
    """Retorna lista de (dias_uteis_ate_o_vencimento, taxa_ajuste_pct), ordenada."""
    linhas = texto_negocios.splitlines()
    header = linhas[1].split(";")
    idx_ticker = header.index("TckrSymb")
    idx_taxa = header.index("AdjstdQtTax")
    pontos = []
    for linha in linhas[2:]:
        campos = linha.split(";")
        if len(campos) <= max(idx_ticker, idx_taxa):
            continue
        ticker = campos[idx_ticker]
        if not ticker.startswith("DI1"):
            continue
        venc = vencimentos.get(ticker)
        if not venc or venc <= hoje:
            continue
        taxa = br_float(campos[idx_taxa])
        if taxa is None:
            continue
        pontos.append((venc, taxa))
    return sorted(pontos)


# ---------- Curva e taxas a termo ----------

class CurvaDI1:
    """Interpola log(fator de desconto) linear em dias úteis — a convenção
    usual (flat-forward) pra essa curva."""

    def __init__(self, pontos_venc_taxa, hoje: date, feriados: set):
        self.hoje = hoje
        self.feriados = feriados
        du_ln_df = [(0, 0.0)]
        for venc, taxa in pontos_venc_taxa:
            du = dias_uteis_entre(hoje, venc, feriados)
            if du <= 0:
                continue
            df = (1 + taxa / 100) ** (-du / 252)
            du_ln_df.append((du, math.log(df)))
        du_ln_df = sorted(set(du_ln_df))
        if len(du_ln_df) < 2:
            raise RuntimeError("Curva de DI1 sem pontos suficientes pra interpolar.")
        self.xs = [p[0] for p in du_ln_df]
        self.ys = [p[1] for p in du_ln_df]

    def fator_desconto(self, du):
        xs, ys = self.xs, self.ys
        if du <= xs[0]:
            if xs[0] == 0:
                return 1.0
            inclinacao = ys[0] / xs[0]
        elif du >= xs[-1]:
            inclinacao = (ys[-1] - ys[-2]) / (xs[-1] - xs[-2])
            return math.exp(ys[-1] + inclinacao * (du - xs[-1]))
        else:
            for i in range(1, len(xs)):
                if du <= xs[i]:
                    inclinacao = (ys[i] - ys[i - 1]) / (xs[i] - xs[i - 1])
                    return math.exp(ys[i - 1] + inclinacao * (du - xs[i - 1]))
        return math.exp(inclinacao * du)

    def taxa_a_termo_pct(self, d_inicio: date, d_fim: date):
        du_i = dias_uteis_entre(self.hoje, d_inicio, self.feriados) if d_inicio > self.hoje else 0
        du_f = dias_uteis_entre(self.hoje, d_fim, self.feriados)
        df_i = self.fator_desconto(du_i)
        df_f = self.fator_desconto(du_f)
        du_periodo = du_f - du_i
        if du_periodo <= 0:
            return None
        return ((df_i / df_f) ** (252 / du_periodo) - 1) * 100


def curva_em(data_pregao: date, vencimentos: dict, feriados: set):
    dia, texto = busca_ultimo_pregao("TradeInformationConsolidatedFile", data_pregao)
    pontos = parse_curva_di1(texto, vencimentos, dia)
    return dia, CurvaDI1(pontos, dia, feriados)


# ---------- Probabilidades (interpolação entre múltiplos de 25bps) ----------

def distribui_em_passos_25bps(mudanca_bps: float):
    piso = math.floor(mudanca_bps / 25) * 25
    teto = piso + 25
    if teto == piso:
        return [(piso, 100.0)]
    peso_teto = (mudanca_bps - piso) / 25
    peso_piso = 1 - peso_teto
    passos = [(piso, round(peso_piso * 100, 1)), (teto, round(peso_teto * 100, 1))]
    return [p for p in passos if p[1] > 0.05]


def rotulo_passo(bps: int) -> str:
    if bps == 0:
        return "Mantém"
    sinal = "+" if bps > 0 else ""
    termo = "corte" if bps < 0 else "alta"
    return f"{sinal}{bps}bps ({termo})"


def main():
    with open(CALENDAR_PATH, encoding="utf-8") as f:
        reunioes = sorted(datetime.strptime(d, "%Y-%m-%d").date() for d in json.load(f)["reunioes"])

    print("[+] Buscando feriados (ANBIMA) e Meta Selic (BCB)...")
    feriados = busca_feriados()
    selic_resp = requests.get(SELIC_META_URL, headers=HEADERS, timeout=20).json()
    selic_atual = float(selic_resp[-1]["valor"])
    print(f"    Meta Selic atual: {selic_atual}%")

    print("[+] Buscando instrumentos da B3 (vencimentos do DI1)...")
    hoje_aprox = date.today()
    _, texto_instrumentos = busca_ultimo_pregao("InstrumentsConsolidatedFile", hoje_aprox)
    vencimentos = parse_vencimentos_di1(texto_instrumentos)
    print(f"    {len(vencimentos)} contratos de DI1 catalogados.")

    print("[+] Buscando a curva de DI1 de hoje...")
    hoje, curva_hoje = curva_em(hoje_aprox, vencimentos, feriados)
    print(f"    Pregão de referência: {hoje.isoformat()}")

    proximas = [r for r in reunioes if r > hoje][:5]
    if len(proximas) < 2:
        raise RuntimeError("Faltam datas de reunião no calendário — atualize scripts/copom_calendar.json.")

    def implica_decisoes(curva: CurvaDI1, ref_selic: float):
        decisoes = []
        taxa_anterior = ref_selic
        for i in range(len(proximas) - 1):
            fwd = curva.taxa_a_termo_pct(proximas[i], proximas[i + 1])
            if fwd is None:
                break
            decisoes.append({"reuniao": proximas[i], "taxa_implicita": fwd, "taxa_anterior": taxa_anterior})
            taxa_anterior = fwd
        return decisoes

    decisoes_hoje = implica_decisoes(curva_hoje, selic_atual)

    # Histórico (1 dia / 1 semana / 1 mês atrás) pra "aposta central" de cada reunião
    def prob_top_em(data_alvo: date):
        try:
            dia, curva = curva_em(data_alvo, vencimentos, feriados)
            decisoes = implica_decisoes(curva, selic_atual)
            if not decisoes:
                return None
            mudanca = decisoes[0]["taxa_implicita"] - decisoes[0]["taxa_anterior"]
            passos = distribui_em_passos_25bps(mudanca * 100)
            return round(max(p[1] for p in passos), 1)
        except Exception as e:
            print(f"    (aviso: não consegui curva histórica de {data_alvo}: {e})")
            return None

    historico_reuniao_1 = {
        "current": None,  # preenchido abaixo com o valor de hoje
        "oneDayAgo": prob_top_em(hoje - timedelta(days=1)),
        "oneWeekAgo": prob_top_em(hoje - timedelta(days=7)),
        "oneMonthAgo": prob_top_em(hoje - timedelta(days=30)),
    }

    meetings_out = []
    for idx, dec in enumerate(decisoes_hoje):
        mudanca_bps = (dec["taxa_implicita"] - dec["taxa_anterior"]) * 100
        passos = sorted(distribui_em_passos_25bps(mudanca_bps), key=lambda p: -p[1])
        top_bps, top_prob = passos[0]

        hist = None
        if idx == 0:
            historico_reuniao_1["current"] = top_prob
            hist = {k: v for k, v in historico_reuniao_1.items() if v is not None}

        meetings_out.append({
            "id": f"copom-next-{idx + 1}",
            "meetingDate": formata_data(dec["reuniao"]),
            "daysToMeeting": (dec["reuniao"] - hoje).days,
            "currentRate": f"{dec['taxa_anterior']:.2f}%",
            "impliedRate": f"{dec['taxa_implicita']:.2f}%",
            "expectedChangeBps": round(mudanca_bps),
            "probabilities": [
                {
                    "rateLabel": f"{dec['taxa_anterior'] + bps / 100:.2f}% — {rotulo_passo(bps)}",
                    "changeBps": bps,
                    "probability": prob,
                }
                for bps, prob in passos
            ],
            "historicalProbabilities": hist,
        })

    terminal = meetings_out[-1]
    overview = {
        "committee": "copom",
        "lastUpdated": f"{formata_data(hoje)} (curva de DI1 — B3)",
        "terminalRate": terminal["impliedRate"],
        "terminalDate": terminal["meetingDate"],
        "totalCutsOrHikesExpectedBps": round(
            (decisoes_hoje[-1]["taxa_implicita"] - selic_atual) * 100
        ),
        "meetings": meetings_out,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(overview, f, ensure_ascii=False, indent=2)

    print(f"[✓] Sucesso! Probabilidades de {len(meetings_out)} reuniões do Copom salvas em {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
