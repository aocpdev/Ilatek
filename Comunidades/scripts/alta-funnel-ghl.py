#!/usr/bin/env python3
"""Alta de un funnel por comunidad clonando la plantilla publicada.

Reglas que implementa (ver documentacion/COMUNIDADES-FUNNELS-GHL.md):

  * DOS funnels por comunidad, uno por servicio, con UNA página cada uno
    (2 funnels × 177 comunidades = 354). No es una secuencia de steps.
  * Se clona la plantilla (PLANTILLA · Techos) y solo se cambia el path, el
    embed y la imagen social. Nunca se crea desde cero.
  * Cada paso se verifica de vuelta antes de seguir: Settings (los 5 campos y
    el domainId por API), el embed (largo escrito en CodeMirror), el publish
    (la barra de URL) y el gate final (HTTP + geometría móvil).
  * Cada página tiene DOS paths que deben coincidir: el path del step y el
    URL Path/Slug de la página. Si no coinciden, GHL sirve URLs duplicadas.
  * Los paths se fijan ANTES del primer publish: un slug publicado ya no se
    puede "despublicar" cambiándolo; queda vivo.

Uso:

    python scripts/alta-funnel-ghl.py --only carolina/isla-verde
    python scripts/alta-funnel-ghl.py --list data/ghl/cola-hero.txt
    python scripts/alta-funnel-ghl.py --list data/ghl/cola-hero.txt --start 3

Requiere el Chrome del propietario con la sesión de GHL abierta en el puerto
9222 y el payload ya generado:

    node scripts/preparar-funnel-ghl.mjs --only <municipio>/<comunidad> --upload
"""

import argparse
import json
import mimetypes
import pathlib
import re
import sys
import time
import urllib.request
import uuid

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]          # .../comunidades
REPO = ROOT.parent                                           # .../Ilatek
LOCATION = "8OxUENFVM60EKzqsTcoD"
BASE = f"https://app.gohighlevel.com/v2/location/{LOCATION}/funnels-websites/funnels"
DOMAIN = "comunidades.ilatekpr.com"
SITE = f"https://{DOMAIN}"
PLANTILLA = "PLANTILLA · Techos"
SUFIJO = {"techos": "Techos", "limpieza": "Limpieza"}
FAVICON = ("https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/"
           "6ab044d04091fa65e69921f6.png")
HEAD_CODE = (REPO / "documentacion/activacion-municipios/tracking-head.html").read_text(encoding="utf-8")
BODY_CODE = (REPO / "documentacion/activacion-municipios/tracking-body.html").read_text(encoding="utf-8")
SHOTS = REPO / "screenshots"
PAGE_NAME = {"techos": "Sellado de techo", "limpieza": "Limpieza"}
# Palabra que tiene que aparecer en el H1 de la página viva para saber que ese
# funnel sirve SU servicio (el clone nace con el hero y el H1 de la plantilla).
SERVICIO = {"techos": "sellado", "limpieza": "limpieza"}

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def log(msg):
    print(msg, flush=True)


def token():
    mcp = json.loads((REPO / ".mcp.json").read_text(encoding="utf-8"))
    return mcp["mcpServers"]["ghl"]["env"]["ZJ_GHL_PIT"]


PIT = None  # se resuelve en main() para poder importar sin credenciales


# --- API de GHL -----------------------------------------------------------

_FUNNELS_CACHE = {"t": 0.0, "rows": []}


def api_list_funnels(refresh=False):
    """TODOS los funnels, paginados (hoy pasan de 740).

    Antes se pedía solo la primera página de 100: con cientos de comunidades la
    plantilla y los clones ya creados caían fuera y cada reintento clonaba de
    nuevo (los "Comunidad · Los Llanos (Ciales) · Techos (7)" repetidos). Se
    cachea 15 s para no repetir la paginación en cada paso del build.
    """
    if not refresh and _FUNNELS_CACHE["rows"] and time.time() - _FUNNELS_CACHE["t"] < 15:
        return _FUNNELS_CACHE["rows"]
    rows = []
    for offset in range(0, 6000, 100):
        req = urllib.request.Request(
            f"https://services.leadconnectorhq.com/funnels/funnel/list"
            f"?locationId={LOCATION}&limit=100&offset={offset}",
            headers={"Authorization": f"Bearer {PIT}", "Version": "2021-07-28",
                     "Accept": "application/json", "User-Agent": "Mozilla/5.0 (ilatek-batch)"})
        with urllib.request.urlopen(req, timeout=60) as res:
            page = json.loads(res.read()).get("funnels", [])
        rows.extend(page)
        if len(page) < 100:
            break
    _FUNNELS_CACHE.update(t=time.time(), rows=rows)
    return rows


def _sin_sufijo(name):
    """Nombre sin el " (7)" que deja cada clon fallido."""
    return re.sub(r"\s*\(\d+\)\s*$", "", (name or "").strip())


def funnel_by_name(name, refresh=False):
    """Busca por nombre exacto y, si no, reutiliza un clon repetido.

    Las rondas con fallas dejaron clones sueltos con sufijo numérico: se usan
    esos antes que crear otro.
    """
    objetivo = _sin_sufijo(name)
    repetidos = []
    for f in api_list_funnels(refresh=refresh):
        if f.get("name") == name:
            return f
        if _sin_sufijo(f.get("name")) == objetivo:
            repetidos.append(f)
    if repetidos:
        # Los clones sueltos no valen todos: los que nacieron de un clon a medias
        # quedan sin steps (el build busca el step por nombre y revienta) y sin
        # dominio (publicarían sin URL). Se prefiere uno completo antes que el
        # primero por orden alfabético.
        completos = [f for f in repetidos if f.get("steps") and (f.get("domainId") or "")]
        return sorted(completos or repetidos, key=lambda f: f.get("name") or "")[0]
    return None


def domain_id(fid):
    """El dominio enlazado según la API (el selector de la UI miente)."""
    for f in api_list_funnels():
        if f.get("_id") == fid:
            return f.get("domainId") or ""
    return ""


def steps_map(funnel_name, expected, timeout=90, fid=None):
    """La API tarda en reflejar los steps de un clon: esperar a que estén todos.

    Se busca por `_id` cuando se conoce: GHL renombra el funnel con " (8)" si el
    nombre canónico choca con un clon repetido y, buscando por nombre, se
    devolvían los steps de OTRO funnel y el overview no cargaba
    (ciales/los-llanos, 2026-11-05).
    """
    end = time.time() + timeout
    got = {}
    while time.time() < end:
        if fid:
            f = next((x for x in api_list_funnels() if x.get("_id") == fid), {})
        else:
            f = funnel_by_name(funnel_name) or {}
        got = {s["name"]: s["id"] for s in f.get("steps", [])}
        if all(n in got for n in expected):
            return got
        time.sleep(2)
    return got


# --- navegador ------------------------------------------------------------

def app_frame(pg):
    return max(pg.frames, key=lambda f: len(f.evaluate("() => document.body.innerText") or ""))


def builder_frame(pg):
    for fr in pg.frames:
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


def _con(pg, selector):
    """Frame de la app si el selector ya existe (la SPA hidrató)."""
    try:
        fr = app_frame(pg)
        return fr if fr.locator(selector).count() else None
    except Exception:                       # noqa: BLE001
        return None


def _texto(pg, texto):
    """Frame de la app si el texto pedido ya está en pantalla."""
    try:
        fr = app_frame(pg)
        return fr if texto in fr.inner_text("body") else None
    except Exception:                       # noqa: BLE001
        return None


def tabla_funnels(pg):
    """Funnels está lista solo cuando hay buscador o filas de verdad."""
    return _con(pg, 'input[placeholder*="earch"]') or _con(pg, "tbody tr")


# El recordatorio de pago de GHL se monta encima de la app y deja la pestaña
# tapada: la tabla de funnels y el builder "no cargan" y el driver lo leía como
# "GHL no inicializó". Su botón «Go to Dashboard» devuelve al panel, que es la
# salida correcta: ni cerrar la pestaña ni recargar (recargar vuelve a sacarlo).
JS_AVISO_PAGO = """() => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
    const txt = ((document.body && document.body.innerText) || '').toLowerCase();
    if (!/payment|billing|factura|recordatorio de pago|trial|suscripci/.test(txt)) return '';
    const b = [...document.querySelectorAll('button, a, [role="button"]')]
        .filter(vis)
        .find(e => /go to dashboard|ir al panel|ir al dashboard|volver al panel/i
                    .test((e.innerText || '').trim()));
    if (!b) return '';
    b.click();
    return (b.innerText || '').trim();
}"""


def saltar_aviso_pago(pg):
    """Cierra el recordatorio de pago con su «Go to Dashboard».

    Devuelve el texto del botón si lo pulsó ("" si no había aviso). Se prueba
    en todos los frames porque el aviso lo pinta la propia app dentro del suyo.
    Solo actúa si el texto de la página habla de pago/factura, para no pulsar un
    «Go to Dashboard» de un estado vacío cualquiera y salirse del funnel.
    """
    for fr in list(pg.frames):
        try:
            pulsado = fr.evaluate(JS_AVISO_PAGO)
        except Exception:                       # noqa: BLE001
            continue
        if pulsado:
            log(f"      recordatorio de pago: «{pulsado}» → de vuelta al panel")
            pg.wait_for_timeout(2500)
            return pulsado
    return ""


def ir_a(pg, url, listo, espera=60):
    """Navega y espera a que la SPA de GHL termine de inicializar.

    `domcontentloaded` no dice nada: la app pinta "Loading new sub account
    data… Initializing…" y la tabla tarda bastante más. Con 4 carriles a la vez
    se queda ahí y el driver antiguo (7 s fijos) seguía a ciegas: de ahí los
    "No está la plantilla" y "No abrió Settings" de las rondas 3 y 4. Aquí se
    espera la señal real y, si no llega, se recarga (segunda hidratación).
    """
    for intento in (1, 2, 3):
        try:
            pg.goto(url, wait_until="domcontentloaded", timeout=90000)
        except Exception:                   # noqa: BLE001  (ERR_ABORTED)
            pg.wait_for_timeout(1500)
        # El recordatorio de pago tapa la app: sin descartarlo, `listo` no llega
        # nunca y el driver recargaba en balde (la recarga lo vuelve a sacar).
        saltar_aviso_pago(pg)
        fr = wait_for(listo, espera, 1)
        if fr:
            return fr
        if saltar_aviso_pago(pg):
            fr = wait_for(listo, 25, 1)
            if fr:
                return fr
        if intento < 3:
            log(f"      GHL no inicializó ({url.rsplit('/', 1)[-1]}); recarga {intento}")
            try:
                pg.reload(wait_until="domcontentloaded", timeout=90000)
            except Exception:               # noqa: BLE001
                pass
            pg.wait_for_timeout(2000)
    return None


def visible_dialog(fr):
    return fr.evaluate("""() => {
        const ds = [...document.querySelectorAll('[role="dialog"]')]
          .filter(d => d.offsetWidth || d.offsetHeight || d.getClientRects().length);
        if (!ds.length) return null;
        const d = ds[ds.length - 1];
        return {
          text: (d.innerText || '').split(String.fromCharCode(10)).filter(Boolean).slice(0, 8),
          inputs: [...d.querySelectorAll('input')].map(i => ({ ph: i.placeholder || '', val: i.value || '' })),
          buttons: [...d.querySelectorAll('button')].map(b => (b.innerText || '').trim()).filter(Boolean),
        };
    }""")


# --- pasos ----------------------------------------------------------------

def clone_funnel(pg, name):
    """Clona la plantilla y devuelve el funnel_id nuevo (por diferencia de lista)."""
    before = {f["_id"] for f in api_list_funnels()}
    fr = ir_a(pg, BASE, lambda: tabla_funnels(pg))
    if not fr:
        raise RuntimeError("GHL no terminó de inicializar (Sites → Funnels en blanco)")
    filas = lambda: fr.locator("tbody tr").filter(has_text=PLANTILLA)
    row = filas()
    if not row.count():
        # La tabla pagina de 15 en 15 y ordena por "recent": con 740+ funnels la
        # plantilla cae fuera de la primera página.
        buscador = fr.locator('input[placeholder*="earch"]').first
        if buscador.count():
            # El filtro no toma al primer tecleo y, con 4 carriles tocando la
            # misma tabla, el input se remonta: se limpia y se teclea de nuevo.
            for espera in (2500, 4000, 6000, 8000):
                try:
                    buscador.fill("")
                    buscador.type("PLANTILLA", delay=60)
                except Exception:               # noqa: BLE001
                    pass
                pg.wait_for_timeout(espera)
                row = filas()
                if row.count():
                    break
        if not row.count():
            # Último recurso determinista: las plantillas son las más antiguas,
            # así que están en la última página de la tabla.
            ultima = fr.get_by_role("button", name="50", exact=True)
            if ultima.count():
                ultima.last.click()
                pg.wait_for_timeout(5000)
                row = filas()
    if not row.count():
        raise RuntimeError(f"No está la plantilla '{PLANTILLA}' en Sites → Funnels")
    btns = row.first.locator("button")
    btns.nth(btns.count() - 1).click()
    pg.wait_for_timeout(1800)
    fr.get_by_role("menuitem", name="Clone").click()
    pg.wait_for_timeout(2500)

    # El modal "Clone funnel" trae el nombre con sufijo " Copy" y exige la
    # location ya marcada (Ilatek - PR). Solo se reescribe el nombre.
    campo = fr.locator('input[placeholder="Funnel name"]')
    if wait_for(lambda: campo.count(), 20):
        campo.first.fill(name)
        pg.wait_for_timeout(600)
        fr.get_by_role("button", name="Confirm", exact=True).last.click()
        pg.wait_for_timeout(6000)

    # Con dos carriles clonando a la vez, "el id que no estaba" puede ser el del
    # otro carril: se exige el NOMBRE exacto antes de aceptar el clon, y si GHL
    # lo renombró (" Copy", " (2)") se acepta solo el nombre normalizado. Antes
    # el respaldo era "cualquier id nuevo": eso es justo lo que dejaba a un
    # carril con el clon del otro y acababa escribiendo dos comunidades (paths,
    # head y body) en un mismo funnel.
    def limpiar(s):
        return re.sub(r"\s*(?:copy|\(\d+\))\s*$", "", str(s or ""), flags=re.I).strip()

    found = wait_for(lambda: next((f for f in api_list_funnels()
                                   if f["_id"] not in before and f["name"] == name), None), 90, 2)
    if not found:
        found = wait_for(lambda: next((f for f in api_list_funnels()
                                       if f["_id"] not in before
                                       and limpiar(f["name"]) == name), None), 30, 2)
    if not found:
        # Se prefiere fallar la página a seguir con un funnel ajeno: el
        # supervisor la reintenta y el gate la corta igual.
        nuevos = [str(f.get("name")) for f in api_list_funnels(refresh=True)
                  if f["_id"] not in before]
        raise RuntimeError("El clon no apareció con su nombre en la lista de funnels "
                           f"(nuevos: {', '.join(nuevos) or 'ninguno'})")
    if found["name"] != name:
        log(f"   aviso: el clon se llamó '{found['name']}', se renombra a '{name}'")
    return found["_id"]


def set_step_path(pg, fid, step_id, page_name, path):
    """Path del step (Edit page details): único punto de escritura de la URL.

    Devuelve el path tal como quedó guardado, leyéndolo de vuelta.
    """
    fr = ir_a(pg, f"{BASE}/{fid}/steps/{step_id}/overview", lambda: _con(pg, "#edit-page"))
    if not fr:
        raise RuntimeError(f"no abrió el overview de la página {page_name}")
    # El `#edit-page` aparece cuando el overview termina de hidratar; pulsarlo a
    # ciegas se come los 30 s de timeout y tira la comunidad entera (pasó en
    # humacao/palmas-del-mar). Se espera a que esté visible antes de pulsar.
    fr.locator("#edit-page").first.wait_for(state="visible", timeout=45000)
    fr.locator("#edit-page").first.click(timeout=20000)
    # El modal tarda en montar; leer o escribir sin esperarlo cuesta 30 s de
    # timeout y aborta la comunidad. Se espera a que estén los dos campos.
    if not wait_for(lambda: fr.locator('[role="dialog"] input').count() > 1, 20):
        raise RuntimeError(f"no abrió el modal de la página {page_name}")
    inputs = fr.locator('[role="dialog"] input')
    inputs.nth(0).fill(page_name)
    inputs.nth(1).fill(path)
    pg.wait_for_timeout(400)
    fr.locator('[role="dialog"] button').filter(has_text="Update page").last.click()
    pg.wait_for_timeout(4500)

    # Lectura de vuelta: el builder y el modal comparten el valor. Reabrir tras
    # el Save depende de que la máscara termine de irse, así que se espera y se
    # reintenta antes de abortar (un `input_value` sobre un input que aún no
    # existe espera 30 s y tira la comunidad entera).
    guardado = ""
    for _ in range(3):
        cerrar_mascara(pg, 15)
        try:
            fr.locator("#edit-page").first.wait_for(state="visible", timeout=20000)
            fr.locator("#edit-page").first.click(timeout=15000)
        except Exception:                       # noqa: BLE001
            # La relectura es un extra: si el botón no aparece, se gasta otra
            # vuelta en vez de tumbar la comunidad con un timeout de 30 s.
            pg.wait_for_timeout(1500)
            continue
        if wait_for(lambda: fr.locator('[role="dialog"] input').count() > 1, 15):
            guardado = fr.locator('[role="dialog"] input').nth(1).input_value()
            break
        pg.wait_for_timeout(1500)
    cancelar = fr.locator('[role="dialog"] button').filter(has_text="Cancel").last
    if cancelar.count():
        cancelar.click()
    pg.wait_for_timeout(1000)
    if not guardado:
        raise RuntimeError(f"no se pudo releer el path de {page_name} ({path})")
    return guardado


def settings_frame(pg, fid, tries=2):
    """GHL a veces redirige de Settings al overview del step: reintentar."""
    for _ in range(tries):
        fr = ir_a(pg, f"{BASE}/{fid}/settings", lambda: _texto(pg, "Funnel details"), 50)
        if fr:
            return fr
        time.sleep(2)
    raise RuntimeError("No abrió Settings del funnel")


def settings_state(fr):
    """Los cinco campos tal como los ve el formulario (largo de los textareas)."""
    return fr.evaluate("""() => {
        const i = document.querySelectorAll('input');
        const t = document.querySelectorAll('textarea');
        return { name: i[0]?.value || '', path: i[1]?.value || '',
                 fav: i[2]?.value || '', head: t[0]?.value.length || 0,
                 body: t[1]?.value.length || 0 };
    }""")


def wait_hydration(pg, fr, timeout=45):
    """El formulario se pinta vacío y React lo llena después. Escribir antes de
    ese momento hace que Save guarde favicon, head y body en blanco."""
    end = time.time() + timeout
    while time.time() < end:
        try:
            if settings_state(fr)["name"]:
                return True
        except Exception:                       # noqa: BLE001
            pass
        pg.wait_for_timeout(1000)
    return False


def set_settings(pg, fid, funnel_name, funnel_path):
    """Los 6 campos, en el orden de la UI, releídos antes de darlos por buenos.

    Devuelve el estado guardado. Si tras 3 vueltas queda algo vacío (o el
    funnel sin dominio) lanza: publicar así deja una página sin favicon ni
    tracking, y el gate lo corta más tarde con la comunidad a medias.
    """
    def chat_listo(fr):
        """El widget `Ilatek` es parte de los Settings, no un extra del embed.

        Sin esta comprobación el atajo de "settings ya completos" devolvía éxito
        con el chat sin configurar y el gate lo cortaba después (brisas-de-loiza).
        """
        if SIN_CHAT:
            # El widget queda en "none" a proposito: no hay nada que exigir y el
            # atajo de "settings ya completos" sigue siendo valido.
            return True
        try:
            return "Ilatek" in fr.locator("#chat-widgets").inner_text()
        except Exception:                       # noqa: BLE001
            return False

    estado = {}
    for intento in range(1, 4):
        fr = settings_frame(pg, fid)
        if not wait_hydration(pg, fr):
            raise RuntimeError("Settings no hidrató (el campo Name sigue vacío)")

        # El dominio va primero, pero **sin recargar**: `settings_frame` hace un
        # `goto` y eso descarta la selección antes del Save (así se quedaban los
        # funnels con `domainId` vacío y publicaban sin URL).
        if not domain_id(fid):
            selector = fr.locator("#funnels")
            if DOMAIN not in selector.inner_text():
                selector.click()
                pg.wait_for_timeout(2500)
                fr.locator(".hr-base-select-option").filter(has_text=DOMAIN).first.click(force=True)
                pg.wait_for_timeout(2000)
                if DOMAIN not in selector.inner_text():
                    log("      el selector de dominio no tomó la selección; se reintenta")
                    continue

        estado = settings_state(fr)
        if (estado["fav"] == FAVICON and estado["head"] > 100 and estado["body"] > 100
                and estado["path"] == funnel_path and estado["name"] == funnel_name
                and chat_listo(fr) and domain_id(fid)):
            log(f"      settings ya completos | domainId: {domain_id(fid)}")
            return estado

        fr.locator('input[placeholder="Please Input"]').nth(0).fill(funnel_name)
        fr.locator('input[placeholder="Please Input"]').nth(1).fill(funnel_path)
        fr.locator('input[placeholder="Add a favicon URL"]').fill(FAVICON)
        fr.locator('textarea[placeholder*="<head>"]').fill(HEAD_CODE)
        fr.locator('textarea[placeholder*="<body>"]').fill(BODY_CODE)

        chat = fr.locator("#chat-widgets")
        if SIN_CHAT:
            # --sin-chat: no se toca el selector. Si el clon ya traia el widget
            # se avisa; quitarlo desde la UI no esta soportado.
            try:
                if "Ilatek" in chat.inner_text():
                    log("      aviso: el clon ya trae chat widget; --sin-chat no lo quita")
            except Exception:                   # noqa: BLE001
                pass
        elif "Ilatek" not in chat.inner_text():
            chat.click()
            pg.wait_for_timeout(1500)
            opt = fr.locator(".hr-base-select-option").filter(has_text="Ilatek").first
            if opt.count():
                try:
                    opt.click(timeout=5000)
                except Exception:               # noqa: BLE001
                    pg.keyboard.press("Escape")
            pg.wait_for_timeout(1000)

        fr.get_by_role("button", name="Save", exact=True).first.click()
        pg.wait_for_timeout(11000)

        fr = settings_frame(pg, fid)
        wait_hydration(pg, fr)
        estado = settings_state(fr)
        log(f"      settings vuelta {intento}: {estado} | domainId: {domain_id(fid) or '(vacío)'}")
        if (estado["fav"] == FAVICON and estado["head"] > 100 and estado["body"] > 100
                and estado["path"] == funnel_path and chat_listo(fr) and domain_id(fid)):
            return estado
    raise RuntimeError(f"Settings no se guardaron completos: {estado}")


def open_builder(pg, fid, step_id):
    """Abre el builder del step.

    El overview hidrata a tirones: a veces los "Funnel steps" ya están y el
    botón Edit todavía no, y un clic a ciegas se come los 30 s y tumba la
    página (pasó en guaynabo/sereno). Se espera a que Edit esté visible y, si
    no llega, se recarga el overview y se reintenta una vez.
    """
    url = f"{BASE}/{fid}/steps/{step_id}/overview"
    for intento in (1, 2):
        fr = ir_a(pg, url, lambda: _texto(pg, "Funnel steps"), 45)
        if fr:
            boton = fr.get_by_role("button", name="Edit", exact=True)
            try:
                boton.first.wait_for(state="visible", timeout=45000)
                boton.first.click(timeout=20000)
            except Exception as exc:            # noqa: BLE001
                log(f"      Edit no apareció (vuelta {intento}): {type(exc).__name__}")
                pg.wait_for_timeout(3000)
                continue
            bf = wait_for(lambda: builder_frame(pg), 90)
            if bf:
                time.sleep(5)
                return bf
            log(f"      el builder no abrió (vuelta {intento})")
        else:
            log(f"      el overview no cargó (vuelta {intento})")
        pg.wait_for_timeout(3000)
    raise RuntimeError(f"El builder no abrió para el step {step_id}")


# El path del step y el URL Path/Slug de la página son el MISMO valor: el
# builder sincroniza ambos. Se escribe una sola vez, en Edit page details del
# step. Editar el slug desde el panel Pages es lo que corrompió el primer clon
# (siempre abre la primera página del funnel, no la del step abierto).

def clic_seguro(loc, timeout=8000):
    """Clic que no se come 30 s esperando: normal y, si algo lo tapa, por JS.

    El panel «Ask AI» del builder se abre solo y deja el lienzo cubierto: el
    clic normal espera los 30 s por defecto y tumba la comunidad entera.
    """
    try:
        loc.click(timeout=timeout)
        return True
    except Exception:                            # noqa: BLE001
        try:
            loc.evaluate("el => ((el.closest('button, [role=button], a, li, div') || el)).click()")
            return True
        except Exception:                        # noqa: BLE001
            return False


def cerrar_panel_ia(pg, bf):
    """Cierra el panel «Ask AI» si está abierto: tapa el lienzo del builder."""
    try:
        if not bf.get_by_text("Ask AI", exact=False).count():
            return
    except Exception:                            # noqa: BLE001
        return
    for cerrar in ("Cerrar", "Close"):
        botones = bf.get_by_role("button", name=cerrar, exact=False)
        for i in range(botones.count()):
            try:
                if botones.nth(i).is_visible():
                    botones.nth(i).click(timeout=3000)
                    pg.wait_for_timeout(800)
                    break
            except Exception:                    # noqa: BLE001
                continue
    try:
        pg.keyboard.press("Escape")
        bf.keyboard.press("Escape")
    except Exception:                            # noqa: BLE001
        pass
    pg.wait_for_timeout(600)


def inject_embed(pg, bf, html):
    """El editor es CodeMirror dentro de un modal: se escribe por su API.

    El clic + `insert_text` sobre el canvas cerraba el modal y dejaba el embed a
    medias (200 con ~58 KB). Se escribe con `setValue` y se comprueba leyendo
    el largo de vuelta antes de guardar.
    """
    cerrar_panel_ia(pg, bf)
    # La etiqueta cambió de mayúsculas ("Custom HTML/JavaScript" →
    # "Custom HTML/Javascript"), así que se busca por patrón y no por texto fijo.
    bloque = bf.get_by_text("Custom HTML/JavaScript", exact=False).first
    if not bloque.count():
        bloque = bf.get_by_text("Custom HTML/Javascript", exact=False).first
    if not bloque.count():
        bloque = bf.locator("text=/custom html\s*\/\s*javascript/i").first
    if not (bloque.count() and clic_seguro(bloque)):
        # Último recurso: pulsar el nodo del panel por su texto, aunque el
        # puntero no llegue porque otro panel lo cubre.
        pulsado = bf.evaluate("""() => {
            const p = [...document.querySelectorAll('p, span, div')]
              .find(e => /custom html\s*\/\s*javascript/i.test(e.innerText || '')
                         && e.children.length === 0);
            if (!p) return false;
            (p.closest('button, [role=button], li, div') || p).click();
            return true;
        }""")
        if not pulsado:
            # Builder nuevo (páginas creadas «from blank»): no hay panel lateral
            # con "Custom HTML/JavaScript"; el elemento se llama "Code" y está
            # detrás del botón "Add". Insertarlo deja el bloque en el lienzo y
            # a partir de ahí el flujo normal (Open Code Editor) sí funciona.
            add = bf.get_by_role("button", name="Add", exact=True)
            if add.count():
                clic_seguro(add.first)
                time.sleep(3)
            insertado = bf.evaluate("""() => {
                const c = [...document.querySelectorAll('div, li, button, span')]
                  .filter(e => (e.innerText || '').trim() === 'Code');
                const e = c.find(x => !/qr/i.test((x.parentElement || {}).innerText || ''));
                if (!e) return false;
                (e.closest('div, li, button') || e).click();
                return true;
            }""")
            if not insertado:
                raise RuntimeError("no apareció el bloque Custom HTML/JavaScript en el builder")
            time.sleep(4)
            bloque = bf.locator("text=/custom html\\s*\\/\\s*javascript/i").first
            if not (bloque.count() and clic_seguro(bloque)):
                raise RuntimeError("el bloque Code no quedó seleccionado en el builder")
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
        raise RuntimeError("el modal del editor no se cerró (.hr-modal-mask sigue ahí)")
    log(f"      embed {escrito} chars")


def aplicar_canonical(bf, url):
    """Declara la URL de ESTA página en SEO → Links & tags → Canonical links.

    Idempotente: si la URL ya figura en la sección no añade una fila repetida.
    El alta es un modal con un input (placeholder `https://example.com`) y un
    `Add` de confirmación; la fila queda en el drawer, que el llamante cierra
    con Escape antes del Save (con el drawer abierto el Save no commitea el
    SEO: pitfall 27).
    """
    bf.locator('.hr-collapse-item__header').filter(has_text="Links & tags").first.click()
    time.sleep(1.8)
    zona = bf.locator('.hr-collapse-item').filter(has_text="Links & tags").first
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
    if campo.input_value() != url:
        campo.fill(url)
    bf.get_by_role("button", name="Add", exact=True).last.click()
    time.sleep(1.8)
    if url not in (zona.inner_text() or ""):
        raise RuntimeError(f"el canonical no quedó en el drawer ({url})")
    return "añadido"


def set_seo(pg, bf, seo, og_url="", canonical=""):
    """Title, description y og:image, y el panel se cierra antes de guardar.

    Con el drawer de SEO abierto, el `Save` de la página no commitea el SEO: la
    imagen social quedaba en el modelo del builder y la página viva seguía
    apuntando a la anterior (la de techos en la página de limpieza).
    """
    bf.click("#hl-builder-seo-meta-data-button")
    time.sleep(2.5)
    if not bf.locator('input[placeholder="Title"]').count():
        bf.locator(".hr-collapse-item__header").filter(has_text="Content").first.click()
        time.sleep(1.5)
    bf.locator('input[placeholder="Title"]').fill(seo["title"])
    bf.locator('textarea[placeholder="Description"]').fill(seo["description"])
    if bf.locator('input[placeholder="Title"]').first.input_value() != seo["title"]:
        bf.locator('input[placeholder="Title"]').fill(seo["title"])
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
    # Cerrar el panel: sin esto el Save no incluye el SEO/og:image.
    pg.keyboard.press("Escape")
    time.sleep(2)



def cerrar_mascara(pg, timeout=30):
    """Espera a que no quede `.hr-modal-mask`: su máscara intercepta el clic en
    Save/Publish y el publish no ocurre, sin mensaje de error."""
    end = time.time() + timeout
    while time.time() < end:
        try:
            if not pg.evaluate("() => document.querySelectorAll('.hr-modal-mask').length"):
                return True
        except Exception:                       # noqa: BLE001
            pass
        time.sleep(1)
    return False


def url_publicada(bf):
    texto = bf.evaluate("() => document.body.innerText") or ""
    return next((l.strip() for l in texto.split("\n") if DOMAIN in l), "")


def publicada_con(url, needle, servicio="", timeout=240):
    """Espera a que la página viva muestre el H1 de ESTA comunidad y servicio.

    Dos trampas ya pagadas aquí:
      * Publicar a los 5 s del Save publica el snapshot anterior (la plantilla).
      * El `<title>` se actualiza antes que el cuerpo, así que buscar el nombre
        en todo el HTML da falso positivo con el h1 de Isla Verde todavía vivo.
      * El CDN puede tardar **minutos**, no segundos, en servir la versión nueva.
    Por eso se mira el `<h1>` (y la palabra del servicio), con ventana larga.
    """
    end = time.time() + timeout
    while time.time() < end:
        status, html = http(cache_bust(url))
        if status == 200:
            m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
            h1 = re.sub(r"\s+", " ", m.group(1)).lower() if m else ""
            if needle.lower() in h1 and (not servicio or servicio in h1):
                return True
        time.sleep(8)
    return False


def og_publicada(url, esperado, timeout=240):
    """El og:image de la página viva tiene que ser el screenshot de ESTE servicio.

    Es parte del gate: si la página de limpieza apunta a la imagen de techos, la
    tarjeta social sale con el hero equivocado aunque el texto sea correcto.
    """
    want = str(esperado or "").rsplit("/", 1)[-1]
    if not want:
        return True
    end = time.time() + timeout
    while time.time() < end:
        status, html = http(cache_bust(url))
        if status == 200:
            m = re.search(r'<meta property="og:image" content="([^"]+)"', html)
            if m and want in m.group(1):
                return True
        time.sleep(8)
    return False


def save_publish(pg, bf, intentos=2):
    """Save + Publish con la barra de URL como prueba, no los timeouts.

    Devuelve la URL que quedó en la barra del builder; si no aparece, lanza:
    significa dominio sin conectar o modal abierto, y publicar a ciegas deja la
    comunidad "publicada" sin URL viva.
    """
    if not cerrar_mascara(pg, 30):
        raise RuntimeError("queda un modal abierto: la máscara bloquea Save/Publish")
    bf.click("#pg-funnel-builder__btn--save")
    # El Save de la página no es instantáneo: con 5 s el Publish publicaba el
    # snapshot anterior (la plantilla) aunque el editor ya tuviera el embed
    # nuevo. Medido: 12 s es suficiente y la página sale con su contenido.
    pg.wait_for_timeout(12000)
    for intento in range(1, intentos + 1):
        bf.click("#pg-funnel-builder__btn--publish")
        url = wait_for(lambda: url_publicada(bf), 45, 2)
        if url:
            return url
        log(f"      publish sin URL (intento {intento}); se repite tras cerrar máscaras")
        cerrar_mascara(pg, 15)
        bf = builder_frame(pg) or bf
    return ""


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
                 "Accept": "application/json", "User-Agent": "Mozilla/5.0 (ilatek-batch)",
                 "Content-Type": f"multipart/form-data; boundary={boundary}"})
    # La subida puede recibir un reset de conexión a mitad del multipart
    # (WinError 10054 visto en la tanda 08). La página ya está publicada en ese
    # punto, así que abortar la comunidad por un corte transitorio es caro:
    # se reintenta la subida antes de darla por fallida.
    for intento in range(1, 4):
        try:
            with urllib.request.urlopen(req, timeout=120) as res:
                return json.loads(res.read())["url"]
        except (urllib.error.URLError, ConnectionError, TimeoutError) as exc:
            if intento == 3:
                raise
            log(f"   subida de imagen falló ({exc}); reintento {intento}/2")
            time.sleep(4 * intento)
    raise RuntimeError("subida de imagen: sin URL tras los reintentos")


def og_screenshot(pg, url, out):
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


# --- verificación ---------------------------------------------------------

def http(url):
    req = urllib.request.Request(url, headers={"User-Agent": "ilatek-batch"})
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            return res.status, res.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception:                           # noqa: BLE001
        return 0, ""


MOBILE_JS = """() => {
    const vw = document.documentElement.clientWidth;
    const r = s => { const e = document.querySelector(s); if (!e) return null;
        const b = e.getBoundingClientRect();
        return [Math.round(b.left), Math.round(vw - b.right)]; };
    const o = { vw, docW: document.documentElement.scrollWidth,
        hero: r('.hero'), band: r('.band'), final: r('.final'),
        h1: r('h1'), tile: r('.tile') };
    window.scrollTo(0, document.documentElement.scrollHeight);
    const f = document.querySelector('.site-footer');
    o.footerBottom = f ? Math.round(f.getBoundingClientRect().bottom) : -1;
    o.vh = innerHeight;
    return o;
}"""


def gate_movil(pg, url, anchos=(360, 390, 430)):
    """A sangre + padding interno, medido en la página viva.

    Los bloques (hero, banda de CTA, cierre) tienen que ir de 0 al ancho real
    —sin margen lateral que deje ver el fondo por los cantos— y el texto a
    18 px (se acepta 14-24 por redondeo). El scroll tiene que terminar en el
    pie. Se mide dentro de los envoltorios de GHL, que es donde el CSS manda.
    """
    checks = {"movil_ancho": True, "movil_inset": True, "movil_scroll": True}
    for ancho in anchos:
        pg.set_viewport_size({"width": ancho, "height": 844})
        pg.goto(cache_bust(url), wait_until="load", timeout=60000)
        pg.wait_for_timeout(2500)
        m = pg.evaluate(MOBILE_JS)
        bordes = [m["hero"], m["band"], m["final"]]
        if m["docW"] != m["vw"] or any(b != [0, 0] for b in bordes):
            checks["movil_ancho"] = False
            log(f"      móvil {ancho}px: filo/desborde {m}")
        for clave in ("h1", "tile"):
            lados = m[clave]
            if not lados or not all(14 <= v <= 24 for v in lados):
                checks["movil_inset"] = False
                log(f"      móvil {ancho}px: inset de {clave} = {lados}")
        if abs(m["footerBottom"] - m["vh"]) > 1:
            checks["movil_scroll"] = False
            log(f"      móvil {ancho}px: el scroll no termina en el pie "
                f"({m['footerBottom']} vs {m['vh']})")
    pg.set_viewport_size({"width": 1440, "height": 900})
    return checks


def cache_bust(url):
    """El CDN de GHL sigue sirviendo la copia anterior unos segundos después del
    publish: sin esto el gate mide la versión vieja y falla una página correcta."""
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}v={int(time.time() * 1000)}"


# --sin-chat: en esta corrida el widget de chat queda en "none": no se
# configura y el gate no lo exige. Se activa desde main() con --sin-chat.
SIN_CHAT = False


def settings_vivos(page_url):
    """¿El funnel ya tiene dominio, favicon, tracking y chat?

    Se mide en la página viva porque la API no devuelve el path del funnel. Si la
    URL responde con GTM, el favicon y el chat, reescribir Settings solo cuesta
    ~2 min de hidratación y no aporta nada.
    """
    status, html = http(cache_bust(page_url))
    return (status == 200 and "GTM-PQMR2TDB" in html
            and "6ab044d04091fa65e69921f6" in html
            and (SIN_CHAT or "chat-widget" in html))


def gate(page, community):
    url = page["url"]
    status, html = http(cache_bust(url))
    checks = {
        "status": status == 200,
        "peso": len(html) > 120000,
        "mojibake": not re.findall(r"[ÃÂ]|â€", html),
        "h1": community.lower() in (re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S).group(1).lower()
                                    if re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S) else ""),
        # El H1 tiene que ser de SU servicio: el clone arrastra el de la plantilla
        # (techos) y así la imagen social de limpieza salía con el hero de techos.
        "servicio": SERVICIO[page["kind"]] in (re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S).group(1).lower()
                                               if re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S) else ""),
        "title": community.lower() in (re.search(r"<title>([^<]*)</title>", html).group(1).lower()
                                       if re.search(r"<title>([^<]*)</title>", html) else ""),
        "gtm": "GTM-PQMR2TDB" in html,
        "ga4": "G-BTVFHT1X8G" in html,
        "pixel": "fbq(" in html,
        # Con --sin-chat el widget queda en "none": no se exige.
        "chat": True if SIN_CHAT else ("chat-widget" in html),
        "favicon": "6ab044d04091fa65e69921f6" in html,
        "og": "og:image" in html,
        # La imagen social tiene que ser el screenshot de SU servicio.
        "og_imagen": (str(page.get("seo", {}).get("image", "")).rsplit("/", 1)[-1] in html
                      if page.get("seo", {}).get("image") else "og:image" in html),
        # La URL publicada tiene que ser /municipio/comunidad/servicio, sin
        # sufijos numéricos que GHL inventa cuando hay conflicto de paths.
        "ruta": (url.rstrip("/").endswith("/" + str(page.get("path", "")))
                 and not re.search(r"-\d{4,}$", url.rstrip("/"))),
        "sin_page": http(cache_bust(url + "-page"))[0] == 404,
    }
    return checks


# --- flujo ----------------------------------------------------------------

def build(pg, key, servicio=None):
    """Un funnel por servicio: dos funnels por comunidad, una página cada uno.

    `servicio` limita la corrida a esa página. Sirve para entornos que matan el
    proceso a los pocos minutos: cada página cabe sola y la idempotencia reusa
    lo que la corrida anterior dejó hecho.
    """
    mun, slug = key.split("/")
    payload_path = ROOT / "data" / "ghl" / "funnels" / mun / f"{slug}.json"
    data = json.loads(payload_path.read_text(encoding="utf-8"))
    t0 = time.time()
    log(f"* {key} · {data['community']}" + (f" · solo {servicio}" if servicio else ""))
    problemas = []

    pages = data["pages"]
    if servicio:
        pages = [p for p in pages if p["kind"] == servicio]
        if not pages:
            raise RuntimeError(f"{key}: el payload no trae la página '{servicio}'")

    for page in pages:
        sufijo = SUFIJO[page["kind"]]
        funnel_name = f"{data['funnelName']} · {sufijo}"
        # El path publicado es SIEMPRE /municipio/comunidad/servicio, sin sufijos.
        page_path = f"/{mun}/{slug}/{page['path']}"
        # El del funnel es administrativo y NO puede ser igual al del step: GHL
        # lo ve como conflicto y le pega números al publicado
        # (`/carolina/isla-verde/sellado-de-techo-811950`). Se deja en
        # `/municipio/comunidad-<servicio>`, que es determinista y nunca choca.
        funnel_path = f"/{mun}/{slug}-{page['kind']}"
        log(f"   -- {sufijo}")

        existing = funnel_by_name(funnel_name)
        if existing:
            fid = existing["_id"]
            log(f"      ya existe {fid} · se reutiliza")
        else:
            fid = clone_funnel(pg, funnel_name)
            log(f"      clonado {fid} ({time.time()-t0:.0f}s)")

        nombre = PAGE_NAME[page["kind"]]
        servicio = SERVICIO[page["kind"]]
        esperada = f"{SITE}{page_path}"
        steps = steps_map(funnel_name, [nombre], fid=fid)
        if not steps:
            raise RuntimeError(
                f"{sufijo}: el funnel {fid} ({funnel_name}) no tiene steps en la API; "
                f"hay un clon vacío con ese nombre, revísalo en Sites → Funnels")
        sid = steps.get(nombre) or next(iter(steps.values()))

        # Reanudación barata: si la página viva ya sirve este contenido, no se
        # reescriben Settings, path ni embed (cada uno cuesta 1-2 min y un
        # proceso cortado a los 4 min nunca llegaría a la imagen social ni al
        # gate, que es justo lo que falta).
        ya_viva = publicada_con(page["url"], data["community"], servicio, 12)
        if ya_viva:
            log("      la página viva ya trae este contenido: path y embed se saltan")
            bf = None

        # Settings se completa siempre: una página puede estar viva con su
        # contenido y el funnel seguir sin chat ni favicon, y eso lo caza el gate
        # (loiza/brisas-de-loiza dio `chat` en rojo el 2026-11-05 por saltarlo).
        if settings_vivos(page["url"]):
            log("      settings ya están en el funnel (la URL viva trae GTM, favicon y chat): se saltan")
        else:
            set_settings(pg, fid, funnel_name, funnel_path)
            if not domain_id(fid):
                raise RuntimeError(f"{sufijo} sin dominio enlazado (domainId vacío): el publish no daría URL")
            log(f"      settings (dominio, path, favicon, head, body, chat) ok ({time.time()-t0:.0f}s)")

        if not ya_viva:
            # ORDEN CRÍTICO: primero el Path del funnel, después el de la página.
            # Al revés GHL avisa "Some paths are updated due to url conflicts" y
            # reescribe la URL de la página.
            real = set_step_path(pg, fid, sid, nombre, page_path)
            if real != page_path:
                log(f"      GHL ajustó el path ({real}) → se reescribe")
                real = set_step_path(pg, fid, sid, nombre, page_path)
            if real != page_path:
                raise RuntimeError(
                    f"Path de {sufijo} quedó en {real}, se esperaba {page_path} "
                    f"(¿el path del funnel choca con el del step?)")
            log(f"      página → {page_path} ({time.time()-t0:.0f}s)")

            bf = open_builder(pg, fid, sid)
            inject_embed(pg, bf, page["html"])
            set_seo(pg, bf, page["seo"], canonical=page.get("canonical") or page["url"])
            log(f"      embed+seo listos ({time.time()-t0:.0f}s)")
            url = save_publish(pg, bf)
            if esperada not in url:
                raise RuntimeError(f"publish dejó {url or '(URL vacía)'}, se esperaba {esperada}")
            log(f"      publicada {url} ({time.time()-t0:.0f}s)")

            # La URL no basta: si la página viva sigue mostrando la plantilla, el
            # publish tomó el snapshot anterior. Se comprueba el contenido y, si no
            # está, se vuelve a publicar antes de sacar la imagen social (que sale
            # de la página viva).
            if not publicada_con(page["url"], data["community"], servicio, 240):
                log("      la página viva no muestra aún esta comunidad → se republica")
                bf = builder_frame(pg) or bf
                bf.click("#pg-funnel-builder__btn--publish")
                pg.wait_for_timeout(20000)
                if not publicada_con(page["url"], data["community"], servicio, 240):
                    raise RuntimeError(f"{sufijo}: la página viva sigue mostrando la plantilla "
                                       f"(se esperaba '{data['community']}' en el H1)")

        # Imagen social: screenshot de ESTA página viva, 1200x630, sin scrollbar.
        shot = SHOTS / f"og-{mun}-{slug}-{page['kind']}.png"
        og_screenshot(pg, page["url"], shot)
        page["seo"]["image"] = upload_media(shot)
        log(f"      og {page['seo']['image']} ({time.time()-t0:.0f}s)")
        # Se persiste YA: si el run muere después (tab cerrado, etc.) el payload
        # queda con la imagen que realmente se subió y la auditoría no marca un
        # fallo falso por comparar contra un JSON viejo.
        guardar_payload(payload_path, data)
        # El builder quedó intacto (el screenshot fue en su propia pestaña):
        # solo se reabre si su frame ya no responde, en vez de pagar ~40 s de
        # overview + Edit + builder por cada página.
        bf = open_builder(pg, fid, sid)
        set_seo(pg, bf, page["seo"], page["seo"]["image"],
                canonical=page.get("canonical") or page["url"])
        url = save_publish(pg, bf)
        if esperada not in url:
            raise RuntimeError(f"publish (og) dejó {url or '(URL vacía)'}, se esperaba {esperada}")
        log(f"      republicada con og ({time.time()-t0:.0f}s)")

        # El og:image se publica tarde y a veces no entra en el primer intento:
        # se exige verlo en la página viva y, si no está, se repite SEO+publish.
        if not og_publicada(page["url"], page["seo"].get("image"), 240):
            log("      el og:image no está en la página viva → se repite SEO y publish")
            bf = open_builder(pg, fid, sid)
            set_seo(pg, bf, page["seo"], page["seo"].get("image"),
                    canonical=page.get("canonical") or page["url"])
            save_publish(pg, bf)
            if not og_publicada(page["url"], page["seo"].get("image"), 240):
                raise RuntimeError(f"{sufijo}: el og:image de la página viva no es el de su "
                                   f"screenshot ({page['seo'].get('image')})")
            log("      og:image correcto tras reintento")

        for vuelta in (1, 2):
            checks = gate(page, data["community"])
            checks.update(gate_movil(pg, page["url"]))
            malos = [k for k, v in checks.items() if not v]
            if not malos:
                break
            # El publish acaba de ocurrir: la primera lectura puede ser la copia
            # vieja del CDN. Se espera y se vuelve a medir antes de dar por
            # fallada la página.
            log(f"      gate {sufijo} vuelta {vuelta}: FALLA {','.join(malos)}")
            if vuelta == 1:
                pg.wait_for_timeout(25000)
        log(f"      gate {sufijo}: {'OK' if not malos else 'FALLA ' + ','.join(malos)} ({time.time()-t0:.0f}s)")
        if malos:
            problemas.append(f"{sufijo}: {','.join(malos)}")

    payload_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    elapsed = time.time() - t0
    log(f"   total {elapsed/60:.1f} min")
    if problemas:
        raise RuntimeError(f"{key} no pasó el gate → {'; '.join(problemas)}")

    # Con --servicio no se puede dar la comunidad por publicada solo porque su
    # página haya pasado el gate: el ledger exige las dos. Si la hermana no
    # está viva, se falla la comunidad para que siga en `pendiente`.
    if servicio:
        otra = next((p for p in data["pages"] if p["kind"] != servicio), None)
        if otra and not publicada_con(otra["url"], data["community"],
                                      SERVICIO[otra["kind"]], 30):
            raise RuntimeError(
                f"{key}: falta la página {otra['kind']} (el ledger sigue en pendiente)")
    return elapsed


def guardar_payload(payload_path, data):
    payload_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def con_candado(ruta, timeout=180, abandonado=300):
    """Candado exclusivo entre procesos (el ledger lo escriben los carriles).

    Un carril que muere de golpe a mitad de la escritura deja el candado puesto.
    Si el archivo es viejo se considera abandonado y se retira, en vez de
    bloquear a los demás carriles durante toda la ronda.
    """
    fin = time.time() + timeout
    while time.time() < fin:
        try:
            with ruta.open("x"):            # modo "x": falla si ya existe
                return True
        except FileExistsError:
            try:
                if time.time() - ruta.stat().st_mtime > abandonado:
                    ruta.unlink()
                    log("   candado del ledger abandonado: se retira")
                    continue
            except OSError:
                pass
            time.sleep(0.4)
        except OSError:
            return False
    return False


def actualizar_ledger(keys_ok):
    """Lee-modifica-escribe con candado y reemplazo atómico.

    Sin esto, dos carriles que lean el índice a la vez se pisan: el segundo
    escribe una lista sin las comunidades que el primero acababa de anotar y el
    lote las vuelve a publicar en la ronda siguiente.
    """
    idx_path = ROOT / "data" / "ghl" / "index.json"
    candado = idx_path.with_name("index.lock")
    if not con_candado(candado):
        log("   aviso: sin candado del ledger; se escribe igual")
    try:
        idx = json.loads(idx_path.read_text(encoding="utf-8"))
        hechos = set(keys_ok)
        for f in idx["funnels"]:
            clave = f"{f['municipalitySlug']}/{f['slug']}"
            if clave not in hechos:
                continue
            # `publicado` = SUS DOS páginas sirven su contenido AHORA, no "el gate
            # pasó una vez": el 2026-11-05 la limpieza de luquillo/brisas-del-mar
            # quedó en 404 minutos después del publish y el ledger la dio por
            # buena, así que ni el supervisor ni el driver volvían a mirarla.
            muertas = [p.get("kind", "?") for p in f.get("pages", [])
                       if not publicada_con(p.get("url", ""), f.get("community", ""),
                                            SERVICIO.get(p.get("kind"), ""), 30)]
            if muertas:
                log(f"   ledger: {clave} NO se marca publicada (sin servir: "
                    f"{', '.join(muertas)}) → sigue pendiente")
                continue
            f["status"] = "publicado"
            f["publishedAt"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        tmp = idx_path.with_name(f".index.{time.time_ns()}.tmp")
        tmp.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        tmp.replace(idx_path)
    finally:
        try:
            candado.unlink()
        except OSError:
            pass


def pestana_del_carril(ctx, carril, fresco=False):
    """Devuelve la pestaña de trabajo del carril, reutilizándola.

    `AGENTS.md` prohíbe cerrar la pestaña del propietario, así que no se cierra
    al terminar: se guarda su `targetId` en `.tmp-carril-N.pestana` y la corrida
    siguiente la retoma. Antes cada corrida abría una nueva y cada corte la dejaba
    colgada; con 24 acumuladas (96 targets) Playwright dejó de enlazar al browser
    y el verificador pareció fallar en páginas que estaban bien (2026-11-06).
    """
    registro = ROOT / f".tmp-carril-{carril}.pestana"
    try:
        querido = registro.read_text(encoding="ascii").strip()
    except Exception:                              # noqa: BLE001
        querido = ""
    if querido and not fresco and querido not in pestanas_ajenas(carril):
        for pg in ctx.pages:
            try:
                ses = ctx.new_cdp_session(pg)
                tid = ses.send("Target.getTargetInfo")["targetInfo"]["targetId"]
                ses.detach()
            except Exception:                      # noqa: BLE001
                continue
            if tid == querido:
                log(f"   carril {carril}: reusa su pestaña ({tid[:8]})")
                return pg
    pg = ctx.new_page()
    try:
        ses = ctx.new_cdp_session(pg)
        registro.write_text(ses.send("Target.getTargetInfo")["targetInfo"]["targetId"],
                            encoding="ascii")
        ses.detach()
    except Exception:                              # noqa: BLE001
        pass
    return pg


def pestanas_ajenas(carril):
    """`targetId`s que otro proceso del lote está usando.

    Compartir pestaña con el auditor hace que una navegación interrumpa a la
    otra: `Navigation ... is interrupted by another navigation` (2026-11-06,
    10:03: el auditor de c0 tenía la pestaña registrada por el carril 1). La
    propia ficha del carril NO cuenta como ajena.
    """
    ids = set()
    propia = f".tmp-carril-{carril}.pestana"
    for f in ROOT.glob(".tmp-auditor*.pestana"):
        try:
            ids.add(f.read_text(encoding="ascii").strip())
        except Exception:                      # noqa: BLE001
            pass
    for f in ROOT.glob(".tmp-carril-*.pestana"):
        if f.name == propia:
            continue
        try:
            ids.add(f.read_text(encoding="ascii").strip())
        except Exception:                      # noqa: BLE001
            pass
    ids.discard("")
    return ids


def es_caida_driver(exc):
    """El CDP de Chromium se corta de vez en cuando a mitad de tanda.

    Playwright lanza entonces `Connection closed while reading from the driver`
    o `TargetClosedError`: la pestaña muere y, antes, el carril entero se
    quedaba sin hacer el resto de su lista (ronda 04: se perdieron ~59
    comunidades entre los carriles 0 y 1). Estos fallos se reintentan una vez
    con pestaña nueva en lugar de dar la comunidad por perdida.
    """
    txt = str(exc).lower()
    return any(s in txt for s in (
        "connection closed", "target closed", "has been closed",
        "target page, context or browser has been closed",
        "browser has been closed",
    ))


def main():
    global PIT
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", action="append", default=[])
    ap.add_argument("--list")
    ap.add_argument("--start", type=int, default=0)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--force", action="store_true",
                    help="republica aunque el ledger marque la comunidad como publicada")
    ap.add_argument("--servicio", choices=["techos", "limpieza"], default=None,
                    help="publica solo esa página de la comunidad (tandas cortas)")
    ap.add_argument("--carril", type=int, default=-1,
                    help="carril paralelo (>=0): abre su propia pestaña y usa candado de ledger")
    ap.add_argument("--pestana-nueva", action="store_true",
                    help="abre pestaña nueva: la registrada se quedó trabada (GHL en blanco)")
    ap.add_argument("--sin-chat", action="store_true",
                    help="deja el widget de chat en none (no lo configura ni lo exige el gate)")
    args = ap.parse_args()
    global SIN_CHAT
    SIN_CHAT = args.sin_chat

    # --only acepta "mun/com" repetido o una lista separada por comas,
    # igual que preparar-funnel-ghl.mjs.
    keys = [k.strip() for v in args.only for k in str(v).split(",") if k.strip()]
    if args.list:
        keys += [l.strip() for l in pathlib.Path(args.list).read_text(encoding="utf-8").splitlines() if l.strip()]
    if not keys:
        raise SystemExit("Nada que hacer: usa --only o --list")
    keys = keys[args.start:]

    # Idempotencia: lo que ya pasó el gate no se vuelve a tocar.
    idx = json.loads((ROOT / "data" / "ghl" / "index.json").read_text(encoding="utf-8"))
    hechos_antes = {f"{f['municipalitySlug']}/{f['slug']}" for f in idx["funnels"]
                    if f.get("status") == "publicado"}
    if args.force:
        # Republicar: el payload cambió (hero propio recién subido) y la
        # página servida sigue con el embebido viejo.
        hechos_antes = set()
    pendientes = [k for k in keys if k not in hechos_antes]
    if len(pendientes) != len(keys):
        log(f"Ya publicadas y verificadas: {len(keys) - len(pendientes)} · pendientes: {len(pendientes)}")
    # El límite se aplica DESPUÉS de descartar lo ya publicado: --limit 3
    # significa "3 comunidades nuevas". Al revés, una cola cuya cabeza ya está
    # hecha devolvía una tanda vacía y se perdía el turno.
    if args.limit:
        pendientes = pendientes[:args.limit]
    keys = pendientes
    if not keys:
        log("Nada pendiente en la cola.")
        return

    PIT = token()
    hechos = []
    fallos = []
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        ctx = browser.contexts[0]
        # GHL usa alert/confirm nativos (avisos de conflicto de paths, betas).
        # Se anulan en el origen: con solo el handler, el driver moría con
        # "No dialog is showing" cuando el aviso se cerraba solo.
        ctx.add_init_script("window.alert=function(){};window.confirm=function(){return true;};")
        if args.carril >= 0:
            # Cada carril tiene su pestaña (dos drivers sobre la misma se roban
            # los selectores y producen ERR_ABORTED, tanda 12) y la REUSA: la
            # pestaña no se cierra al terminar, se retoma en la corrida siguiente.
            pg = pestana_del_carril(ctx, args.carril, fresco=args.pestana_nueva)
        else:
            pg = next((x for x in ctx.pages if "gohighlevel" in x.url), None) or ctx.new_page()

        # DIÁLOGOS: sin handler a propósito. El handler que había aquí llamaba a
        # `d.accept()` y, cuando GHL ya había cerrado el aviso solo, Playwright
        # lanzaba `ProtocolError: No dialog is showing` DENTRO del proceso node.
        # Ese error no lo puede atrapar Python y tumba el driver: mueren todas
        # las pestañas del navegador, porque los carriles comparten el mismo
        # Chrome por CDP. Fue la causa real de que cayeran los carriles 0 y 1
        # juntos, del carril 2 a las 09:49 y de los carriles 4 y 5 a las 17:50.
        # El init_script de arriba anula alert/confirm en el origen y Playwright
        # descarta solo (sin listener) cualquier diálogo nativo que aparezca.
        for i, key in enumerate(keys, 1):
            log(f"\n[{i}/{len(keys)}] {key}")
            try:
                saltar_aviso_pago(pg)
                build(pg, key, args.servicio)
                hechos.append(key)
                actualizar_ledger(hechos)
            except Exception as exc:            # noqa: BLE001
                # Antes esto hacía `break`: una sola página con el builder
                # lento mataba el resto de la tanda. Ahora se anota, se sigue
                # con la siguiente comunidad y se sale con 1 al final.
                if es_caida_driver(exc):
                    log(f"   driver caído en {key}: {exc} → pestaña nueva")
                    try:
                        pg = (pestana_del_carril(ctx, args.carril, fresco=True) if args.carril >= 0
                              else ctx.new_page())
                        saltar_aviso_pago(pg)
                        build(pg, key, args.servicio)
                        hechos.append(key)
                        actualizar_ledger(hechos)
                        continue
                    except Exception as exc2:   # noqa: BLE001
                        log(f"   FALLA {key} tras reintento: {exc2}")
                        fallos.append(key)
                        continue
                log(f"   FALLA {key}: {exc}")
                fallos.append(key)
                pg.wait_for_timeout(2000)
        # La pestaña se queda abierta y registrada para la próxima corrida:
        # `AGENTS.md` prohíbe cerrarla (y cerrar la última apaga Chrome).
    log(f"\nPublicadas y verificadas: {len(hechos)}")
    if fallos:
        log("Fallidas: " + ", ".join(fallos))
        raise SystemExit(1)


if __name__ == "__main__":
    main()
