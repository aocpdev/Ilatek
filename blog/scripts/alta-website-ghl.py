#!/usr/bin/env python3
"""Alta de páginas del blog en GHL (Sites → Websites) clonando «Blog - Home».

Modelo: una página por entrada del blog, clonada SIEMPRE de la plantilla
`Blog - Home` (QxjjQdqfj8LNX6VeSApk). Del clon solo se reescribe:

  * Headline        → el H1 del embed de esa entrada
  * Description     → la del CSV de SEO
  * Keywords        → la palabra clave del CSV de SEO
  * Social image    → screenshot del hero de la página viva (1200×630) subido
                      a la Media Library, igual que en Comunidades
  * Canonical       → la URL canónica de esa entrada
  * Schema markup   → los JSON-LD de la entrada (van dentro del embed) y el
                      bloque de datos estructurados de la página

Base: Comunidades/scripts/alta-funnel-ghl.py (mismo Chrome del propietario por
CDP en el puerto 9222, mismos helpers de frames, SEO, publish y screenshot).

Uso:

    python blog/scripts/alta-website-ghl.py --descubrir
    python blog/scripts/alta-website-ghl.py --only /blog/cintron-vs-danosa
    # rellena un clon hecho a mano con «Clone» (sin automatizar el desplegable):
    python blog/scripts/alta-website-ghl.py --only /blog/cintron-vs-danosa --page-id <id>
    python blog/scripts/alta-website-ghl.py --limit 1        # lote aprobado
    python blog/scripts/alta-website-ghl.py --list blog/seo/cola.txt

El lote NO se lanza sin autorización: `--limit` existe para tandas cortas y el
ledger (`blog/data/ghl-pages.json`) evita republicar lo que ya pasó el gate.

UI real de esta cuenta (descubierta en solo lectura, 8 nov 2026):

  * Builder en frame propio `page-builder.leadconnectorhq.com` (el frame de
    app.gohighlevel.com queda vacío).
  * Panel SEO: Content (Title/Description) · Keywords (textarea) · Author ·
    Images (input) · Links & tags (canonical, botones Add) · Language ·
    Schema markup (botón «New schema»; la plantilla trae Organization activo).
  * Sites → Websites → sitio «Ilatek» (`XG0ggFh3pBPpA5s0Pe37`) → pestaña Pages:
    tarjetas con Edit / Edit in a New Tab / Preview Link y «Add new page» (abre
    el selector de snapshots). La lista NO duplica.
  * El clon está en el builder: desplegable con el nombre de la página (arriba)
    → panel «Pages» → menú «…» de la fila → Edit · Preview · **Clone** ·
    Unpublish · Delete. `clonar_plantilla()` usa esa ruta.
  * URL/slug y SEO en la API interna: `backend.leadconnectorhq.com/funnels/
    page/<pageId>` devuelve el slug en `url` (p. ej. `/home-page-243912-…`) y el
    SEO en `meta` (title, description, canonicalMeta, customMeta…). Se autentica
    con el Bearer de la sesión (`access-token-v2`, cookie legible por CDP); el
    PIT NO vale ahí (401 «Error calling IAM service»). La lectura está
    verificada; la escritura no tiene ruta documentada y se prueba con
    `--api-probe` antes de confiar en ella (si no responde, el slug y el SEO
    siguen siendo trabajo del builder).
"""

from __future__ import annotations

import argparse
import csv
import json
import mimetypes
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request
import uuid

from playwright.sync_api import sync_playwright

REPO = pathlib.Path(__file__).resolve().parents[2]      # .../Ilatek
BLOG = REPO / "blog"
SHOTS = REPO / "screenshots"

LOCATION = "8OxUENFVM60EKzqsTcoD"
SITE = "https://ilatekpr.com"
TEMPLATE_NAME = "Blog - Home"
TEMPLATE_ID = "QxjjQdqfj8LNX6VeSApk"
BASE_WEB = f"https://app.gohighlevel.com/v2/location/{LOCATION}/funnels-websites/websites"
BASE_PAGE = f"https://app.gohighlevel.com/location/{LOCATION}/page-builder"
LEDGER = BLOG / "data" / "ghl-pages.json"
EMBEDS = BLOG / "embeds"
SEO_CSV = BLOG / "seo" / "seo-blog.csv"

PIT = None


def log(msg):
    print(msg, flush=True)


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


# --- datos del blog --------------------------------------------------------

def paginas():
    """Las 118 entradas con su SEO, su embed y su palabra clave."""
    indice = json.loads((EMBEDS / "paginas.json").read_text(encoding="utf-8"))
    kws = {}
    with SEO_CSV.open(encoding="utf-8", newline="") as fh:
        for row in csv.DictReader(fh):
            kws[row["ruta"].strip()] = (row.get("palabra_clave") or "").strip()
    salida = []
    for p in indice["paginas"]:
        embed = REPO / p["embed"]
        if not embed.exists():
            continue
        html = embed.read_text(encoding="utf-8")
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
        salida.append({
            "path": p["path"],
            "url": p["url"],
            "canonical": p["canonical"],
            "title": p["title"],
            "description": p["description"],
            "keyword": kws.get(p["path"], ""),
            "builder": p["builder"],
            "embed": embed,
            "html": html,
            "h1": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h1.group(1))).strip() if h1 else "",
            "schemas": len(re.findall(r'application/ld\+json', html)),
        })
    return salida


def token():
    mcp = json.loads((REPO / ".mcp.json").read_text(encoding="utf-8"))
    return mcp["mcpServers"]["ghl"]["env"]["ZJ_GHL_PIT"]


# --- API interna (backend.leadconnectorhq.com) ------------------------------
#
# La API pública (`services.leadconnectorhq.com`) solo lista páginas: id, name y
# stepId. El slug (`url`) y el SEO (`meta`) están en el backend interno, que la
# app llama con el Bearer de la sesión, no con el PIT.

API = "https://backend.leadconnectorhq.com"
API_ESCRITURA = (
    ("PUT", "/funnels/page/{id}"),
    ("PATCH", "/funnels/page/{id}"),
    ("PUT", "/funnels/page/update/{id}"),
    ("PATCH", "/funnels/page/update/{id}"),
    ("PUT", "/funnels/page/{id}/metadata"),
    ("PATCH", "/funnels/page/{id}/metadata"),
    ("POST", "/funnels/page/{id}/metadata"),
    ("PUT", "/funnels/page/meta/{id}"),
    ("PUT", "/funnels/page/settings/{id}"),
)


class ApiSinRuta(RuntimeError):
    """La API interna no expone (o no acepta) la escritura pedida."""


def api_token(ctx):
    """Bearer de la sesión del navegador (cookie legible `access-token-v2`)."""
    cookies = {c["name"]: c["value"] for c in ctx.cookies()
               if "gohighlevel.com" in c["domain"]}
    for nombre in ("access-token-v2", "access-token-v1"):
        if cookies.get(nombre):
            return cookies[nombre]
    raise ApiSinRuta("sin cookie access-token-v2 en la sesión del navegador")


def api(pagina_id, tok, method="GET", patch=None, ruta=None):
    url = API + (ruta or f"/funnels/page/{pagina_id}")
    data = json.dumps(patch).encode() if patch is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {tok}", "Accept": "application/json",
        "Version": "2021-07-28", "channel": "APP", "source": "WEB_USER",
        "Origin": "https://app.gohighlevel.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/156.0.0.0",
        **({"Content-Type": "application/json"} if data else {})})
    try:
        with urllib.request.urlopen(req, timeout=45) as res:
            cuerpo = res.read().decode("utf-8", "replace")
            try:
                return res.status, json.loads(cuerpo or "{}")
            except ValueError:
                return res.status, {}
    except urllib.error.HTTPError as exc:
        return exc.code, {}
    except Exception:                           # noqa: BLE001
        return 0, {}


def api_leer(pagina_id, tok):
    status, data = api(pagina_id, tok)
    return data if status == 200 and data.get("_id") else None


def api_slug(pagina_id, tok):
    """Slug actual de la página, sin la barra inicial ('' si no se pudo leer)."""
    return ((api_leer(pagina_id, tok) or {}).get("url") or "").lstrip("/")


def _coincide(despues, patch):
    """¿El GET posterior refleja el patch? (slug con/sin barra, meta anidado)."""
    for clave, valor in patch.items():
        actual = despues.get(clave)
        if isinstance(valor, dict) and isinstance(actual, dict):
            if not all(str(actual.get(k)) == str(v) for k, v in valor.items()
                       if k in ("title", "description", "keywords", "imageUrl", "canonicalMeta")):
                return False
        elif clave == "url":
            if str(actual or "").lstrip("/") != str(valor).lstrip("/"):
                return False
        elif str(actual) != str(valor):
            return False
    return True


def patch_seo(actual, seo, og_url="", canonical=""):
    """Cuerpo para guardar el SEO en `meta` (los campos que usa el builder)."""
    meta = dict(actual.get("meta") or {})
    meta["title"] = seo["title"]
    meta["description"] = seo["description"]
    if seo.get("keyword"):
        meta["keywords"] = seo["keyword"]
    if og_url:
        meta["imageUrl"] = og_url
    if canonical:
        meta["canonicalMeta"] = [{"content": canonical}]
    return {"meta": meta}


def api_guardar(pagina_id, tok, patch):
    """Prueba las rutas candidatas y confirma releyendo; devuelve la que sirvió.

    Nunca se da por bueno un 2xx: el cambio tiene que verse en el GET posterior,
    porque el backend acepta escrituras parciales que no tocan `url`/`meta`.
    """
    antes = api_leer(pagina_id, tok) or {}
    for metodo, plantilla in API_ESCRITURA:
        ruta = plantilla.format(id=pagina_id)
        status, _ = api(pagina_id, tok, metodo, patch, ruta)
        if status not in (200, 201, 204):
            continue
        despues = api_leer(pagina_id, tok) or {}
        if _coincide(despues, patch):
            return f"{metodo} {ruta}"
        log(f"      {metodo} {ruta} devolvió {status} pero el dato no cambió")
    raise ApiSinRuta(f"sin ruta de escritura ({len(API_ESCRITURA)} probadas); "
                     f"slug actual /{antes.get('url', '').lstrip('/')}")


def api_probe(ctx, pagina_id):
    """Diagnóstico sin escribir: qué lee la API y qué rutas de escritura existen."""
    tok = api_token(ctx)
    pagina = api_leer(pagina_id, tok)
    if not pagina:
        raise SystemExit("la API interna no devolvió la página (revisa la sesión)")
    log(f"slug: /{str(pagina.get('url') or '').lstrip('/')}")
    meta = pagina.get("meta") or {}
    log("meta: " + ", ".join(sorted(meta)))
    for clave in ("title", "description", "keywords", "image", "canonicalMeta"):
        if clave in meta:
            log(f"   {clave}: {str(meta[clave])[:120]}")
    log("escritura (cuerpo vacío, no modifica nada):")
    for metodo, plantilla in API_ESCRITURA:
        ruta = plantilla.format(id=pagina_id)
        status, _ = api(pagina_id, tok, metodo, {}, ruta)
        log(f"   {metodo:5} {ruta:46} -> {status}")


def conectar(p):
    """Conecta al Chrome del propietario sin colgarse con 20+ pestañas.

    `connect_over_cdp` adjunta TODOS los targets: con pestañas huérfanas del
    builder (bug conocido del proyecto) la conexión se queda esperando y muere a
    los 180 s. Se reintenta con timeout corto y, si sigue, se adjunta al
    websocket de la pestaña de GHL, que es el target que realmente se usa.
    """
    # Navegador completo. Con playwright 1.60 el handshake contra Chrome 156 se
    # quedaba colgado 180 s; desde 1.64 adjunta en ~1 s. Se reintenta por si el
    # primer intento pilla el proceso frío.
    for intento in (1, 2, 3):
        try:
            return p.chromium.connect_over_cdp("http://127.0.0.1:9222", timeout=60000)
        except Exception as exc:                # noqa: BLE001
            log(f"   CDP no conectó ({type(exc).__name__}); intento {intento}/3")
            time.sleep(4)
    raise RuntimeError("CDP no disponible en 127.0.0.1:9222")


# --- navegador -------------------------------------------------------------

def app_frame(pg):
    return max(pg.frames, key=lambda f: len(f.evaluate("() => document.body.innerText") or ""))


def builder_frame(pg):
    """El builder vive en un frame propio (page-builder.leadconnectorhq.com).

    El frame de app.gohighlevel.com queda vacío (len 0) y engaña al `max()`.
    """
    frames = list(pg.frames)
    frames.sort(key=lambda f: 0 if "page-builder.leadconnectorhq.com" in (f.url or "") else 1)
    for fr in frames:
        try:
            if fr.locator("#pg-funnel-builder__btn--publish").count():
                return fr
        except Exception:                       # noqa: BLE001
            continue
    return None


def wait_for(fn, timeout=45, step=0.5):
    end = time.time() + timeout
    while time.time() < end:
        try:
            value = fn()
            if value:
                return value
        except Exception:                       # noqa: BLE001
            pass
        time.sleep(step)
    return None


def ir_a(pg, url, listo, espera=60):
    for intento in (1, 2, 3):
        try:
            pg.goto(url, wait_until="domcontentloaded", timeout=90000)
        except Exception:                       # noqa: BLE001
            pg.wait_for_timeout(1500)
        fr = wait_for(listo, espera, 1)
        if fr:
            return fr
        if intento < 3:
            try:
                pg.reload(wait_until="domcontentloaded", timeout=90000)
            except Exception:                   # noqa: BLE001
                pass
            pg.wait_for_timeout(2000)
    return None


def cerrar_mascara(pg, timeout=30):
    end = time.time() + timeout
    while time.time() < end:
        try:
            if not pg.evaluate("() => document.querySelectorAll('.hr-modal-mask').length"):
                return True
        except Exception:                       # noqa: BLE001
            pass
        time.sleep(1)
    return False


def http(url):
    req = urllib.request.Request(url, headers={"User-Agent": "ilatek-blog-pages"})
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            return res.status, res.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception:                           # noqa: BLE001
        return 0, ""


def cache_bust(url):
    return f"{url}{'&' if '?' in url else '?'}v={int(time.time())}"


def og_screenshot(pg, url, out):
    """Hero de la página viva, 1200×630, sin scrollbar (como Comunidades)."""
    pg.set_viewport_size({"width": 1200, "height": 630})
    pg.goto(url, wait_until="load", timeout=60000)
    time.sleep(5)
    pg.add_style_tag(content=(
        "html{scrollbar-width:none!important}"
        "body{overflow:hidden!important}"
        "::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}"))
    time.sleep(1)
    out.parent.mkdir(parents=True, exist_ok=True)
    pg.screenshot(path=str(out))
    return out


def upload_media(png):
    boundary = uuid.uuid4().hex
    ctype = mimetypes.guess_type(png.name)[0] or "image/png"
    body = b"".join([
        f"--{boundary}\r\n".encode(),
        f'Content-Disposition: form-data; name="file"; filename="{png.name}"\r\n'.encode(),
        f"Content-Type: {ctype}\r\n\r\n".encode(),
        png.read_bytes(), b"\r\n",
        f"--{boundary}\r\n".encode(),
        b'Content-Disposition: form-data; name="locationId"\r\n\r\n',
        LOCATION.encode(), b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ])
    req = urllib.request.Request(
        "https://services.leadconnectorhq.com/medias/upload-file",
        data=body, method="POST",
        headers={"Authorization": f"Bearer {PIT}", "Version": "2021-07-28",
                 "Accept": "application/json", "User-Agent": "Mozilla/5.0 (ilatek-blog-pages)",
                 "Content-Type": f"multipart/form-data; boundary={boundary}"})
    for intento in range(1, 4):
        try:
            with urllib.request.urlopen(req, timeout=120) as res:
                return json.loads(res.read())["url"]
        except (urllib.error.URLError, ConnectionError, TimeoutError) as exc:
            if intento == 3:
                raise
            log(f"      subida de imagen falló ({exc}); reintento {intento}/2")
            time.sleep(4 * intento)
    raise RuntimeError("subida de imagen: sin URL tras los reintentos")


# --- builder ---------------------------------------------------------------

def abrir_builder(pg, page_id, fresco=False):
    pagina = next((x for x in pg.context.pages
                   if f"page-builder/{page_id}" in (x.url or "")), None)
    if fresco or pagina is None:
        pagina = pg.context.new_page()
        # Sin `?source=website` el builder no monta su frame (queda vacío).
        pagina.goto(f"{BASE_PAGE}/{page_id}?source=website", wait_until="domcontentloaded", timeout=90000)
    bf = wait_for(lambda: builder_frame(pagina), 90)
    if not bf:
        raise RuntimeError(f"el builder no abrió para la página {page_id}")
    time.sleep(3)
    return pagina, bf


def cerrar_panel_ia(pg, bf):
    try:
        if not bf.get_by_text("Ask AI", exact=False).count():
            return
    except Exception:                           # noqa: BLE001
        return
    for cerrar in ("Cerrar", "Close"):
        botones = bf.get_by_role("button", name=cerrar, exact=False)
        for i in range(botones.count()):
            try:
                if botones.nth(i).is_visible():
                    botones.nth(i).click(timeout=3000)
                    break
            except Exception:                   # noqa: BLE001
                continue
    try:
        pg.keyboard.press("Escape")
        bf.keyboard.press("Escape")
    except Exception:                           # noqa: BLE001
        pass


def clic_seguro(loc, timeout=8000):
    try:
        loc.click(timeout=timeout)
        return True
    except Exception:                           # noqa: BLE001
        try:
            loc.evaluate("el => ((el.closest('button, [role=button], a, li, div') || el)).click()")
            return True
        except Exception:                       # noqa: BLE001
            return False


def inject_embed(pg, bf, html):
    """El embed del blog vive en un bloque Custom HTML/JavaScript del clon."""
    cerrar_panel_ia(pg, bf)
    bloque = bf.locator("text=/custom html\\s*\\/\\s*javascript/i").first
    if not (bloque.count() and clic_seguro(bloque)):
        raise RuntimeError("no apareció el bloque Custom HTML/JavaScript en el clon")
    time.sleep(2)
    abrir = bf.get_by_role("button", name="Open Code Editor")
    abrir.first.wait_for(state="visible", timeout=30000)
    if not clic_seguro(abrir.first):
        raise RuntimeError("no abrió el editor de código del embed")
    time.sleep(3)
    escrito = bf.evaluate(
        """(h) => {
            const e = document.querySelector('[role="dialog"] .CodeMirror');
            if (!e || !e.CodeMirror) return 0;
            e.CodeMirror.setValue(h);
            return e.CodeMirror.getValue().length;
        }""", html)
    if not escrito:
        raise RuntimeError("CodeMirror no disponible: no se pudo escribir el embed")
    pg.wait_for_timeout(1500)
    bf.locator('[role="dialog"]').filter(has_text="Custom Javascript/HTML") \
      .locator("button").filter(has_text="Save").last.click()
    if not cerrar_mascara(pg, 30):
        raise RuntimeError("el modal del editor no se cerró")
    log(f"      embed {escrito} chars")


def set_seo(pg, bf, seo, og_url="", canonical=""):
    """Title, description, keywords, og:image y canonical; cerrar antes de Save."""
    bf.click("#hl-builder-seo-meta-data-button")
    time.sleep(2.5)
    if not bf.locator('input[placeholder="Title"]').count():
        bf.locator(".hr-collapse-item__header").filter(has_text="Content").first.click()
        time.sleep(1.5)
    bf.locator('input[placeholder="Title"]').fill(seo["title"])
    bf.locator('textarea[placeholder="Description"]').fill(seo["description"])
    if seo.get("keyword"):
        # Keywords es una sección propia del panel (textarea), no va en Content.
        campo_kw = bf.locator('textarea[placeholder="Keywords"], input[placeholder*="Keyword" i]').first
        if campo_kw.count():
            campo_kw.fill(seo["keyword"])
            pg.keyboard.press("Tab")
            time.sleep(0.6)
        else:
            log("      aviso: el panel SEO no muestra campo de keywords")
    pg.keyboard.press("Tab")
    time.sleep(1)
    if og_url:
        bf.locator(".hr-collapse-item__header").filter(has_text="Images").first.click()
        time.sleep(1.5)
        campo = bf.locator('input[placeholder="Images"]').first
        campo.fill(og_url)
        pg.keyboard.press("Tab")
        time.sleep(1)
        if og_url not in campo.input_value():
            campo.fill(og_url)
        time.sleep(0.8)
    if canonical:
        log(f"      canonical {aplicar_canonical(bf, canonical)}")
    pg.keyboard.press("Escape")
    time.sleep(2)


def aplicar_canonical(bf, url):
    bf.locator(".hr-collapse-item__header").filter(has_text="Links & tags").first.click()
    time.sleep(1.8)
    zona = bf.locator(".hr-collapse-item").filter(has_text="Links & tags").first
    if url in (zona.inner_text() or ""):
        return "ya estaba"
    adds = bf.get_by_role("button", name="Add", exact=True)
    if adds.count() < 2:
        raise RuntimeError("no está el Add de Canonical links en Links & tags")
    adds.last.click()
    time.sleep(1.8)
    campo = bf.locator('input[placeholder="https://example.com"]').first
    campo.fill(url)
    time.sleep(0.4)
    bf.get_by_role("button", name="Add", exact=True).last.click()
    time.sleep(1.8)
    if url not in (zona.inner_text() or ""):
        raise RuntimeError(f"el canonical no quedó en el drawer ({url})")
    return "añadido"


def url_publicada(bf):
    texto = bf.evaluate("() => document.body.innerText") or ""
    return next((l.strip() for l in texto.split("\n") if "ilatekpr.com" in l), "")


def save_publish(pg, bf, intentos=3):
    if not cerrar_mascara(pg, 30):
        raise RuntimeError("queda un modal abierto: la máscara bloquea Save/Publish")
    bf.click("#pg-funnel-builder__btn--save")
    pg.wait_for_timeout(12000)
    for intento in range(1, intentos + 1):
        bf.click("#pg-funnel-builder__btn--publish")
        url = wait_for(lambda: url_publicada(bf), 45, 2)
        if url:
            return url
        log(f"      publish sin URL (intento {intento})")
        cerrar_mascara(pg, 15)
        bf = builder_frame(pg) or bf
    return ""


# --- descubrimiento (solo lectura) -----------------------------------------

def descubrir(pg):
    """Mapea la UI real: lista de páginas, menú de la fila y panel SEO."""
    log("== lista de páginas (Sites → Websites) ==")
    fr = ir_a(pg, BASE_WEB, lambda: pg.locator("body").inner_text().strip() != "", 50)
    fr = app_frame(pg)
    filas = fr.locator("tbody tr")
    log(f"filas: {filas.count()}")
    for i in range(min(filas.count(), 12)):
        log("   · " + re.sub(r"\s+", " | ", filas.nth(i).inner_text())[:160])

    objetivo = fr.locator("tbody tr").filter(has_text=TEMPLATE_NAME).first
    log(f"¿está la plantilla '{TEMPLATE_NAME}'? {bool(objetivo.count())}")
    if objetivo.count():
        log("   fila: " + re.sub(r"\s+", " | ", objetivo.inner_text())[:200])
        botones = objetivo.locator("button")
        log(f"   botones en la fila: {botones.count()}")
        for i in range(min(botones.count(), 5)):
            try:
                log(f"     [{i}] {(botones.nth(i).get_attribute('aria-label') or botones.nth(i).inner_text() or '?')[:60]}")
            except Exception:                   # noqa: BLE001
                pass
        try:
            botones.last.click(timeout=5000)
            pg.wait_for_timeout(1500)
            items = fr.get_by_role("menuitem")
            log(f"   items del menú: {items.count()}")
            for i in range(min(items.count(), 10)):
                log("     - " + re.sub(r"\s+", " ", items.nth(i).inner_text())[:60])
            pg.keyboard.press("Escape")
        except Exception as exc:                # noqa: BLE001
            log(f"   menú de fila: {type(exc).__name__}")

    log("== builder de la plantilla ==")
    pagina, bf = abrir_builder(pg, TEMPLATE_ID)
    log("   frame builder: " + (bf.url or "")[:110])
    for sel in ('#hl-builder-seo-meta-data-button', '#pg-funnel-builder__btn--save',
                '#pg-funnel-builder__btn--publish', 'input[placeholder="Title"]'):
        log(f"   {sel}: {bf.locator(sel).count()}")
    bf.click("#hl-builder-seo-meta-data-button")
    pg.wait_for_timeout(2500)
    log("   secciones del panel SEO: " + " / ".join(
        [re.sub(r"\s+", " ", bf.locator('.hr-collapse-item__header').nth(i).inner_text())[:40]
         for i in range(bf.locator('.hr-collapse-item__header').count())]))
    log("   inputs del panel: " + " / ".join(
        [f"{(bf.locator('input').nth(i).get_attribute('placeholder') or '?')}"
         for i in range(min(bf.locator('input').count(), 12))]))
    log("   textareas del panel: " + " / ".join(
        [f"{(bf.locator('textarea').nth(i).get_attribute('placeholder') or '?')}"
         for i in range(min(bf.locator('textarea').count(), 8))]))
    marcas = bf.evaluate("""() => {
        const t = document.body.innerText || '';
        return ['Keyword', 'Schema', 'Structured', 'Markup', 'Canonical']
          .filter(k => new RegExp(k, 'i').test(t));
    }""")
    log(f"   palabras presentes en el panel: {marcas}")
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(1200)
    bf.evaluate("""() => {
        const t = document.body.innerText || '';
        const b = [...document.querySelectorAll('button, [role=button]')]
          .map(e => (e.innerText || '').trim()).filter(Boolean);
        return b.slice(0, 25);
    }""")
    log("   builder listo (sin guardar ni publicar)")


# --- flujo por página ------------------------------------------------------

def panel_paginas(bf):
    """Abre el desplegable Pages (el nombre junto a «Last saved», arriba)."""
    return bf.evaluate(f"""() => {{
        const nombre = {json.dumps(TEMPLATE_NAME)};
        const el = [...document.querySelectorAll('button, [role=button]')].find(e => {{
            const r = e.getBoundingClientRect();
            return (e.innerText || '').trim() === nombre && r.y < 150 && r.width > 40;
        }});
        if (!el) return false;
        el.click();
        return true;
    }}""")


def clonar_plantilla(pg, nombre, slug):
    """Clona `Blog - Home` con «…» → Clone del desplegable Pages del builder.

    La lista Sites → Websites no ofrece duplicar; el builder sí (menú de la fila:
    Edit · Preview · Clone · Unpublish · Delete), y el clon se abre solo.
    """
    pagina, bf = abrir_builder(pg, TEMPLATE_ID)
    if not panel_paginas(bf):
        raise RuntimeError("no encontré el desplegable Pages del builder")
    if not wait_for(lambda: bf.get_by_text("Add new page").count(), 30, 1):
        raise RuntimeError("el panel Pages no abrió")
    estado = bf.evaluate(f"""() => {{
        const nombre = {json.dumps(TEMPLATE_NAME)};
        const hoja = [...document.querySelectorAll('*')].find(e =>
            !e.children.length && (e.textContent || '').trim() === nombre);
        if (!hoja) return 'sin fila';
        let fila = hoja.parentElement;
        for (let i = 0; i < 6 && fila; i++) {{
            if (fila.querySelector('button')) break;
            fila = fila.parentElement;
        }}
        const botones = [...fila.querySelectorAll('button')];
        if (!botones.length) return 'sin botones';
        botones[botones.length - 1].click();
        return 'ok';
    }}""")
    if estado != "ok":
        raise RuntimeError(f"menú de la fila de la plantilla: {estado}")
    if not wait_for(lambda: bf.get_by_text("Clone", exact=True).count(), 15, 1):
        raise RuntimeError("el menú de la fila no mostró Clone")
    bf.get_by_text("Clone", exact=True).first.click(timeout=15000)
    nuevo = wait_for(lambda: pg.url if re.search(r"page-builder/(?!" + TEMPLATE_ID + r")[A-Za-z0-9]+", pg.url) else None, 120, 2)
    if not nuevo:
        raise RuntimeError("el clon no abrió en el builder")
    return re.search(r"page-builder/([A-Za-z0-9]+)", nuevo).group(1)


def build(pg, pagina, forzar=False):
    key = pagina["path"]
    ledger = json.loads(LEDGER.read_text(encoding="utf-8")) if LEDGER.exists() else {"paginas": []}
    hechas = {p["path"] for p in ledger["paginas"] if p.get("estado") == "publicado"}
    if key in hechas and not forzar:
        log(f"   ya publicada y verificada ({key}); se omite")
        return "omitida"

    t0 = time.time()
    log(f"* {key} · {pagina['builder']}")
    # `--page-id` permite rellenar un clon creado a mano (Clone del panel Pages),
    # porque el desplegable del builder no siempre acepta clics sintéticos.
    page_id = pagina.get("pageId") or clonar_plantilla(
        pg, pagina["builder"], pagina["path"].rsplit("/", 1)[-1] or "home")
    log(f"   clon {page_id} ({time.time()-t0:.0f}s)")

    # Slug real de la página según la API interna (lectura verificada). Sirve
    # para detectar que el clon heredó una ruta derivada y no `/blog/<slug>`.
    esperado = pagina["path"].lstrip("/")
    destino = pagina["url"]
    try:
        tok = api_token(pg.context)
        estado = api_leer(page_id, tok) or {}
        actual = (estado.get("url") or "").lstrip("/")
        if actual and actual != esperado:
            log(f"   slug en GHL: /{actual} (debería ser /{esperado})")
            destino = f"{SITE}/{actual}"
            ruta = api_guardar(page_id, tok, {"url": esperado})
            log(f"   slug corregido por API ({ruta}): /{api_slug(page_id, tok)}")
        elif actual:
            log(f"   slug en GHL: /{actual} OK")
        # SEO también por API cuando hay ruta; la UI sigue siendo el camino
        # probado para el embed y el canonical, así que no se salta nunca.
        cuerpo = patch_seo(estado, {"title": pagina["title"], "description": pagina["description"],
                                    "keyword": pagina["keyword"]}, canonical=pagina["canonical"])
        log(f"   seo por API ({api_guardar(page_id, tok, cuerpo)})")
    except ApiSinRuta as exc:
        log(f"   escritura por API no disponible: {exc}")

    pagina_pw, bf = abrir_builder(pg, page_id)
    inject_embed(pagina_pw, bf, pagina["html"])
    set_seo(pagina_pw, bf, {"title": pagina["title"], "description": pagina["description"],
                            "keyword": pagina["keyword"]},
            canonical=pagina["canonical"])
    log(f"   embed+seo ({time.time()-t0:.0f}s)")
    url = save_publish(pagina_pw, bf)
    log(f"   publicada {url or destino} ({time.time()-t0:.0f}s)")

    shot = SHOTS / ("og-blog-" + (pagina["path"].rsplit("/", 1)[-1] or "home") + ".png")
    og_screenshot(pagina_pw, destino, shot)
    og = upload_media(shot)
    log(f"   og {og} ({time.time()-t0:.0f}s)")

    pagina_pw, bf = abrir_builder(pg, page_id)
    set_seo(pagina_pw, bf, {"title": pagina["title"], "description": pagina["description"],
                            "keyword": pagina["keyword"]},
            og_url=og, canonical=pagina["canonical"])
    save_publish(pagina_pw, bf)

    status, html = http(cache_bust(destino))
    checks = {
        "status 200": status == 200,
        "h1 propio": pagina["h1"][:40].lower() in html.lower(),
        "title propio": pagina["title"][:30].lower() in html.lower(),
        "canonical": pagina["canonical"] in html,
        "og propio": og.rsplit("/", 1)[-1] in html,
        "schema": "application/ld+json" in html,
        "slug esperado": destino.rstrip("/").endswith("/" + esperado),
    }
    malos = [k for k, v in checks.items() if not v]
    log("   gate: " + ("OK" if not malos else "FALLA " + ", ".join(malos)))

    ledger["paginas"] = [p for p in ledger["paginas"] if p["path"] != key]
    ledger["paginas"].append({"path": key, "pageId": page_id, "url": destino,
                              "og": og, "estado": "publicado" if not malos else "revisar",
                              "checks": checks, "fecha": time.strftime("%Y-%m-%dT%H:%M:%S")})
    LEDGER.parent.mkdir(parents=True, exist_ok=True)
    LEDGER.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return "publicada" if not malos else "revisar"


def main():
    global PIT
    ap = argparse.ArgumentParser()
    ap.add_argument("--descubrir", action="store_true", help="mapea la UI sin escribir nada")
    ap.add_argument("--only", action="append", default=[])
    ap.add_argument("--list")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--page-id", help="pageId de un clon ya creado a mano (evita el Clone)")
    ap.add_argument("--api-probe", metavar="PAGE_ID",
                    help="diagnóstico de la API interna: slug, meta y rutas de escritura")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    PIT = token()
    claves = [k.strip() for v in args.only for k in str(v).split(",") if k.strip()]
    if args.list:
        claves += [l.strip() for l in pathlib.Path(args.list).read_text(encoding="utf-8").splitlines()
                   if l.strip()]
    todas = {p["path"]: p for p in paginas()}

    with sync_playwright() as p:
        browser = conectar(p)
        ctx = browser.contexts[0]
        ctx.add_init_script("window.alert=function(){};window.confirm=function(){return true;};")
        abiertas = [x for c in browser.contexts for x in c.pages]
        pg = (next((x for x in abiertas if "gohighlevel" in (x.url or "")), None)
              or (abiertas[0] if abiertas else None))
        if pg is None:
            pg = browser.contexts[0].new_page()

        if args.api_probe:
            api_probe(ctx, args.api_probe)
            return

        if args.descubrir:
            descubrir(pg)
            return

        if not claves:
            claves = [k for k in todas if k not in
                      ({x["path"] for x in json.loads(LEDGER.read_text(encoding="utf-8"))["paginas"]
                        if x.get("estado") == "publicado"} if LEDGER.exists() else set())]
        if args.limit:
            claves = claves[:args.limit]
        faltan = [k for k in claves if k not in todas]
        if faltan:
            raise SystemExit("Rutas sin embed: " + ", ".join(faltan[:5]))
        if args.page_id:
            if len(claves) != 1:
                raise SystemExit("--page-id necesita exactamente una ruta en --only")
            todas[claves[0]] = {**todas[claves[0]], "pageId": args.page_id}

        hechas = fallos = 0
        for i, k in enumerate(claves, 1):
            log(f"\n[{i}/{len(claves)}] {k}")
            try:
                if build(pg, todas[k], args.force) != "revisar":
                    hechas += 1
                else:
                    fallos += 1
            except Exception as exc:            # noqa: BLE001
                log(f"   FALLA {k}: {exc}")
                fallos += 1
        log(f"\nPublicadas: {hechas} · con fallo: {fallos}")
        if fallos:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
