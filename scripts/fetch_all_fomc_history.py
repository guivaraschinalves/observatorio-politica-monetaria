#!/usr/bin/env python3
"""
Extrai o histórico COMPLETO de declarações (statements) do FOMC desde 2000 até a última reunião.
"""
import os
import pandas as pd
import json
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
URL = 'https://raw.githubusercontent.com/vtasca/fed-statement-scraping/master/communications.csv'

def clean_fomc_text(raw_text):
    if not isinstance(raw_text, str) or not raw_text.strip():
        return []
    
    # Split into paragraphs by double newlines or clean breaks
    lines = raw_text.replace('\r\n', '\n').split('\n\n')
    paragraphs = []
    for line in lines:
        cleaned = re.sub(r'\s+', ' ', line).strip()
        if cleaned and len(cleaned) > 15:
            # Skip boilerplate disclaimers if any
            paragraphs.append(cleaned)
    return paragraphs

def main():
    print("[+] Baixando dataset de comunicações do FOMC...")
    df = pd.read_csv(URL)
    statements = df[df['Type'] == 'Statement'].copy()
    print(f"[+] Total de statements FOMC encontrados: {len(statements)}")
    
    # Sort descending by date
    statements['Date'] = pd.to_datetime(statements['Date'])
    statements = statements.sort_values(by='Date', ascending=False)
    
    results = []
    for idx, row in statements.iterrows():
        dt_str = row['Date'].strftime('%Y-%m-%d')
        year_str = row['Date'].strftime('%B %Y')
        raw_text = str(row['Text'])
        paragraphs = clean_fomc_text(raw_text)
        
        results.append({
            "id": f"fomc-{dt_str}",
            "meetingNumber": f"FOMC {year_str}",
            "date": dt_str,
            "title": f"FOMC Statement - {dt_str}",
            "paragraphs": paragraphs,
            "fullText": "\n\n".join(paragraphs)
        })
        
    output_path = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_statements_all.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
        
    print(f"[✓] Sucesso! {len(results)} statements do FOMC salvos em {output_path}")

if __name__ == "__main__":
    main()
