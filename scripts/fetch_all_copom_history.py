#!/usr/bin/env python3
"""
Coleta o histórico COMPLETO de comunicados do Copom desde o primeiro disponível na API do Banco Central (46ª reunião em 2000 até a última realizada).
"""
import os
import requests
import json
import re
import time
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

BCB_LIST_URL = "https://www.bcb.gov.br/api/servico/sitebcb/copom/comunicados?quantidade=500"
BCB_DETAIL_URL = "https://www.bcb.gov.br/api/servico/sitebcb/copom/comunicados_detalhes?nro_reuniao={}"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json"
}

def clean_html_to_paragraphs(html_text):
    if not html_text:
        return []
    soup = BeautifulSoup(html_text, 'html.parser')
    
    # Remove script and style elements
    for script in soup(["script", "style"]):
        script.extract()
        
    paragraphs = []
    # Check for <p> tags
    p_tags = soup.find_all('p')
    if p_tags:
        for p in p_tags:
            text = re.sub(r'\s+', ' ', p.get_text()).strip()
            # Filter out empty or whitespace only
            if text and len(text) > 3:
                paragraphs.append(text)
                
    if not paragraphs:
        # Fallback to lines/divs
        lines = soup.get_text().split('\n')
        for line in lines:
            text = re.sub(r'\s+', ' ', line).strip()
            if text and len(text) > 3:
                paragraphs.append(text)
                
    return paragraphs

def fetch_meeting_detail(item):
    nro = item['nro_reuniao']
    date_ref = item.get('dataReferencia', '')
    title = item.get('titulo', f'{nro}ª reunião do Copom')
    
    url = BCB_DETAIL_URL.format(nro)
    for attempt in range(3):
        try:
            r = requests.get(url, headers=HEADERS, timeout=12)
            if r.status_code == 200:
                data = r.json()
                content_list = data.get('conteudo', [])
                if content_list:
                    detail = content_list[0]
                    raw_html = detail.get('textoComunicado', '')
                    paragraphs = clean_html_to_paragraphs(raw_html)
                    return {
                        "id": f"copom-{nro}",
                        "meetingNumber": f"{nro}ª Reunião",
                        "number": nro,
                        "date": date_ref,
                        "title": title,
                        "paragraphs": paragraphs,
                        "fullText": "\n\n".join(paragraphs)
                    }
            time.sleep(0.5)
        except Exception as e:
            time.sleep(1)
            
    # If detail failed, return basic item
    return {
        "id": f"copom-{nro}",
        "meetingNumber": f"{nro}ª Reunião",
        "number": nro,
        "date": date_ref,
        "title": title,
        "paragraphs": [title],
        "fullText": title
    }

def main():
    print("[+] Buscando lista de comunicados no Banco Central...")
    r = requests.get(BCB_LIST_URL, headers=HEADERS, timeout=15)
    if r.status_code != 200:
        print(f"[-] Erro ao buscar lista: status {r.status_code}")
        return
        
    items = r.json().get('conteudo', [])
    print(f"[+] Total de comunicados encontrados: {len(items)}")
    
    results = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch_meeting_detail, it): it['nro_reuniao'] for it in items}
        done_count = 0
        for future in as_completed(futures):
            res = future.result()
            results.append(res)
            done_count += 1
            if done_count % 30 == 0 or done_count == len(items):
                print(f"    Progresso: {done_count}/{len(items)} comunicados processados...")
                
    # Sort descending by meeting number (most recent first)
    results.sort(key=lambda x: x['number'], reverse=True)
    
    output_path = os.path.join(SCRIPT_DIR, "..", "src", "data", "copom_comunicados_all.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
        
    print(f"[✓] Sucesso! {len(results)} comunicados salvos em {output_path}")

if __name__ == "__main__":
    main()
