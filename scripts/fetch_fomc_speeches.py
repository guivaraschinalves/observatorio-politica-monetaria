#!/usr/bin/env python3
"""
Discursos reais de membros do FOMC, a partir do feed oficial do Federal
Reserve Board: https://www.federalreserve.gov/feeds/speeches.xml

Isso substitui um conjunto anterior de "discursos" que era inteiramente
fictício — texto inventado atribuído a pessoas reais (Powell, Waller,
Bowman). Este script só grava o que está publicado de verdade na página
oficial de cada discurso.

O que é extraído da página real (não inventado):
- data, título, nome/cargo de quem falou, local, texto integral, URL fonte.

O que este script DELIBERADAMENTE não tenta inventar:
- "keyQuotes": deixado vazio — escolher a frase mais importante de um
  discurso é leitura/análise, não extração de dado.
- "tone" (hawkish/dovish/neutro): sempre 'neutral' aqui — classificar o tom
  também é análise. Fica como está até alguém (você) ler e classificar.
- "topics": vazio pelo mesmo motivo.
- "isVoter": só é preenchido com confiança para cargos que votam sempre
  (Chair, Vice Chair, Governor, e o presidente do Fed de Nova York). Os
  demais presidentes regionais têm direito a voto rotativo ano a ano, e essa
  lista não está automatizada aqui — fica False por padrão pra esses casos,
  o que é o lado mais seguro do erro (implica menos peso, não mais).
"""
import os
import re
import json
from datetime import datetime
from xml.etree import ElementTree

import requests
from bs4 import BeautifulSoup

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "..", "src", "data", "fomc_speeches.json")

RSS_URL = "https://www.federalreserve.gov/feeds/speeches.xml"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

MAX_DISCURSOS = 20

CARGOS_QUE_SEMPRE_VOTAM = (
    "Chair", "Vice Chair", "Governor",
)
# O presidente do Fed de Nova York também vota sempre (assento permanente).
SEMPRE_VOTA_SE_CONTEM = CARGOS_QUE_SEMPRE_VOTAM + ("Federal Reserve Bank of New York",)


def limpa_texto(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()


def separa_cargo_e_nome(texto_speaker: str):
    """'Governor Christopher J. Waller' -> ('Governor, Federal Reserve Board', 'Christopher J. Waller')."""
    texto = limpa_texto(texto_speaker)
    prefixos = [
        "Chair and Governor", "Vice Chair for Supervision", "Vice Chair",
        "Chairman", "Chair", "Governor",
    ]
    for prefixo in prefixos:
        if texto.startswith(prefixo + " "):
            nome = texto[len(prefixo):].strip()
            return f"{prefixo}, Federal Reserve Board", nome
    # Presidentes de Fed regionais: "President and Chief Executive Officer, Federal Reserve Bank of X" — Nome
    if "President" in texto and "," in texto:
        # formato mais comum tem o nome ao final, mas isso varia; melhor
        # deixar o texto bruto como cargo e não arriscar cortar o nome errado.
        return texto, texto
    return texto, texto


def separa_evento_local(texto_location: str):
    texto = limpa_texto(texto_location)
    if texto.lower().startswith("at "):
        texto = texto[3:]
    partes = [p.strip() for p in texto.split(",")]
    if len(partes) >= 3:
        local = ", ".join(partes[-2:])
        evento = ", ".join(partes[:-2])
    elif len(partes) == 2:
        evento, local = partes[0], partes[1]
    else:
        evento, local = texto, ""
    return evento, local


def calcula_is_voter(cargo: str) -> bool:
    return any(termo in cargo for termo in SEMPRE_VOTA_SE_CONTEM)


def busca_discurso(url: str):
    r = requests.get(url, headers=HEADERS, timeout=20)
    r.raise_for_status()
    r.encoding = "utf-8"  # a página é UTF-8; sem isso, aspas curvas viram lixo
    soup = BeautifulSoup(r.text, "html.parser")
    artigo = soup.find(id="article")
    if not artigo:
        return None

    heading = artigo.find(class_="heading")
    data_tag = heading.find(class_="article__time") if heading else None
    titulo_tag = heading.find(class_="title") if heading else None
    speaker_tag = heading.find(class_="speaker") if heading else None
    local_tag = heading.find(class_="location") if heading else None

    if not (data_tag and titulo_tag and speaker_tag):
        return None

    data_str = limpa_texto(data_tag.get_text())
    try:
        data_iso = datetime.strptime(data_str, "%B %d, %Y").date().isoformat()
    except ValueError:
        return None

    titulo = limpa_texto(titulo_tag.get_text())
    cargo, nome = separa_cargo_e_nome(speaker_tag.get_text())
    evento, local = separa_evento_local(local_tag.get_text() if local_tag else "")

    # Corpo do discurso: div "col-xs-12 col-sm-8 col-md-8" dentro de #article
    # que NÃO é a do cabeçalho (essa tem a classe extra "heading" — bs4 exige
    # bater a lista de classes exatamente, então já vem filtrada).
    colunas = artigo.find_all("div", class_="col-xs-12 col-sm-8 col-md-8")
    paragrafos = []
    if colunas:
        for p in colunas[0].find_all("p", recursive=False):
            texto_p = limpa_texto(p.get_text())
            if texto_p:
                paragrafos.append(texto_p)

    if not paragrafos:
        return None

    return {
        "data_iso": data_iso,
        "titulo": titulo,
        "nome": nome,
        "cargo": cargo,
        "evento": evento,
        "local": local,
        "paragrafos": paragrafos,
    }


def main():
    print("[+] Buscando o feed de discursos do Federal Reserve...")
    resp = requests.get(RSS_URL, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    raiz = ElementTree.fromstring(resp.content)
    itens = raiz.findall(".//item")[:MAX_DISCURSOS]
    print(f"    {len(itens)} discursos no feed (pegando os mais recentes).")

    resultados = []
    for item in itens:
        link = (item.findtext("link") or "").strip()
        try:
            info = busca_discurso(link)
        except Exception as e:
            print(f"    (aviso: não consegui ler {link}: {e})")
            continue
        if not info:
            print(f"    (aviso: layout inesperado em {link}, pulando)")
            continue

        speech_id = "fomc-" + re.sub(r"[^a-z0-9]+", "-", info["nome"].lower()).strip("-") + "-" + info["data_iso"]
        resultados.append({
            "id": speech_id,
            "committee": "fomc",
            "speaker": info["nome"],
            "role": info["cargo"],
            "isVoter": calcula_is_voter(info["cargo"]),
            "date": info["data_iso"],
            "event": info["evento"],
            "location": info["local"],
            "tone": "neutral",
            "title": info["titulo"],
            "summary": info["paragrafos"][0][:280] + ("…" if len(info["paragrafos"][0]) > 280 else ""),
            "keyQuotes": [],
            "fullTranscript": "\n\n".join(info["paragrafos"]),
            "topics": [],
            "sourceUrl": link,
        })

    resultados.sort(key=lambda s: s["date"], reverse=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    print(f"[✓] Sucesso! {len(resultados)} discursos reais do FOMC salvos em {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
