#!/usr/bin/env python3
"""Audita las landings ya publicadas contra la lista de la sección 9 del runbook.

    python scripts/auditar-publicadas.py                  # solo status=publicado
    python scripts/auditar-publicadas.py --todas           # todas las del índice
    python scripts/auditar-publicadas.py --only carolina/isla-verde
    python scripts/auditar-publicadas.py --sin-chat        # lotes corridos con --sin-chat

Cada landing se revisa entera —ruta, dominio, chat, embed (H1 y servicio),
título, favicon, GTM/GA4/Pixel, mojibake, peso, og:image de su servicio, sin
`-page`, y móvil a 360/390/430— y el script sale con código 1 si algo falla.

Usa UNA pestaña del Chrome del propietario (puerto 9222) y la deja abierta: no
abre ni cierra tabs por landing.
"""

import argparse
import importlib.util
import json
import pathlib
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]

_spec = importlib.util.spec_from_file_location("alta", ROOT / "scripts" / "alta-funnel-ghl.py")
alta = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(alta)

# Los 16 puntos de la lista, en el orden del runbook. Cada uno agrupa los checks
# técnicos que lo resuelven (el móvil son tres medidas por tramo).
LISTA = [
    ("1 ruta", ["ruta"]),
    ("2 dominio", ["status"]),
    ("5 embed", ["h1", "servicio"]),
    ("6 titulo", ["title"]),
    ("4 chat", ["chat"]),
    ("7 favicon", ["favicon"]),
    ("8 tracking", ["gtm", "ga4", "pixel"]),
    ("9 texto", ["mojibake"]),
    ("10 peso", ["peso"]),
    ("11 imagen social", ["og", "og_imagen"]),
    ("12 sin duplicado", ["sin_page"]),
    ("13-15 movil", ["movil_ancho", "movil_inset", "movil_scroll"]),
]


def landings(only, todas):
    idx = json.loads((ROOT / "data" / "ghl" / "index.json").read_text(encoding="utf-8"))
    keys = []
    for f in idx["funnels"]:
        key = f"{f['municipalitySlug']}/{f['slug']}"
        if only and key not in only:
            continue
        if not only and not todas and f.get("status") != "publicado":
            continue
        keys.append(key)
    return keys


def auditar(pg, key):
    mun, slug = key.split("/")
    payload = ROOT / "data" / "ghl" / "funnels" / mun / f"{slug}.json"
    data = json.loads(payload.read_text(encoding="utf-8"))
    filas = []
    for page in data["pages"]:
        checks = alta.gate(page, data["community"])
        checks.update(alta.gate_movil(pg, page["url"]))
        fallos = [k for k, v in checks.items() if not v]
        grupos = [(nombre, [c for c in claves if c in fallos]) for nombre, claves in LISTA]
        malos = [(nombre, lista) for nombre, lista in grupos if lista]
        filas.append((page["kind"], page["url"], checks, malos))
    return data, filas


def pestanas_ajenas(registro):
    """`targetId`s que el driver u otro auditor tienen cogidos.

    Compartir pestaña hace que una navegación interrumpa la otra: el auditor de
    c0 se quedó con la pestaña registrada por el carril 1 y ambos se pisaban
    (`Navigation ... is interrupted by another navigation`, 2026-11-06 10:03),
    tirando las páginas de las dos tandas.
    """
    ids = set()
    for f in ROOT.glob(".tmp-carril-*.pestana"):
        try:
            ids.add(f.read_text(encoding="ascii").strip())
        except Exception:                      # noqa: BLE001
            pass
    for f in ROOT.glob(".tmp-auditor*.pestana"):
        if f.name == registro.name:
            continue
        try:
            ids.add(f.read_text(encoding="ascii").strip())
        except Exception:                      # noqa: BLE001
            pass
    ids.discard("")
    return ids


def pestana_auditor(ctx, carril=-1):
    """Devuelve LA pestaña del auditor, reutilizándola.

    `AGENTS.md` prohíbe cerrar pestañas, así que antes cada auditoría abría una
    nueva y la dejaba abierta: una docena en una hora (todas
    `comunidades.ilatekpr.com`) y el CDP empezó a fallar en `new_page` con
    "Connection closed while reading from the driver", tumbando intentos de
    publicación completos (2026-11-06, 09:54). Se guarda el `targetId` en
    `.tmp-auditor-cN.pestana` y se retoma; si no hay registro se adopta una de
    las pestañas que dejaron las auditorías anteriores, que así se descargan.
    """
    registro = ROOT / (f".tmp-auditor-c{carril}.pestana" if carril >= 0
                       else ".tmp-auditor.pestana")

    def tid(pg):
        try:
            ses = ctx.new_cdp_session(pg)
            valor = ses.send("Target.getTargetInfo")["targetInfo"]["targetId"]
            ses.detach()
            return valor
        except Exception:                      # noqa: BLE001
            return ""

    def fijar(pg):
        valor = tid(pg)
        if valor:
            try:
                registro.write_text(valor, encoding="ascii")
            except Exception:                  # noqa: BLE001
                pass
        return pg

    try:
        querido = registro.read_text(encoding="ascii").strip()
    except Exception:                          # noqa: BLE001
        querido = ""
    ajenas = pestanas_ajenas(registro)
    if querido and querido not in ajenas:
        for pg in ctx.pages:
            if tid(pg) == querido:
                return pg
    else:
        for pg in ctx.pages:
            if ("comunidades.ilatekpr.com" in (pg.url or "")
                    and tid(pg) not in ajenas):
                return fijar(pg)
    return fijar(ctx.new_page())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", action="append", default=[])
    ap.add_argument("--todas", action="store_true")
    # Mismo contrato que el carril que publicó: con --sin-chat el widget de chat
    # queda en "none" a propósito (settings_vivos lo salta), así que exigirlo
    # aquí marcaba en rojo páginas correctas y el supervisor las republicaba en
    # bucle (dorado, 2026-11-06: 17/18 con la única falla `chat`).
    ap.add_argument("--sin-chat", action="store_true",
                    help="no exige el widget de chat (lote corrido con --sin-chat)")
    ap.add_argument("--carril", type=int, default=-1,
                    help="pestaña propia del carril, reutilizada entre auditorías")
    args = ap.parse_args()
    if args.sin_chat:
        alta.SIN_CHAT = True

    keys = landings(set(args.only), args.todas)
    if not keys:
        # Sin landings no hay veredicto: salir con 0 haría pasar por bueno un
        # typo en --only o un ledger vacío.
        print("No hay landings que auditar con ese filtro (revisa --only / el ledger).")
        return 2

    total = fallidas = 0
    with sync_playwright() as p:
        br = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        ctx = br.contexts[0]
        pg = pestana_auditor(ctx, args.carril)
        for key in keys:
            data, filas = auditar(pg, key)
            print(f"\n* {key} - {data['community']}", flush=True)
            for kind, url, checks, malos in filas:
                total += 1
                ok = sum(1 for v in checks.values() if v)
                if malos:
                    fallidas += 1
                    detalle = "; ".join(f"{n}: {','.join(c)}" for n, c in malos)
                    print(f"   FALLA {kind:8s} {ok}/{len(checks)}  {url}\n         {detalle}", flush=True)
                else:
                    print(f"   OK    {kind:8s} {ok}/{len(checks)}  {url}", flush=True)

    print(f"\n{total - fallidas}/{total} landings en verde"
          + (f" - {fallidas} con fallos" if fallidas else ""))
    return 0 if not fallidas else 1


if __name__ == "__main__":
    sys.exit(main())
