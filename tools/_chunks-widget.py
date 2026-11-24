#!/usr/bin/env python3
"""Descarga los chunks del frontend de GHL y busca el enum de chatType y las
rutas de la API del chat widget. SOLO LECTURA (GET a CDN publico)."""

import re
import sys
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = "https://static.leadconnectorhq.com/2190/js/"
NOMBRES = [
    "chunk.e9eYRxsl.js",      # chat-widget-settings-v2
    "store.CNW_0NXq.js",      # chat-widget / chat-widget-settings
    "shared-leaf.ZmsteGVZ.js",
    "bootstrap.60LNIkXH.js",
    "bootstrap.DfRukcek.js",
    "app.js",
]

PATS = {
    "allInOneChat": re.compile(r".{80}allInOneChat.{120}", re.S),
    "chatType": re.compile(r".{40}chatType.{100}", re.S),
    "ruta": re.compile(r"[\"']/?chat-widgets?/[^\"'`]{0,60}[\"']"),
    "ruta_tpl": re.compile(r"chat-widgets?/\$\{[^`]{0,60}`"),
}

vistos = {k: set() for k in PATS}
for n in NOMBRES:
    url = BASE + n
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            txt = r.read().decode("utf-8", "replace")
    except Exception as exc:                             # noqa: BLE001
        print(f"!! {n}: {type(exc).__name__} {exc}", flush=True)
        continue
    print(f"== {n} ({len(txt)} chars)", flush=True)
    for k, pat in PATS.items():
        for m in pat.finditer(txt):
            s = re.sub(r"\s+", " ", m.group(0)).strip()[:190]
            vistos[k].add(s)

for k in PATS:
    print(f"\n=== {k} ({len(vistos[k])}) ===")
    for s in list(vistos[k])[:25]:
        print("  ", s)
