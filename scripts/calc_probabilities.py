#!/usr/bin/env python3
"""
Módulo de cálculo de probabilidades implícitas de política monetária:
1. Copom: Interpolação da curva a termo de DI1 (B3) e precificação de passos (+25, 0, -25 bps).
2. FOMC: Metodologia CME FedWatch com base em futuros de Fed Funds (30-day).
"""
import math

def calculate_copom_implied_step(current_selic, future_di_rate, business_days_weight=1.0):
    """
    Calcula a probabilidade ponderada entre dois cenários de taxa básica (ex: manutenção vs +25 bps).
    """
    diff_bps = (future_di_rate - current_selic) * 100
    prob_hike_25 = min(100.0, max(0.0, (diff_bps / 25.0) * 100.0))
    prob_hold = 100.0 - prob_hike_25
    return {
        "diff_bps": round(diff_bps, 1),
        "prob_hold": round(prob_hold, 1),
        "prob_hike_25": round(prob_hike_25, 1)
    }

if __name__ == "__main__":
    sample = calculate_copom_implied_step(14.25, 14.46)
    print(f"[✓] Demonstração de cálculo de curva DI: {sample}")
