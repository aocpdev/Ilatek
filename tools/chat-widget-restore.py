#!/usr/bin/env python3
"""Restaura el chat widget de una subcuenta Ilatek desde el respaldo completo.

El respaldo se hizo ANTES del borrado en
`documentacion/chat-widget-off/backup-widget-completo/<locationId>__<widgetId>.json`
y contiene el objeto completo (`settings` incluidos: colores, textos, avatar,
formulario, A2P...). Con eso el widget se reconstruye identico.

Dos caminos:
  1. `--phase restore`  intenta recuperar el widget BORRADO conservando su _id,
     para que el embed de GTM (widget-id) siga siendo valido.
  2. `--phase create`   si no hay forma de des-borrar, crea un widget nuevo con
     la misma configuracion. El _id cambia: hay que actualizar el widget-id del
     snippet de GTM.

Uso:
  python tools/chat-widget-restore.py --phase check             # solo lectura
  python tools/chat-widget-restore.py --phase restore
  python tools/chat-widget-restore.py --phase create
  python tools/chat-widget-restore.py --phase check --location 8OxUENFVM60EKzqsTcoD

Token de agencia via CDP del Chrome del dueno (puerto 9222). No cierra ventanas.
"""
import argparse
import json
import pathlib
import sys
import time
import urllib.error
import urllib.request

from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = "https://backend.leadconnectorhq.com"
SERVICIOS = "https://services.leadconnectorhq.com"   # alta de widgets (POST /chat-widget/)
OUT = ROOT / "Ilatek/documentacion/chat-widget-off"
RESPALDOS = OUT / "backup-widget-completo"
POR_DEFECTO = "8OxUENFVM60EKzqsTcoD"          # Ilatek - PR
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36")

TOKEN = None


def log(*a):
    print(*a, flush=True)


def get_token():
    with sync_playwright() as p:
        b = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        ctx = b.contexts[0]
        for c in ctx.cookies("https://app.gohighlevel.com"):
            if c["name"] == "access-token-v1":
                return c["value"]
        raise SystemExit("No hay token access-token-v1 en el Chrome del puerto 9222.")


def api(method, path, body=None, loc=None, host=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request((host or BASE) + path, data=data, method=method)
    req.add_header("Authorization", "Bearer " + TOKEN)
    req.add_header("channel", "APP")
    req.add_header("source", "WEB_USER")
    req.add_header("Version", "2021-07-28")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json, text/plain, */*")
    req.add_header("User-Agent", UA)
    req.add_header("Origin", "https://app.gohighlevel.com")
    req.add_header("Referer", "https://app.gohighlevel.com/")
    if loc:
        req.add_header("locationId", loc)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:                                # noqa: BLE001
        return -1, "%s: %s" % (type(e).__name__, e)


def widgets(loc):
    st, raw = api("GET", "/chat-widget/list?limit=100&offset=0&locationId=" + loc, loc=loc)
    if st != 200:
        return st, [], raw
    try:
        return st, (json.loads(raw).get("chatWidgets") or []), raw
    except Exception:                                     # noqa: BLE001
        return st, [], raw


def respaldo(loc):
    """Devuelve (ruta, config) del respaldo completo de esa subcuenta."""
    hallados = sorted(RESPALDOS.glob("%s__*.json" % loc))
    if not hallados:
        raise SystemExit("Sin respaldo para %s en %s" % (loc, RESPALDOS))
    cfg = json.loads(hallados[0].read_text(encoding="utf-8"))
    return hallados[0], cfg


def cuerpo_creacion(cfg, loc, variante="full"):
    """Cuerpo aceptado por POST /chat-widget/ (esquema observado en el panel).

    `_id` no se puede enviar: el servidor responde 422 "property _id should not
    exist", asi que el widget nuevo siempre nace con un id distinto.
    """
    settings = cfg.get("settings", {})
    if variante == "settings":
        return {"locationId": loc, "name": cfg.get("name", "Ilatek"), "settings": settings}
    return {"locationId": loc, "default": True, "deleted": False, "version": 2,
            "name": cfg.get("name", "Ilatek"),
            "chatType": cfg.get("chatType", "allInOneChat"),
            "settings": settings, "updatedBy": cfg.get("updatedBy", "")}


DESBORRAR = [
    ("PATCH", "/chat-widget/{id}?locationId={loc}", {"deleted": False}),
    ("PUT",   "/chat-widget/{id}?locationId={loc}", {"deleted": False}),
    ("PATCH", "/chat-widget/update/{id}?locationId={loc}", {"deleted": False}),
    ("PUT",   "/chat-widget/update/{id}?locationId={loc}", {"deleted": False}),
    ("POST",  "/chat-widget/restore/{id}?locationId={loc}", {}),
]

CREAR = [
    ("POST", "/chat-widget/", "full"),
    ("POST", "/chat-widget/", "settings"),
]


def fase_check(loc):
    ruta, cfg = respaldo(loc)
    st, ws, raw = widgets(loc)
    log("== %s" % loc)
    log("   respaldo: %s" % ruta.name)
    log("   widget respaldado: %s · %s · creado %s" % (
        cfg.get("_id"), cfg.get("name"), cfg.get("createdAt")))
    log("   GET /chat-widget/list -> %s · %d widget(s) visibles" % (st, len(ws)))
    for w in ws:
        log("      - %s %s (deleted=%s)" % (w.get("_id"), w.get("name"), w.get("deleted")))
    if not ws:
        st2, raw2 = api("GET", "/chat-widget/data/%s/%s" % (loc, cfg["_id"]), loc=loc)
        log("   GET data del id borrado -> %s %s" % (st2, raw2[:200].replace("\n", " ")))
    return 0


def fase_restore(loc):
    ruta, cfg = respaldo(loc)
    wid = cfg["_id"]
    st, ws, _ = widgets(loc)
    if any(w.get("_id") == wid and not w.get("deleted") for w in ws):
        log("Ya esta activo: %s. Nada que restaurar." % wid)
        return 0
    log("== des-borrar %s en %s (mismo widget-id, el embed de GTM no cambia)" % (wid, loc))
    for metodo, plantilla, body in DESBORRAR:
        path = plantilla.format(id=wid, loc=loc)
        st2, raw2 = api(metodo, path, body, loc=loc)
        log("   %-5s %-46s -> %s  %s" % (metodo, path.split("?")[0], st2,
                                        raw2[:120].replace("\n", " ")))
        if 200 <= st2 < 300:
            time.sleep(1.2)
            st3, ws3, _ = widgets(loc)
            if any(w.get("_id") == wid for w in ws3):
                log("\nOK: widget %s visible otra vez. El snippet de GTM sigue valido." % wid)
                return 0
            log("   (2xx pero no aparece en la lista: sigo probando)")
    log("\nNo se pudo des-borrar con las rutas conocidas. Corre --phase create.")
    return 2


def fase_create(loc):
    ruta, cfg = respaldo(loc)
    st, ws, _ = widgets(loc)
    if ws:
        log("La subcuenta ya tiene widget(s): %s. No creo otro." % [w.get("_id") for w in ws])
        return 0
    log("== crear widget nuevo desde el respaldo (%s)" % ruta.name)
    for metodo, plantilla, variante in CREAR:
        path = plantilla.format(loc=loc)
        st2, raw2 = api(metodo, path, cuerpo_creacion(cfg, loc, variante), loc=loc, host=SERVICIOS)
        log("   %-5s %-44s -> %s  %s" % (metodo, path.split("?")[0], st2,
                                        raw2[:120].replace("\n", " ")))
        if 200 <= st2 < 300:
            time.sleep(1.2)
            st3, ws3, _ = widgets(loc)
            if ws3:
                nuevo = ws3[-1].get("_id")
                informe = OUT / ("restauracion-%s.json" % loc)
                informe.write_text(json.dumps({
                    "locationId": loc, "widgetIdOriginal": cfg["_id"],
                    "widgetIdNuevo": nuevo, "respaldo": ruta.name,
                    "ts": time.strftime("%Y-%m-%dT%H:%M:%S"),
                }, ensure_ascii=False, indent=2), encoding="utf-8")
                log("\nCREADO. widget-id NUEVO: %s" % nuevo)
                if nuevo != cfg["_id"]:
                    log("!! El embed de GTM usa el id viejo (%s): hay que reemplazarlo" % cfg["_id"])
                    log("   en Ilatek/gtm-chat-widget-tag.html y republicar el contenedor.")
                log("   informe: %s" % informe)
                return 0
    log("\nNo se pudo crear por API. Recrealo a mano en el panel (Sites > Chat Widget)")
    log("con los valores del respaldo: %s" % ruta)
    return 2


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--phase", choices=["check", "restore", "create"], required=True)
    ap.add_argument("--location", default=POR_DEFECTO)
    a = ap.parse_args()
    TOKEN = get_token()
    log("token ok (len %d)" % len(TOKEN))
    sys.exit({"check": fase_check, "restore": fase_restore, "create": fase_create}[a.phase](a.location))
