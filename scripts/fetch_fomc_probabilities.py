#!/usr/bin/env python3
"""
Probabilidades de mercado para o FOMC, a partir do Market Probability Tracker
do Federal Reserve Bank of Atlanta (dado público, sem chave de API):
https://www.atlantafed.org/research-and-data/data/market-probability-tracker

A página injeta os dados diretamente como variáveis JavaScript no HTML (não é
uma API JSON separada), então este script busca o HTML e extrai essas
variáveis com regex. Se o Atlanta Fed reestruturar a página, os nomes das
variáveis abaixo (ProbContract, ProbBucket, ProbDate, Prob, RateMovesBasisPoints)
são o primeiro lugar a conferir.

Não é a metodologia "CME FedWatch" (essa é proprietária do CME Group e bloqueia
acesso automatizado pelos termos de uso) — é a mesma ideia (probabilidade
implícita nos futuros de Fed Funds), calculada de forma independente pelo Fed
de Atlanta e publicada abertamente.
"""
import os
import re
import json
from datetime import datetime, date, timedelta

import requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_market_overview.json")

URL = "https://www.atlantafed.org/research-and-data/data/market-probability-tracker"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}

MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]


def formata_data(iso):
    y, m, d = iso.split("-")
    return f"{int(d)} de {MESES[int(m) - 1].capitalize()} de {y}"


def extrai_array(html, nome):
    m = re.search(r"var " + re.escape(nome) + r" = (\[[^;]*\]);", html)
    if not m:
        raise ValueError(f"Variável '{nome}' não encontrada na página do Atlanta Fed — o layout pode ter mudado.")
    return json.loads(m.group(1))


def parse_bucket(label, current_low_bps):
    """Converte um rótulo de faixa (ex: '375bps - 400bps') em rótulo legível + variação em bps."""
    m = re.match(r"(-?\d+)bps - (-?\d+)bps", label)
    if m:
        lo, hi = int(m.group(1)), int(m.group(2))
        change = lo - current_low_bps
        rate_label = f"{lo / 100:.2f}% – {hi / 100:.2f}%"
        return rate_label, change

    m = re.match(r"< (-?\d+)bps", label)
    if m:
        hi = int(m.group(1))
        change = hi - current_low_bps - 25
        return f"< {hi / 100:.2f}%", change

    m = re.match(r"> (-?\d+)bps", label)
    if m:
        lo = int(m.group(1))
        change = lo - current_low_bps + 25
        return f"> {lo / 100:.2f}%", change

    return label, 0


def com_variacao(rate_label, change_bps):
    # Faixas abertas ("< 3.75%" / "> 4.00%") somam vários cenários de uma vez —
    # o bps indicado é só o do primeiro degrau dentro dela, não um número exato.
    if rate_label.startswith("<"):
        return f"{rate_label} (corte, ou mantém)" if change_bps <= 0 else f"{rate_label} (até +{change_bps}bps)"
    if rate_label.startswith(">"):
        return f"{rate_label} (a partir de +{change_bps}bps)"
    if change_bps == 0:
        return f"{rate_label} (sem alteração)"
    sinal = "+" if change_bps > 0 else ""
    return f"{rate_label} ({sinal}{change_bps}bps)"


def busca_valor_historico(dates, probs, alvo):
    """Entre os pares (data, probabilidade) de um bucket específico, pega o mais
    próximo, na data alvo ou antes dela."""
    candidatos = [(d, p) for d, p in zip(dates, probs) if d <= alvo]
    if not candidatos:
        return None
    d, p = max(candidatos, key=lambda x: x[0])
    return round(p, 1)


def main():
    print("[+] Buscando o Market Probability Tracker do Fed de Atlanta...")
    resp = requests.get(URL, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    html = resp.text

    contracts = extrai_array(html, "ProbContract")
    buckets = extrai_array(html, "ProbBucket")
    dates = extrai_array(html, "ProbDate")
    probs = extrai_array(html, "Prob")
    current_range = extrai_array(html, "RateMovesBasisPoints")[0]  # ex: "350 - 375"

    current_low_bps, current_high_bps = [int(x.strip()) for x in current_range.split("-")]
    current_rate_label = f"{current_low_bps / 100:.2f}% – {current_high_bps / 100:.2f}%"

    latest_date = max(dates)
    today = date.today()

    # Agrupa por reunião (contrato) mantendo, para cada bucket, a série completa
    # de (data, probabilidade) — precisamos disso tanto para o valor de hoje
    # quanto para "1 dia atrás / 1 semana atrás / 1 mês atrás".
    by_meeting = {}
    for c, b, d, p in zip(contracts, buckets, dates, probs):
        by_meeting.setdefault(c, {}).setdefault(b, []).append((d, p))

    meeting_dates = sorted(by_meeting.keys())
    meetings_out = []

    for idx, meeting_date in enumerate(meeting_dates[:4]):
        series_por_bucket = by_meeting[meeting_date]

        # Distribuição "de hoje" (última data disponível <= latest_date)
        hoje = []
        for bucket_label, serie in series_por_bucket.items():
            valor_hoje = busca_valor_historico(
                [d for d, _ in serie], [p for _, p in serie], latest_date
            )
            if valor_hoje is not None:
                rate_label, change_bps = parse_bucket(bucket_label, current_low_bps)
                hoje.append((rate_label, change_bps, valor_hoje, bucket_label))

        hoje.sort(key=lambda x: -x[2])
        top_label, top_change, top_prob, top_bucket_raw = hoje[0]

        d1 = datetime.strptime(latest_date, "%Y-%m-%d").date()
        alvo_1dia = (d1 - timedelta(days=1)).isoformat()
        alvo_1sem = (d1 - timedelta(days=7)).isoformat()
        alvo_1mes = (d1 - timedelta(days=30)).isoformat()

        serie_top = series_por_bucket[top_bucket_raw]
        datas_serie = [d for d, _ in serie_top]
        probs_serie = [p for _, p in serie_top]

        historical = {
            "current": round(top_prob, 1),
            "oneDayAgo": busca_valor_historico(datas_serie, probs_serie, alvo_1dia),
            "oneWeekAgo": busca_valor_historico(datas_serie, probs_serie, alvo_1sem),
            "oneMonthAgo": busca_valor_historico(datas_serie, probs_serie, alvo_1mes),
        }
        # Remove chaves sem dado (reunião muito recente para ter histórico de 1 mês, etc.)
        historical = {k: v for k, v in historical.items() if v is not None}

        meeting_dt = datetime.strptime(meeting_date, "%Y-%m-%d").date()

        meetings_out.append({
            "id": f"fomc-next-{idx + 1}",
            "meetingDate": formata_data(meeting_date),
            "daysToMeeting": (meeting_dt - today).days,
            "currentRate": current_rate_label,
            "impliedRate": top_label,
            "expectedChangeBps": top_change,
            "probabilities": [
                {
                    "rateLabel": com_variacao(rate_label, change_bps),
                    "changeBps": change_bps,
                    "probability": round(prob, 1),
                }
                for rate_label, change_bps, prob, _ in sorted(hoje, key=lambda x: -x[2])[:5]
            ],
            "historicalProbabilities": historical if historical else None,
        })

    # Taxa terminal: cenário mais provável na reunião mais distante que temos dado
    terminal_meeting = meetings_out[-1]
    terminal_rate = terminal_meeting["impliedRate"]
    terminal_date = terminal_meeting["meetingDate"]
    total_bps = terminal_meeting["expectedChangeBps"]

    overview = {
        "committee": "fomc",
        "lastUpdated": f"{formata_data(latest_date)} (Fed de Atlanta, Market Probability Tracker)",
        "terminalRate": terminal_rate,
        "terminalDate": terminal_date,
        "totalCutsOrHikesExpectedBps": total_bps,
        "meetings": meetings_out,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(overview, f, ensure_ascii=False, indent=2)

    print(f"[✓] Sucesso! Probabilidades de {len(meetings_out)} reuniões do FOMC salvas em {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
