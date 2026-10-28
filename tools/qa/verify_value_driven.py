#!/usr/bin/env python3
"""Verificación VALUE-DRIVEN de un location GHL (estándar obligatorio).

Criterios por URL del sitemap (usa Ilatek/tools/qa/ghl_paste_map.py para saber la categoría):
- Páginas con Custom Code (mapeadas a canónico del repo):
    * puente: existe elemento con clase dv-ghl-values, expandido por GHL
      (contiene '|||DV|||' con 6 slots) y SIN '{{...' adentro.
    * title: '<title>' sin '{{' y contiene el pueblo (CLI --pueblo).
    * literal: cero apariciones del pueblo fuera de <title>, meta y puente
      (la prueba de que nada del HTML es fijo por pueblo).
- Páginas NATIVA-GHL (builder): 0 tokens crudos, title con el pueblo,
  cero literales fuera de title/meta.

Salida: tabla por página + JSON shots/verify-value-driven.json.
Exit codes: 0 = todo verde; 2 = alguna página falla (no da por verde nada).
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ghl_paste_map import map_path  # noqa: E402
from repo_root import REPO  # noqa: E402

RAW_RE = re.compile(r"\{\{\s*custom_values\.", re.I)
BRIDGE_RE = re.compile(r"<(?:p|span|div)[^>]*dv-ghl-values[^>]*>.*?</(?:p|span|div)>", re.S | re.I)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.S | re.I)
META_RE = re.compile(r"<meta\b[^>]*>|\bog:[a-z:_-]+?\"|\bname=\"[^\"]*description\"[^>]*>", re.I)


def fetch(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8", "replace")


def fetch_sitemap(domain: str) -> list[str]:
    return [loc.text.strip() for loc in ET.fromstring(fetch(domain.rstrip("/") + "/sitemap.xml")).iter() if loc.tag.endswith("loc") and loc.text]


def eyeball(url: str, pueblo: str, reconfirm: bool = False) -> dict:
    out = {"url": url}
    try:
        html = fetch(url)
    except Exception as exc:  # noqa: BLE001
        out["state"] = "ERROR-FETCH"
        out["err"] = str(exc)[:120]
        return out
    path = "/" + url.split("/", 3)[-1] if url.count("/") > 2 else "/"
    canon, tag = map_path(path)
    iso_Native = tag == "NATIVA-GHL" or canon is None
    out["kind"] = "nativa" if iso_Native else str(canon)

    bridge_m = BRIDGE_RE.search(html)
    bridge = bridge_m.group(0) if bridge_m else ""
    title_m = TITLE_RE.search(html)
    title = title_m.group(1) if title_m else ""

    # Limpieza para el conteo literal: title, meta y puente se excluyen.
    rest = BRIDGE_RE.sub("", html)
    rest = TITLE_RE.sub("", rest, count=1)
    rest = META_RE.sub("", rest)
    literal_out = len(re.findall(re.escape(pueblo), rest, re.I))
    delims = bridge.count("|||DV|||")
    out["bridgePresent"] = bool(bridge_m) and delims == 5
    out["bridgeExpanded"] = delims == 5 and "{{" not in bridge
    out["title"] = title.strip()[:90]
    out["titleExpanded"] = bool(title) and "{{" not in title and pueblo.lower() in title.lower()
    out["literalTownOutsideBridgeTitle"] = literal_out
    out["rawTokens"] = len(RAW_RE.findall(html))

    if iso_Native:
        out["state"] = "verde" if (out["rawTokens"] == 0 and out["titleExpanded"] and literal_out == 0) else "FALLA"
    else:
        ok = out["bridgePresent"] and out["bridgeExpanded"] and out["titleExpanded"] and literal_out == 0
        out["state"] = "verde" if ok else "FALLA"
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("domain", nargs="?", default="https://juncos.ilatekpr.com")
    ap.add_argument("--pueblo", default="Juncos", help="nombre del pueblo para title y conteo literal")
    ap.add_argument("--pool", type=int, default=6)
    ap.add_argument("--limit", type=int, default=0, help="solo las primeras N (debug)")
    args = ap.parse_args()

    urls = fetch_sitemap(args.domain)
    if args.limit:
        urls = urls[: args.limit]
    results = []
    with ThreadPoolExecutor(max_workers=args.pool) as pool:
        for res in pool.map(lambda u: eyeball(u, args.pueblo), urls):
            results.append(res)

    counts = {"verde": 0, "FALLA": 0, "ERROR-FETCH": 0}
    for r in results:
        counts[r["state"]] = counts.get(r["state"], 0) + 1
        flag = "OK " if r["state"] == "verde" else "×"
        print(f"[{flag}] {r['state']:<10} {r['url']} raw={r['rawTokens']} lit={r.get('literalTownOutsideBridgeTitle','-')} "
              f"bridge={'expandido' if r.get('bridgeExpanded') else ('crudo' if r.get('bridgePresent') else 'ausente')} title={r.get('title','?')[:60]}"
              f"{'  ERR=' + r['err'] if 'err' in r else ''}")
    print(f"\nResumen {args.domain}: {len(results)} páginas -> {counts}")
    out_dir = REPO / "shots"
    out_dir.mkdir(exist_ok=True)
    (out_dir / "verify-value-driven.json").write_text(json.dumps({"domain": args.domain, "pueblo": args.pueblo, "counts": counts, "results": results}, ensure_ascii=False, indent=1), encoding="utf-8")
    fails = [r for r in results if r["state"] != "verde"]
    if fails:
        print(f"\nFALLAS ({len(fails)}):")
        for r in fails:
            print(f"  - {r['url']}: {r['state']}")
        sys.exit(2)


if __name__ == "__main__":
    main()
