#!/usr/bin/env python3
"""
Script de automação para coleta de comunicados e minutas do FOMC (Federal Reserve).
"""
import sys
import json
import requests
from datetime import datetime

FED_CALENDAR_URL = "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"

def fetch_fomc_recent():
    """Verifica e extrai declarações recentes do Federal Reserve."""
    print("[+] Consultando portal do Federal Reserve Board...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        res = requests.get(FED_CALENDAR_URL, headers=headers, timeout=15)
        if res.status_code == 200:
            print("[✓] Conexão bem-sucedida com o Federal Reserve.")
            return True
        else:
            print(f"[-] Status: {res.status_code}")
            return False
    except Exception as e:
        print(f"[-] Erro de conexão com o Fed: {e}")
        return False

if __name__ == "__main__":
    fetch_fomc_recent()
