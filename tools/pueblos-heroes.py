#!/usr/bin/env python3
"""Captura el hero de cada landing municipal a 1200x630.

Mismo modelo que usa comunidades (ver og_screenshot() en
Comunidades/scripts/alta-funnel-ghl.py): pestaña de Chromium a 1200x630,
espera a que la página cargue y a que las fuentes estén listas, esconde las
scrollbars y fotografía el primer viewport. Esa imagen es la que se sube como
media del post.

Es resumible: cada captura se anota en .tmp-pueblos-shots.json y las que ya
existen se saltan, así que se puede cortar y retomar por pueblo.

Uso:
    python tools/pueblos-heroes.py --muni adjuntas
    python tools/pueblos-heroes.py --muni adjuntas,carolina
    python tools/pueblos-heroes.py --all --limit 40
"""

import argparse
import json
import pathlib
import time

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
PLAN = ROOT / ".tmp-pueblos-plan.json"
SHOTS = ROOT / ".tmp-pueblos-shots.json"
OUT = ROOT / "assets" / "pueblos"

OCULTAR_SCROLL = (
    "html{scrollbar-width:none!important}"
    "body{overflow:hidden!important}"
    "::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}"
)


def log(msg):
    print(msg, flush=True)


# Baja la página lo justo para centrar el hero y dejar enteros los botones del
# CTA. Se mide la página (no un valor fijo): el hero cambia de alto según el
# largo del H1 y de la columna lateral. El tope evita que el H1 se salga del
# cuadro si la sección es muy alta.
AJUSTE_JS = """() => {
  // Se encuadra la sección que contiene el H1, no un `.hero` fijo: en limpieza
  // el titular está arriba (y=182) y en techos debajo del bloque de video
  // (y=1081), así que el desplazamiento tiene que medirse en cada página.
  const h1 = document.querySelector('h1');
  let seccion = h1;
  while (seccion && seccion !== document.body) {
    const rect = seccion.getBoundingClientRect();
    if (rect.height > 260 && rect.width > 600) break;
    seccion = seccion.parentElement;
  }
  if (!seccion || seccion === document.body) seccion = document.querySelector('.hero') || document.body;
  const r = seccion.getBoundingClientRect();
  const topDoc = r.top + window.scrollY;
  const centro = topDoc + r.height / 2;
  // Centrar el bloque, pero sin que el H1 suba de 20 px: en secciones altas
  // hay que elegir entre centrar y dejar el titular completo.
  const h1Top = h1 ? h1.getBoundingClientRect().top + window.scrollY : topDoc;
  let objetivo = Math.min(centro - 315, h1Top - 20);
  objetivo = Math.max(0, Math.min(objetivo, 1400));
  window.scrollTo(0, Math.round(objetivo));
  return { scroll: Math.round(window.scrollY), heroH: Math.round(r.height), top: Math.round(topDoc) };
}"""


def capturar(pg, url, destino):
    pg.set_viewport_size({"width": 1200, "height": 630})
    pg.goto(url, wait_until="load", timeout=60000)
    # La landing resuelve imágenes y fuentes después del load; sin esta espera
    # el hero sale con el texto en la fuente de respaldo.
    pg.wait_for_timeout(1800)
    try:
        pg.evaluate("() => document.fonts.ready.then(() => true)")
    except Exception:  # noqa: BLE001
        pass
    pg.add_style_tag(content=OCULTAR_SCROLL)
    pg.wait_for_timeout(300)
    ajuste = pg.evaluate(AJUSTE_JS)
    pg.wait_for_timeout(350)
    destino.parent.mkdir(parents=True, exist_ok=True)
    pg.screenshot(path=str(destino))
    return destino, ajuste


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--muni", help="pueblos separados por coma")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--force", action="store_true",
                    help="rehace las capturas aunque ya existan (cambió el encuadre)")
    args = ap.parse_args()

    plan = json.loads(PLAN.read_text(encoding="utf-8"))
    posts = plan["posts"]
    if args.muni:
        quiere = {m.strip() for m in args.muni.split(",") if m.strip()}
        posts = [p for p in posts if p["muni"] in quiere]
    elif not args.all:
        raise SystemExit("Indica --muni <pueblo> o --all")

    shots = json.loads(SHOTS.read_text(encoding="utf-8")) if SHOTS.exists() else {}
    pendientes = [p for p in posts if args.force or f"{p['muni']}/{p['slug']}" not in shots]
    if args.limit:
        pendientes = pendientes[: args.limit]
    if not pendientes:
        log("Nada pendiente: todas las capturas de ese alcance ya existen.")
        return

    log(f"capturas pendientes: {len(pendientes)}")
    t0 = time.time()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        pg = browser.new_page(viewport={"width": 1200, "height": 630})
        for i, entry in enumerate(pendientes, 1):
            key = f"{entry['muni']}/{entry['slug']}"
            destino = OUT / entry["muni"] / f"{entry['slug']}.png"
            try:
                _, ajuste = capturar(pg, entry["url"], destino)
                shots[key] = str(destino)
                SHOTS.write_text(json.dumps(shots, ensure_ascii=False, indent=2), encoding="utf-8")
                kb = destino.stat().st_size // 1024
                log(f"ok {i}/{len(pendientes)} {key} ({kb} KB, scroll {ajuste['scroll']}px)")
            except Exception as exc:  # noqa: BLE001
                log(f"FALLA {key}: {type(exc).__name__}: {exc}")
        browser.close()

    hechas = sum(1 for e in pendientes if f"{e['muni']}/{e['slug']}" in shots)
    log(f"\ncapturadas: {hechas}/{len(pendientes)}")
    log(f"total en manifiesto: {len(shots)} | {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
