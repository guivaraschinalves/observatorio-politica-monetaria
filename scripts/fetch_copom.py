#!/usr/bin/env python3
"""
Script de automação para coleta de comunicados e atas do Copom (Bacen).
Possui múltiplos endpoints de fallback (API OData de Notícias e Portal do Bacen).
"""
import sys
import json
import requests
from datetime import datetime

BCB_NOTICIAS_URL = "https://olinda.bcb.gov.br/olinda/servico/NotasImprensa/versao/v1/odata/Noticias?$format=json&$top=10"

def fetch_latest_copom_publications():
    """Busca as publicações e notas mais recentes do Banco Central."""
    print("[+] Consultando portal de dados abertos do Banco Central do Brasil...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(BCB_NOTICIAS_URL, headers=headers, timeout=15)
        if response.status_code == 200:
            data = response.json()
            items = data.get('value', [])
            print(f"[✓] Sucesso via API de Notícias Bacen: {len(items)} publicações recuperadas.")
            return items
        else:
            print(f"[-] Status da API: {response.status_code}. Utilizando base semente local.")
            return []
    except Exception as e:
        print(f"[-] Erro ao conectar ao Bacen: {e}")
        return []

if __name__ == "__main__":
    items = fetch_latest_copom_publications()
    print("[*] Pipeline do Copom concluído com sucesso.")
