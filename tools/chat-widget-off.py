#!/usr/bin/env python3
"""Apaga el chat widget (chatType -> none) en las subcuentas Ilatek.

Uso:
  python tools/chat-widget-off.py --phase pilot     # 1 subcuenta, descubre ruta
  python tools/chat-widget-off.py --phase all       # resto, con la ruta hallada
  python tools/chat-widget-off.py --phase verify    # solo lectura, re-verifica

API interna de GHL con token de agencia leido por CDP del Chrome del dueno.
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
ESTADO = ROOT / "Ilatek/.tmp-chatwidget-estado.json"
PILOTO = "8OxUENFVM60EKzqsTcoD"          # Ilatek - PR


def log(*a):
    print(*a, flush=True)


def get_token():
    with sync_playwright() as p:
        b = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        ctx = b.contexts[0]

        def tok():
            for c in ctx.cookies("https://app.gohighlevel.com"):
                if c["name"] == "access-token-v1":
                    return c["value"]
            return None

        t = tok()
        if t:
            return t
        page = ctx.new_page()
        page.goto("https://app.gohighlevel.com", wait_until="domcontentloaded", timeout=90000)
        page.wait_for_timeout(8000)
        t = tok()
        page.close()
        if not t:
            raise SystemExit("No hay token access-token-v1 en el Chrome del puerto 9222.")
        return t


TOKEN = None


def api(method, path, body=None, loc=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    req.add_header("Authorization", "Bearer " + TOKEN)
    req.add_header("channel", "APP")
    req.add_header("source", "WEB_USER")
    req.add_header("Version", "2021-07-28")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json, text/plain, */*")
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36")
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


def listar(loc):
    st, raw = api("GET", "/chat-widget/list?limit=100&offset=0&locationId=" + loc, loc=loc)
    if st != 200:
        return st, raw, None
    try:
        return st, raw, json.loads(raw)
    except Exception:                                     # noqa: BLE001
        return st, raw, None


def estado_actual(loc):
    st, raw, js = listar(loc)
    if st != 200 or js is None:
        return st, None, raw
    ws = js.get("chatWidgets") or []
    if not ws:
        return st, None, raw
    return st, ws[0], raw


def backups(loc, raw):
    d = OUT / "backup"
    d.mkdir(parents=True, exist_ok=True)
    (d / ("%s.json" % loc)).write_text(raw, encoding="utf-8")


CANDS = [
    ("PUT",   "/chat-widget/{id}?locationId={loc}",        "partial"),
    ("PATCH", "/chat-widget/{id}?locationId={loc}",        "partial"),
    ("PUT",   "/chat-widget/{id}?locationId={loc}",        "full"),
    ("PATCH", "/chat-widget/{id}?locationId={loc}",        "full"),
    ("PUT",   "/chat-widget/update/{id}?locationId={loc}", "partial"),
    ("POST",  "/chat-widget/update?locationId={loc}",      "partial_id"),
    ("PUT",   "/chat-widget/update?locationId={loc}",      "partial_id"),
    ("POST",  "/chat-widget/{id}?locationId={loc}",        "partial"),
]


def cuerpo(variante, w):
    if variante == "partial":
        return {"chatType": "none"}
    if variante == "partial_id":
        return {"_id": w["_id"], "chatType": "none"}
    c = dict(w)
    c["chatType"] = "none"
    return c


def fase_pilot():
    log("== PILOTO · Ilatek - PR (%s)" % PILOTO)
    st, w, raw = estado_actual(PILOTO)
    if w is None:
        log("!! no pude leer el widget:", st, raw[:300])
        return 1
    backups(PILOTO, raw)
    log("   actual: %s  (widget %s)" % (w.get("chatType"), w["_id"]))

    for metodo, plantilla, variante in CANDS:
        path = plantilla.format(id=w["_id"], loc=PILOTO)
        body = cuerpo(variante, w)
        st2, raw2 = api(metodo, path, body, loc=PILOTO)
        log("   %-5s %-52s -> %s  %s" % (metodo, path.split("?")[0], st2,
                                        raw2[:160].replace("\n", " ")))
        if 200 <= st2 < 300:
            time.sleep(1.2)
            st3, w3, _ = estado_actual(PILOTO)
            ahora = w3.get("chatType") if w3 else None
            log("   verificacion: %s -> chatType = %s" % (st3, ahora))
            if ahora == "none":
                ESTADO.write_text(json.dumps({
                    "ruta": path, "metodo": metodo, "variante": variante,
                    "piloto": PILOTO, "widgetId": w["_id"],
                    "ok": True, "ts": time.strftime("%Y-%m-%dT%H:%M:%S"),
                }, ensure_ascii=False, indent=2), encoding="utf-8")
                log("\nOK: ruta confirmada y widget apagado en el piloto.")
                return 0
            log("   (2xx pero chatType sigue en %s: sigo probando)" % ahora)
    log("\nFALLO: ninguna variante dejo el widget en none.")
    return 1


def fase_all():
    if not ESTADO.exists():
        log("!! falta %s: corre --phase pilot primero." % ESTADO)
        return 1
    plan = json.loads(ESTADO.read_text(encoding="utf-8"))
    metodo, plantilla, variante = plan["metodo"], plan["ruta"], plan["variante"]
    plantilla = plantilla.replace(plan["piloto"], "{loc}").replace(plan["widgetId"], "{id}")
    filas = json.loads(INV.read_text(encoding="utf-8"))
    filas.sort(key=lambda r: r["name"])
    ok = fail = 0
    res = []
    for i, r in enumerate(filas, 1):
        loc, nombre = r["id"], r["name"].strip()
        if loc == plan["piloto"]:
            res.append((nombre, loc, "allInOneChat", "none", "ya aplicado (piloto)"))
            ok += 1
            continue
        st, w, raw = estado_actual(loc)
        if w is None:
            res.append((nombre, loc, "?", "?", "sin widget / error %s" % st))
            fail += 1
            continue
        prev = w.get("chatType")
        if prev == "none":
            res.append((nombre, loc, prev, prev, "ya estaba en none"))
            ok += 1
            continue
        backups(loc, raw)
        path = plantilla.format(id=w["_id"], loc=loc)
        st2, raw2 = api(metodo, path, cuerpo(variante, w), loc=loc)
        time.sleep(0.8)
        st3, w3, _ = estado_actual(loc)
        ahora = w3.get("chatType") if w3 else "(sin lectura)"
        bien = ahora == "none"
        if bien:
            ok += 1
        else:
            fail += 1
        res.append((nombre, loc, prev, ahora,
                    "ok" if bien else "FALLO %s %s" % (st2, raw2[:80])))
        log("[%2d/%d] %-28s %s -> %s %s" % (i, len(filas), nombre[:28], prev, ahora,
                                            "" if bien else raw2[:100]))
    dot = OUT / "reporte-aplicacion.md"
    lineas = ["# Apagado de chat widget - Ilatek", "",
              "Ejecutado: %s" % time.strftime("%Y-%m-%d %H:%M"), "",
              "Metodo: `%s` variante `%s`" % (metodo, variante),
              "Resultado: **%d ok - %d fallos** de %d subcuentas" % (ok, fail, len(filas)), "",
              "| Subcuenta | locationId | Antes | Despues | Estado |", "|---|---|---|---|---|"]
    for n, l, a, b, e in res:
        lineas.append("| %s | `%s` | `%s` | `%s` | %s |" % (n, l, a, b, e))
    dot.write_text("\n".join(lineas) + "\n", encoding="utf-8")
    log("\nRESUMEN: %d ok - %d fallos - reporte: %s" % (ok, fail, dot))
    return 0 if fail == 0 else 2


def fase_verify():
    filas = json.loads(INV.read_text(encoding="utf-8"))
    filas.sort(key=lambda r: r["name"])
    mal = []
    for r in filas:
        st, w, _ = estado_actual(r["id"])
        ct = w.get("chatType") if w else "(sin lectura %s)" % st
        if ct != "none":
            mal.append((r["name"], r["id"], ct))
        log("%-30s %s" % (r["name"].strip()[:30], ct))
    log("\n== pendientes: %d de %d" % (len(mal), len(filas)))
    for n, l, c in mal:
        log("   %s | %s | %s" % (n, l, c))
    return 0 if not mal else 2


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--phase", choices=["pilot", "all", "verify"], required=True)
    a = ap.parse_args()
    TOKEN = get_token()
    log("token ok (len %d)" % len(TOKEN))
    sys.exit({"pilot": fase_pilot, "all": fase_all, "verify": fase_verify}[a.phase]())
