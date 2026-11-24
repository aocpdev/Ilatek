"""Declara el canonical de cada página ya publicada.

Recorre las comunidades en `publicado` del ledger, abre el builder de cada
página, pega `pages[].canonical` en SEO → Links & tags → Canonical links,
guarda, publica y comprueba la etiqueta en la página viva.

    python scripts/marcar-canonical.py                       # todas las publicadas
    python scripts/marcar-canonical.py --only guaynabo/la-lomita
    python scripts/marcar-canonical.py --limit 1             # dos páginas

Sale 0 si todas las páginas quedan con su canonical en vivo, 1 si alguna falla
y 2 si el filtro no devolvió ninguna comunidad (un typo no es un aprobado).
"""
import argparse
import importlib.util
import json
import pathlib
import re
import sys
import time

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]          # .../Comunidades
spec = importlib.util.spec_from_file_location(
    'drv', pathlib.Path(__file__).resolve().with_name('alta-funnel-ghl.py'))
drv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(drv)


def log(msg):
    print(msg, flush=True)


def canonical_vivo(url, esperado, timeout=240):
    """El `<link rel="canonical">` de la página viva apunta a ella misma."""
    want = str(esperado or '').rstrip('/')
    end = time.time() + timeout
    while time.time() < end:
        status, html = drv.http(drv.cache_bust(url))
        if status == 200:
            m = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', html)
            if m and m.group(1).rstrip('/') == want:
                return True
        time.sleep(8)
    return False


def main():
    ap = argparse.ArgumentParser(description='Canonical por página en GHL.')
    ap.add_argument('--only', action='append', default=[], metavar='mun/com')
    ap.add_argument('--limit', type=int, default=0)
    args = ap.parse_args()

    idx = json.loads((ROOT / 'data' / 'ghl' / 'index.json').read_text(encoding='utf-8'))
    pub = [f"{f['municipalitySlug']}/{f['slug']}" for f in idx['funnels']
           if f.get('status') == 'publicado']
    claves = [c for c in pub if c in set(args.only)] if args.only else pub
    if args.limit:
        claves = claves[:args.limit]
    if not claves:
        log('no hay comunidades que procesar (¿filtro vacío?)')
        return 2

    log(f'{len(claves)} comunidades · {len(claves) * 2} páginas')
    drv.PIT = drv.token()
    hechos, fallos = [], []

    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp('http://127.0.0.1:9222')
        ctx = browser.contexts[0]
        pg = next((t for t in ctx.pages if 'app.gohighlevel.com' in (t.url or '')), None)
        if pg is None:
            pg = ctx.new_page()

        for n, clave in enumerate(claves, 1):
            mun, slug = clave.split('/')
            payload_path = ROOT / 'data' / 'ghl' / 'funnels' / mun / f'{slug}.json'
            data = json.loads(payload_path.read_text(encoding='utf-8'))
            log(f'[{n}/{len(claves)}] {clave}')
            for page in data['pages']:
                etiqueta = f'{clave}/{page["path"]}'
                nombre = f'{data["funnelName"]} · {drv.SUFIJO[page["kind"]]}'
                log(f'   - {page["name"]}')
                try:
                    f = drv.funnel_by_name(nombre)
                    if not f:
                        raise RuntimeError(f'no está el funnel "{nombre}"')
                    # El step de Limpieza conserva el nombre 'Sellado de techo'
                    # en la API: mismo fallback que build().
                    pasos = drv.steps_map(nombre, [drv.PAGE_NAME[page['kind']]])
                    sid = pasos.get(drv.PAGE_NAME[page['kind']]) or next(iter(pasos.values()))
                    bf = drv.open_builder(pg, f['_id'], sid)
                    bf.click('#hl-builder-seo-meta-data-button')
                    pg.wait_for_timeout(2500)
                    estado = drv.aplicar_canonical(bf, page['canonical'])
                    log(f'     canonical {estado}')
                    pg.keyboard.press('Escape')
                    pg.wait_for_timeout(1500)
                    # El drawer/modal puede dejar `.hr-modal-mask` y entonces el
                    # clic en Publish espera 30 s y tira la página (pasó en la
                    # primera pasada). Se cierra la máscara y, si el publish
                    # falla igual, se reabre el builder y se reintenta una vez.
                    if not drv.cerrar_mascara(pg, 25):
                        pg.keyboard.press('Escape')
                        pg.wait_for_timeout(1500)
                        drv.cerrar_mascara(pg, 15)
                    try:
                        url = drv.save_publish(pg, bf)
                    except Exception:               # noqa: BLE001
                        log('     publish falló: se cierra la máscara y se reintenta')
                        pg.keyboard.press('Escape')
                        pg.wait_for_timeout(1500)
                        drv.cerrar_mascara(pg, 20)
                        bf = drv.open_builder(pg, f['_id'], sid)
                        url = drv.save_publish(pg, bf)
                    log(f'     publicada {url}')
                    if canonical_vivo(page['url'], page['canonical'], 240):
                        log('     canonical en vivo OK')
                        hechos.append(etiqueta)
                    else:
                        log('     canonical NO aparece en vivo')
                        fallos.append(etiqueta)
                except Exception as e:              # noqa: BLE001
                    log(f'     FALLA {type(e).__name__}: {str(e)[:180]}')
                    fallos.append(etiqueta)

        log('')
        log(f'con canonical: {len(hechos)} · fallos: {len(fallos)}')
        for f in fallos:
            log(f'  FALLA {f}')
        p.stop()

    return 1 if fallos else 0


if __name__ == '__main__':
    sys.exit(main())
