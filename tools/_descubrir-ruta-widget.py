#!/usr/bin/env python3
"""Busca en el bundle del frontend de GHL la ruta de actualizacion del chat
widget y los valores validos de `chatType` (para confirmar que 'none' existe).

SOLO LECTURA: descarga JS publico y hace GET a la API interna.
"""

import json
import pathlib
import re
import sys
import urllib.request

from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = pathlib.Path(__file__).resolve().parents[2]
ENV = json.loads((ROOT / "Ilatek/.mcp.json").read_text(encoding="utf-8"))["mcpServers"]["ghl"]["env"]
LOC = ENV["ZJ_GHL_LOCATION"]
FUNNEL = "2batSdUruZigPSJaALiw"


def log(m=""):
    print(m, flush=True)


def main():
    with sync_playwright() as p:
        b = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        page = b.contexts[0].new_page()
        # Settings del funnel es la pagina que ya sabemos que carga el modulo
        # de chat widgets (/chat-widget/list).
        page.goto(f"https://app.gohighlevel.com/v2/location/{LOC}/funnels-websites/funnels/{FUNNEL}/settings",
                  wait_until="domcontentloaded", timeout=90000)
        page.wait_for_timeout(14000)
        urls = page.evaluate(
            "() => performance.getEntriesByType('resource')"
            ".map(e => e.name).filter(n => n.indexOf('.js') > -1)")
        page.close()

    log(f"JS cargados: {len(urls)}")

    patrones = {
        "ruta_api": re.compile(r"\"[/]?chat-widget[^\"']{0,60}\""),
        "enum": re.compile(r"allInOneChat[^\n]{0,160}"),
        "tipo_enum": re.compile(r"chatType[^\n]{0,120}"),
    }
    vistos = {k: {} for k in patrones}

    for u in urls:
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                txt = r.read().decode("utf-8", "replace")
        except Exception:                                # noqa: BLE001
            continue
        for k, pat in patrones.items():
            for m in pat.finditer(txt):
                s = m.group(0).strip()[:150]
                if s not in vistos[k]:
                    vistos[k][s] = u.rsplit("/", 1)[-1]

    for k in ("ruta_api", "enum", "tipo_enum"):
        log(f"\n=== {k} ({len(vistos[k])}) ===")
        for s, f in list(vistos[k].items())[:40]:
            log(f"   {s}    [{f}]")


if __name__ == "__main__":
    main()
