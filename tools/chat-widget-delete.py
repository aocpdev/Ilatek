#!/usr/bin/env python3
"""Deja las subcuentas Ilatek sin chat widget (burbuja apagada del todo).

El modelo no tiene chatType "none" ni flag de apagado: la unica forma real de
que la burbuja no aparezca en ningun sitio es borrar el widget de la subcuenta
(soft delete: el campo `deleted` pasa a true). Se guarda el objeto COMPLETO de
cada widget antes de tocarlo, para poder recrearlo.

Uso:
  python tools/chat-widget-delete.py --phase pilot    # 1 subcuenta
  python tools/chat-widget-delete.py --phase all      # las demas
  python tools/chat-widget-delete.py --phase verify    # solo lectura
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
OUT = ROOT / "Ilatek/documentacion/chat-widget-off"
INV = ROOT / "Ilatek/.tmp-chatwidget-inventario.json"
PILOTO = "8OxUENFVM60EKzqsTcoD"          # Ilatek - PR
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


def api(method, path, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    req.add_header("Authorization", "Bearer " + TOKEN)
    req.add_header("channel", "APP")
    req.add_header("source", "WEB_USER")
    req.add_header("Version", "2021-07-28")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json, text/plain, */*")
    req.add_header("User-Agent", UA)
    req.add_header("Origin", "https://app.gohighlevel.com")
    req.add_header("Referer", "https://app.gohighlevel.com/")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:                                # noqa: BLE001
        return -1, "%s: %s" % (type(e).__name__, e)


def widgets(loc):
    st, raw = api("GET", "/chat-widget/list?limit=100&offset=0&locationId=" + loc)
    if st != 200:
        return st, None, raw
    try:
        return st, (json.loads(raw).get("chatWidgets") or []), raw
    except Exception:                                     # noqa: BLE001
        return st, None, raw


def detalle(loc, wid):
    st, raw = api("GET", "/chat-widget/data/%s/%s" % (loc, wid))
    if st != 200:
        return st, None
    js = json.loads(raw)
    return st, js.get("data", js)


def respaldar(loc, wid):
    d = OUT / "backup-widget-completo"
    d.mkdir(parents=True, exist_ok=True)
    st, w = detalle(loc, wid)
    if w is None:
        return st, None
    (d / ("%s__%s.json" % (loc, wid))).write_text(
        json.dumps(w, ensure_ascii=False, indent=2), encoding="utf-8")
    return st, w


def apagar(loc, nombre, respaldo=True):
    """Borra el widget default de la subcuenta. Devuelve (estado, detalle)."""
    st, ws, raw = widgets(loc)
    if ws is None:
        return "error lectura %s" % st
    if not ws:
        return "ya sin widget"
    w = ws[0]
    prev = w.get("chatType")
    if respaldo:
        respaldar(loc, w["_id"])
    st2, raw2 = api("DELETE", "/chat-widget/%s/%s" % (loc, w["_id"]))
    time.sleep(1.0)
    st3, ws3, _ = widgets(loc)
    quedan = len(ws3 or [])
    ok = (st3 == 200 and quedan == 0)
    log("    %-26s %-14s DELETE %s -> %s | quedan %s | %s" % (
        nombre[:26], prev, st2, raw2[:70].replace("\n", " "), quedan,
        "OK" if ok else "REVISAR"))
    return ("ok" if ok else "FALLO %s %s (quedan %s)" % (st2, raw2[:80], quedan), prev)


def fase_pilot():
    log("== PILOTO (borrado) · Ilatek - PR %s" % PILOTO)
    st, ws, raw = widgets(PILOTO)
    log("   antes: %d widget(s) %s" % (len(ws or []), [(w["name"], w["chatType"]) for w in (ws or [])]))
    if not ws:
        log("   nada que borrar.")
        return 0
    st = respaldar(PILOTO, ws[0]["_id"])[0]
    log("   respaldo completo: status %s" % st)
    est, prev = apagar(PILOTO, "Ilatek - PR", respaldo=False)
    log("   resultado: %s" % est)
    st4, w4 = detalle(PILOTO, ws[0]["_id"])
    log("   GET data del borrado -> %s %s" % (st4, (json.dumps(w4)[:90] if w4 else "")))
    return 0 if est.startswith("ok") else 1


def fase_all():
    filas = json.loads(INV.read_text(encoding="utf-8"))
    filas.sort(key=lambda r: r["name"])
    res, ok, fail = [], 0, 0
    for i, r in enumerate(filas, 1):
        loc, nombre = r["id"], r["name"].strip()
        if loc == PILOTO:
            res.append((nombre, loc, "allInOneChat", "sin widget", "ok (piloto)"))
            ok += 1
            continue
        log("[%2d/%d]" % (i, len(filas)))
        est, prev = apagar(loc, nombre)
        if est == "ok":
            ok += 1
            res.append((nombre, loc, prev, "sin widget", "ok"))
        elif est == "ya sin widget":
            ok += 1
            res.append((nombre, loc, "-", "sin widget", "ya estaba sin widget"))
        else:
            fail += 1
            res.append((nombre, loc, prev if isinstance(prev, str) else "?", "?", est))
    out = OUT / "reporte-apagado.md"
    lin = ["# Chat widget apagado — Ilatek", "",
           "Ejecutado: %s" % time.strftime("%Y-%m-%d %H:%M"), "",
           "Mecanismo: `DELETE /chat-widget/{locationId}/{widgetId}` (no existe "
           "`chatType: none` en el modelo).", "",
           "Resultado: **%d ok · %d fallos** de %d subcuentas" % (ok, fail, len(filas)), "",
           "| Subcuenta | locationId | Antes | Despues | Estado |", "|---|---|---|---|---|"]
    for n, l, a, b, e in res:
        lin.append("| %s | `%s` | `%s` | %s | %s |" % (n, l, a, b, e))
    out.write_text("\n".join(lin) + "\n", encoding="utf-8")
    log("\nRESUMEN: %d ok · %d fallos · reporte %s" % (ok, fail, out))
    return 0 if fail == 0 else 2


def fase_verify():
    filas = json.loads(INV.read_text(encoding="utf-8"))
    filas.sort(key=lambda r: r["name"])
    mal = []
    for r in filas:
        st, ws, _ = widgets(r["id"])
        n = len(ws) if ws is not None else -1
        if n != 0:
            mal.append((r["name"], r["id"], n, st))
        log("%-30s widgets=%s" % (r["name"].strip()[:30], n))
    log("\n== con widget todavia: %d de %d" % (len(mal), len(filas)))
    for m in mal:
        log("   %s | %s | n=%s st=%s" % m)
    return 0 if not mal else 2


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--phase", choices=["pilot", "all", "verify"], required=True)
    a = ap.parse_args()
    TOKEN = get_token()
    log("token ok (len %d)" % len(TOKEN))
    sys.exit({"pilot": fase_pilot, "all": fase_all, "verify": fase_verify}[a.phase]())
