#!/usr/bin/env python3
"""Alinea y publica las dos plantillas de revisión (una página cada una).

    python scripts/publicar-plantillas.py

URLs estables (la ruta completa vive en el path del STEP, no en el del funnel):

    https://comunidades.ilatekpr.com/plantilla/techos
    https://comunidades.ilatekpr.com/plantilla/limpieza

Son plantillas internas: no van al índice de comunidades ni al lote de 177.
Requiere el Chrome del propietario con la sesión de GHL en el puerto 9222 y
el payload ya regenerado (node scripts/preparar-funnel-ghl.mjs --only ...).
"""

import importlib.util
import json
import pathlib
import re
import sys
import urllib.request

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]

# El módulo de alta lleva guion en el nombre: se carga por ruta.
_spec = importlib.util.spec_from_file_location(
    "alta_funnel_ghl", ROOT / "scripts" / "alta-funnel-ghl.py")
alta = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(alta)

PLANTILLAS = [
    {"fid": "2batSdUruZigPSJaALiw", "nombre": "PLANTILLA · Techos",
     "step": "4c68c785-9f16-4719-81e3-e509c89624e7",
     "pagina": "Techos", "path": "/plantilla/techos", "key": "techos"},
    {"fid": "1EDEQjVlWjSUIo0clnX6", "nombre": "PLANTILLA · Limpieza",
     "step": "15c122b8-2038-41f8-87e6-3d454108285c",
     "pagina": "Limpieza", "path": "/plantilla/limpieza", "key": "limpieza"},
]


def payload(key):
    data = json.loads((ROOT / "data/ghl/funnels/carolina/isla-verde.json")
                      .read_text(encoding="utf-8"))
    return next(p for p in data["pages"] if p["kind"] == key)


def intro(fr):
    """Valores tal como los ve el formulario (espera a que React hidrate)."""
    return fr.evaluate("""()=>{const i=document.querySelectorAll('input');
      const t=document.querySelectorAll('textarea');
      return {name:i[0]?.value||'', path:i[1]?.value||'', fav:i[2]?.value||'',
              head:t[0]?.value.length||0, body:t[1]?.value.length||0};}""")


def esperar_hidratacion(pg, fr):
    for _ in range(40):
        if intro(fr)["name"]:
            return True
        pg.wait_for_timeout(1000)
    return False


def domain_id(fid):
    for f in alta.api_list_funnels():
        if f["_id"] == fid:
            return f.get("domainId") or ""
    return ""


def asegurar_settings(pg, tpl):
    """Dominio + favicon + head + body, verificados de vuelta."""
    for intento in range(3):
        fr = alta.settings_frame(pg, tpl["fid"])
        esperar_hidratacion(pg, fr)
        if not domain_id(tpl["fid"]):
            fr.locator("#funnels").click()
            pg.wait_for_timeout(2500)
            fr.locator(".hr-base-select-option").filter(has_text=alta.DOMAIN) \
                .first.click(force=True)
            pg.wait_for_timeout(2500)
        c = intro(fr)
        if c["fav"] and c["head"] and c["body"]:
            print("   settings ya completos", flush=True)
            return True
        fr.locator('input[placeholder="Add a favicon URL"]').fill(alta.FAVICON)
        fr.locator('textarea[placeholder*="<head>"]').fill(alta.HEAD_CODE)
        fr.locator('textarea[placeholder*="<body>"]').fill(alta.BODY_CODE)
        pg.wait_for_timeout(900)
        print("   escribiendo:", intro(fr), flush=True)
        fr.get_by_role("button", name="Save", exact=True).first.click()
        pg.wait_for_timeout(11000)
        fr = alta.settings_frame(pg, tpl["fid"])
        esperar_hidratacion(pg, fr)
        c = intro(fr)
        print("   guardado:", c, "| domainId:", domain_id(tpl["fid"]) or "(vacío)", flush=True)
        if c["fav"] and c["head"] and c["body"] and domain_id(tpl["fid"]):
            return True
    return False


def abrir_overview(pg, fid, step):
    for _ in range(3):
        pg.goto(f"{alta.BASE}/{fid}/steps/{step}/overview",
                wait_until="domcontentloaded", timeout=90000)
        for _ in range(25):
            pg.wait_for_timeout(1500)
            try:
                fr = alta.app_frame(pg)
                if fr.locator("#edit-page").count():
                    return fr
            except Exception:                   # noqa: BLE001
                pass
    raise RuntimeError("no abrió el overview del step")


def asegurar_path(pg, tpl):
    """El path del step es la URL publicada: debe ir completo."""
    fr = abrir_overview(pg, tpl["fid"], tpl["step"])
    fr.click("#edit-page")
    pg.wait_for_timeout(3000)
    ins = fr.locator('[role="dialog"] input')
    actual = ins.nth(1).input_value()
    if actual != tpl["path"]:
        ins.nth(0).fill(tpl["pagina"])
        ins.nth(1).fill(tpl["path"])
        pg.wait_for_timeout(600)
        fr.locator('[role="dialog"] button').filter(has_text="Update page").last.click()
        pg.wait_for_timeout(7000)
    else:
        fr.locator('[role="dialog"] button').filter(has_text="Cancel").last.click()
        pg.wait_for_timeout(1500)
    print(f"   step path → {tpl['path']}", flush=True)


def inyectar(pg, tpl, html):
    fr = abrir_overview(pg, tpl["fid"], tpl["step"])
    fr.get_by_role("button", name="Edit", exact=True).first.click()
    bf = None
    for _ in range(60):
        bf = alta.builder_frame(pg)
        if bf:
            break
        pg.wait_for_timeout(1000)
    if not bf:
        raise RuntimeError("no abrió el editor de página")
    pg.wait_for_timeout(8000)
    bf.get_by_text("Custom HTML/JavaScript").first.click()
    pg.wait_for_timeout(3000)
    bf.get_by_role("button", name="Open Code Editor").click()
    pg.wait_for_timeout(4000)
    n = bf.evaluate(
        """(h)=>{const e=document.querySelector('[role="dialog"] .CodeMirror');
                 if(!e||!e.CodeMirror) return 0;
                 e.CodeMirror.setValue(h);
                 return e.CodeMirror.getValue().length;}""", html)
    if not n:
        raise RuntimeError("CodeMirror no disponible")
    pg.wait_for_timeout(1500)
    bf.locator('[role="dialog"]').filter(has_text="Custom Javascript/HTML") \
      .locator("button").filter(has_text="Save").last.click()
    for _ in range(20):
        pg.wait_for_timeout(1500)
        if not pg.evaluate("()=>document.querySelectorAll('.hr-modal-mask').length"):
            break
    print(f"   embed {n} chars", flush=True)
    return bf


def publicar(pg, bf):
    bf.click("#pg-funnel-builder__btn--save")
    pg.wait_for_timeout(6000)
    bf.click("#pg-funnel-builder__btn--publish")
    pg.wait_for_timeout(16000)
    texto = bf.evaluate("() => document.body.innerText")
    return next((l.strip() for l in texto.split("\n") if alta.DOMAIN in l), "")


def estado(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=40) as res:
            body = res.read().decode("utf-8", "replace")
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S)
        title = re.search(r"<title>([^<]*)</title>", body, re.S)
        return {"status": res.status, "kb": round(len(body) / 1024),
                "h1": re.sub(r"\s+", " ", (h1.group(1) if h1 else ""))[:60],
                "title": (title.group(1) if title else "")[:60],
                "gtm": "GTM-" in body, "pixel": "fbq(" in body,
                "chat": "msgsndr" in body,
                "favicon": bool(re.search(r'rel="(?:shortcut )?icon"', body))}
    except Exception as exc:                    # noqa: BLE001
        return {"status": getattr(exc, "code", "ERR")}


def main():
    alta.PIT = alta.token()
    urls = {}
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        ctx = browser.contexts[0]
        ctx.add_init_script("window.alert=function(){};window.confirm=function(){return true;};")
        # Una sola pestaña de GHL: se reutiliza la que ya está abierta.
        pg = next((x for x in ctx.pages if "gohighlevel" in x.url), None) or ctx.new_page()
        pg.on("dialog", lambda d: d.accept())

        for tpl in PLANTILLAS:
            print(f"\n* {tpl['nombre']}", flush=True)
            asegurar_settings(pg, tpl)
            asegurar_path(pg, tpl)
            bf = inyectar(pg, tpl, payload(tpl["key"])["html"])
            publicada = publicar(pg, bf)
            url = f"https://{alta.DOMAIN}{tpl['path']}"
            urls[tpl["key"]] = {"url": url, "publicada": publicada, "fid": tpl["fid"],
                                "step": tpl["step"], "path": tpl["path"]}
            print(f"   publicada: {publicada or url}", flush=True)

    print()
    for key, info in urls.items():
        print(f"{key}: {info['url']} → {estado(info['url'])}", flush=True)

    (ROOT / "data/ghl/plantillas.json").write_text(
        json.dumps(urls, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
