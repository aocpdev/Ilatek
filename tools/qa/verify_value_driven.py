#!/usr/bin/env python3
"""Verificación VALUE-DRIVEN de un location GHL.

Por URL del sitemap (categoría vía ghl_paste_map.py):

- Páginas con Custom Code: puente dv-ghl-values expandido por GHL con al menos
  `bridge.min_slots` slots del contrato (se aceptan el viejo de 6 y el actual de
  7). En Chromium, sobre la URL ya servida: el Meta Pixel encendido con el id
  del slot `pixel_id` (`fbq('init')` con ese id, un `PageView`, un
  `fbevents.js`, sin tokens crudos visibles). Además `<title>` con el pueblo y
  cero literales del pueblo fuera de title/meta/puente.
- Páginas NATIVA-GHL (builder): 0 tokens crudos, title con el pueblo, cero
  literales. Sin Custom Code no se les exige pixel (`pixel=n/a`).

Slots, separador y min_slots viven SOLO en tools/qa/custom-values.json. Exit 2
si alguna página falla o si no hay render: nunca se aprueba un pixel sin verlo.
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
from repo_root import REPO, launch_chromium  # noqa: E402

CONTRACT = json.loads((Path(__file__).resolve().parent / "custom-values.json").read_text(encoding="utf-8"))
SLOTS: list[str] = CONTRACT["bridge"]["slots"]
MIN_SLOTS: int = int(CONTRACT["bridge"]["min_slots"])
SEPARATOR: str = CONTRACT["bridge"]["separator"]
PIXEL_SLOT: int = SLOTS.index("pixel_id")
PIXEL_RE = re.compile(r"^\d{6,20}$")

RAW_RE = re.compile(r"\{\{\s*custom_values\.", re.I)
BRIDGE_RE = re.compile(r"<(?:p|span|div)[^>]*dv-ghl-values[^>]*>.*?</(?:p|span|div)>", re.S | re.I)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.S | re.I)
META_RE = re.compile(r"<meta\b[^>]*>|\bog:[a-z:_-]+?\"|\bname=\"[^\"]*description\"[^>]*>", re.I)
# Los scripts no son texto: la tabla de los 78 pueblos del runtime menciona el
# pueblo en todas las páginas y no es contenido horneado.
CODE_RE = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.S | re.I)

PIXEL_JS = """() => {
  const q = (window.fbq && window.fbq.queue) || [];
  return {
    pixelId: window.__ilatekPixel || '',
    inits: q.filter((a) => a[0] === 'init').map((a) => a[1]),
    pageViews: q.filter((a) => a[0] === 'track' && a[1] === 'PageView').length,
    scripts: document.querySelectorAll('script[src*="fbevents.js"]').length,
    rawVisible: (document.body.innerText.match(/\\{\\{custom_values[^}]*\\}\\}/g) || []).length,
    bridge: !!window.ILATEK_BRIDGE,
    state: document.documentElement.getAttribute('data-ilatek-values') || '',
    source: (window.ILATEK_BRIDGE && window.ILATEK_BRIDGE.source && window.ILATEK_BRIDGE.source()) || '',
  };
}"""


def fetch(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8", "replace")


def fetch_sitemap(domain: str) -> list[str]:
    return [loc.text.strip() for loc in ET.fromstring(fetch(domain.rstrip("/") + "/sitemap.xml")).iter() if loc.tag.endswith("loc") and loc.text]


def eyeball(url: str, pueblo: str) -> dict:
    """Chequeos que no necesitan navegador: HTML servido, puente, title y literales."""
    out: dict = {"url": url, "reasons": []}
    try:
        html = fetch(url)
    except Exception as exc:  # noqa: BLE001
        return {**out, "state": "ERROR-FETCH", "err": str(exc)[:120]}

    path = "/" + url.split("/", 3)[-1] if url.count("/") > 2 else "/"
    canon, tag = map_path(path)
    nativa = tag == "NATIVA-GHL" or canon is None
    out["kind"] = "nativa" if nativa else str(canon)

    # Puede haber dos: el portador del embed (crudo) y el párrafo nativo que GHL
    # sí expande. Gana el expandido; si ninguno lo está, se reporta el primero.
    bridges = BRIDGE_RE.findall(html)
    bridge = next((b for b in bridges if "{{" not in b), bridges[0] if bridges else "")
    bridge_m = bool(bridge)
    title_m = TITLE_RE.search(html)
    title = title_m.group(1) if title_m else ""

    # Limpieza para el conteo literal: title, meta, scripts y puente se excluyen.
    rest = CODE_RE.sub("", META_RE.sub("", TITLE_RE.sub("", BRIDGE_RE.sub("", html), count=1)))
    literal_out = len(re.findall(re.escape(pueblo), rest, re.I))
    parts = [p.strip() for p in bridge.split(SEPARATOR)] if bridge else []
    slots_found = len(parts) if bridge else 0

    out["bridgePresent"] = bool(bridge_m) and slots_found >= MIN_SLOTS
    out["bridgeExpanded"] = slots_found >= MIN_SLOTS and "{{" not in bridge
    out["bridgeSlots"] = slots_found
    out["pixelSlot"] = parts[PIXEL_SLOT] if slots_found > PIXEL_SLOT else ""
    out["title"] = title.strip()[:90]
    out["titleExpanded"] = bool(title) and "{{" not in title and pueblo.lower() in title.lower()
    out["literalTownOutsideBridgeTitle"] = literal_out
    out["rawTokens"] = len(RAW_RE.findall(html))

    if not nativa:
        if not bridge_m:
            out["reasons"].append("sin párrafo dv-ghl-values")
        elif slots_found < MIN_SLOTS:
            out["reasons"].append(f"párrafo de {slots_found} slots (< {MIN_SLOTS})")
        elif "{{" in bridge:
            out["reasons"].append("párrafo sin expandir por GHL")
        if bridge_m and slots_found <= PIXEL_SLOT:
            out["reasons"].append("párrafo sin slot de pixel_id")
    else:
        if out["rawTokens"]:
            out["reasons"].append(f"{out['rawTokens']} token(es) crudo(s)")
        out["pixel"] = "n/a (nativa GHL)"

    if not out["titleExpanded"]:
        out["reasons"].append("title sin expandir o sin el pueblo")
    if literal_out:
        out["reasons"].append(f"{literal_out} literal(es) del pueblo fuera de title/meta")
    # Los tokens crudos del Custom Code son esperados (el runtime los resuelve);
    # el render comprueba que ninguno quede visible.
    out["state"] = ("FALLA" if out["reasons"] else "verde") if nativa else "pendiente-render"
    return out


def render_pixels(urls: list[str], timeout_ms: int = 45000) -> dict[str, dict]:
    """Carga cada URL y mide el pixel real; devuelve {url: medición}."""
    from playwright.sync_api import sync_playwright  # el resto del script corre sin Playwright

    out: dict[str, dict] = {}
    with sync_playwright() as pw:
        browser = launch_chromium(pw)
        try:
            for url in urls:
                page = browser.new_page()
                # fbevents no sale a la red: se mide id/init/PageView, no la latencia de Meta.
                page.route("**/connect.facebook.net/**", lambda r: r.fulfill(status=200, content_type="application/javascript", body=""))
                try:
                    page.goto(url, wait_until="load", timeout=timeout_ms)
                    # El gate se revela solo al poblar o al vencer; se espera ese
                    # estado antes de medir, nunca se aprueba con 'pending'.
                    try:
                        page.wait_for_function(
                            "() => document.documentElement.getAttribute('data-ilatek-values') !== 'pending'",
                            timeout=5000,
                        )
                    except Exception:  # noqa: BLE001
                        pass
                    page.wait_for_timeout(300)
                    out[url] = page.evaluate(PIXEL_JS)
                except Exception as exc:  # noqa: BLE001
                    out[url] = {"error": f"{type(exc).__name__}: {str(exc)[:100]}"}
                finally:
                    page.close()
        finally:
            browser.close()
    return out


def apply_render(res: dict, m: dict) -> None:
    """Exige el pixel en la página servida; cada fallo deja su razón."""
    if "error" in m:
        res["reasons"].append(f"no se pudo renderizar: {m['error']}")
    else:
        pid, inits = m.get("pixelId", ""), m.get("inits", [])
        if not PIXEL_RE.match(pid or ""):
            res["reasons"].append("pixel_id no resuelto en la página servida")
        if len(inits) != 1 or (pid and inits != [pid]):
            res["reasons"].append(f"fbq('init') inesperado: {inits}")
        if m.get("pageViews") != 1:
            res["reasons"].append(f"PageView={m.get('pageViews')} (debe ser 1)")
        if m.get("scripts", 0) < 1:
            res["reasons"].append("sin fbevents.js en la página")
        if m.get("rawVisible"):
            res["reasons"].append(f"{m['rawVisible']} token(es) crudo(s) visibles en la página")
        if PIXEL_RE.match(res.get("pixelSlot", "") or "") and pid and res["pixelSlot"] != pid:
            res["reasons"].append(f"slot pixel_id={res['pixelSlot']} != pixel iniciado {pid}")
        res["gate"] = m.get("state") or "-"
        res["valuesSource"] = m.get("source") or "-"
        if not m.get("bridge"):
            res["reasons"].append("sin helper ILATEK_BRIDGE en la página servida")
        elif m.get("state") == "missing":
            res["reasons"].append("puente missing: GHL no pobló el párrafo")
        elif m.get("state") == "pending":
            res["reasons"].append("puente pending: el gate no resolvió")
        res.update(pixel=pid or "-", pixelInits=inits, pixelPageViews=m.get("pageViews"), pixelScripts=m.get("scripts"))
    res["state"] = "FALLA" if res["reasons"] else "verde"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("domain", nargs="?", default="https://juncos.ilatekpr.com")
    ap.add_argument("--pueblo", default="Juncos", help="nombre del pueblo para title y conteo literal")
    ap.add_argument("--pool", type=int, default=6)
    ap.add_argument("--limit", type=int, default=0, help="solo las primeras N (debug)")
    args = ap.parse_args()

    urls = fetch_sitemap(args.domain)[: args.limit or None]
    with ThreadPoolExecutor(max_workers=args.pool) as pool:
        results = list(pool.map(lambda u: eyeball(u, args.pueblo), urls))

    pending = [r for r in results if r["state"] == "pendiente-render"]
    if pending:
        try:
            measured = render_pixels([r["url"] for r in pending])
        except Exception as exc:  # noqa: BLE001
            for r in pending:
                r["reasons"].append(f"render no disponible: {type(exc).__name__}: {str(exc)[:100]}")
                r["state"] = "FALLA"
        else:
            for r in pending:
                apply_render(r, measured.get(r["url"], {"error": "sin medición"}))

    counts = {"verde": 0, "FALLA": 0, "ERROR-FETCH": 0}
    for r in results:
        counts[r["state"]] += 1
        print(f"[{'OK ' if r['state'] == 'verde' else 'FAIL'}] {r['state']:<10} {r['url']} slots={r.get('bridgeSlots', 0)} "
              f"pixel={r.get('pixel', '-')} init={len(r.get('pixelInits') or [])} pv={r.get('pixelPageViews', '-')} "
              f"gate={r.get('gate', '-')}/{r.get('valuesSource', '-')} "
              f"js={r.get('pixelScripts', '-')} raw={r['rawTokens']} lit={r.get('literalTownOutsideBridgeTitle', '-')} "
              f"title={r.get('title', '?')[:50]}{'  ERR=' + r['err'] if 'err' in r else ''}")

    print(f"\nResumen {args.domain}: {len(results)} páginas -> {counts}")
    out_dir = REPO / "shots"
    out_dir.mkdir(exist_ok=True)
    (out_dir / "verify-value-driven.json").write_text(
        json.dumps({"domain": args.domain, "pueblo": args.pueblo, "minSlots": MIN_SLOTS, "counts": counts, "results": results},
                   ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    fails = [r for r in results if r["state"] != "verde"]
    if fails:
        print(f"\nFALLAS ({len(fails)}):")
        for r in fails:
            print(f"  - {r['url']}: {r['state']} :: {'; '.join(r.get('reasons') or [r.get('err', '')])}")
        sys.exit(2)


if __name__ == "__main__":
    main()
