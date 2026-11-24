"""Genera la imagen de cada comunidad en la interfaz de ChatGPT del navegador
real del usuario (Chrome con --remote-debugging-port=9222) y la guarda en
"Ilatek/comunidades imagenes" con el nombre de la comunidad.

    python scripts/imagenes/chatgpt-ui.py --limite 3
    python scripts/imagenes/chatgpt-ui.py --slugs la-granja,the-isles
    python scripts/imagenes/chatgpt-ui.py --limite 10 --espera 25

Reglas:
- Si la sesión de ChatGPT no está iniciada, no hace nada: no tiene sentido
  pegar prompts en una pantalla de login.
- No cierra la pestaña ni la ventana: reutiliza la pestaña de ChatGPT que ya
  esté abierta y la deja abierta al terminar, para que el propietario vea el
  progreso y pueda seguir desde ahí.
- Se salta las imágenes que ya existen, para poder cortar y reanudar.
- Guarda el original y una versión 16:9 recortada (no reescalada: inventar
  píxeles hasta 4K sería mentir sobre la resolución real).
- Comparte cola y manifiesto con el lote de Flow: el mismo orden (pares a
  medias primero), el mismo `imagenes-flow.json` y el mismo recorte. Así puede
  relevar a Flow a mitad de la corrida sin repetir trabajo ni dejar una
  comunidad con una sola de sus dos imágenes.
"""
import argparse
import base64
import json
import pathlib
import re
import sys
import time

from playwright.sync_api import sync_playwright

import flow_estado
import flow_plan

AQUI = pathlib.Path(__file__).resolve().parent
COMUNIDADES = AQUI.parent.parent
SALIDA = COMUNIDADES.parent / "comunidades imagenes"
PROMPTS = AQUI / "prompts.json"
MANIFIESTO = AQUI / "imagenes-flow.json"

# El aviso de la cuenta sin generaciones disponibles; cambia de redacción, así
# que se busca por las dos partes que siempre aparecen juntas.
LIMITE_IMAGENES = re.compile(r"limit for image generation|image generation.{0,24}limit", re.I)

# El orquestador decide por lo que lee de esta salida: sin UTF-8 explícito, en
# Windows los acentos salen en la página de códigos local y la frase de sesión
# perdida no se reconoce.
sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def conectar():
    pw = sync_playwright().start()
    navegador = pw.chromium.connect_over_cdp("http://127.0.0.1:9222")
    contexto = navegador.contexts[0]
    # Reutiliza la pestaña de ChatGPT si ya está abierta; si no, abre una y la
    # deja abierta. Nunca se cierra la ventana del propietario.
    pagina = next((p for p in contexto.pages if "chatgpt.com" in p.url), None)
    if pagina is None:
        pagina = contexto.new_page()
    pagina.bring_to_front()
    if "chatgpt.com" not in pagina.url:
        pagina.goto("https://chatgpt.com/", wait_until="domcontentloaded", timeout=90000)
    return pw, contexto, pagina


def sesion_activa(pagina):
    """¿Hay sesión? Lo dice el menú de perfil, no una frase suelta.

    Espera al compositor en vez de a un tiempo fijo: una pestaña recién abierta
    tarda más de seis segundos en pintarlo, y entonces el lote se declaraba sin
    sesión con la sesión abierta. Buscar «log in» en el texto tampoco servía:
    esa frase aparece en conversaciones y en el pie de la página pública.
    """
    try:
        pagina.wait_for_selector('#prompt-textarea, div[contenteditable="true"]', timeout=30000)
    except Exception:
        return False
    return pagina.get_by_label(re.compile(r"perfil|profile", re.I)).count() > 0


def nueva_conversacion(pagina):
    pagina.goto("https://chatgpt.com/", wait_until="domcontentloaded", timeout=90000)
    pagina.wait_for_timeout(2500)


def imagenes_de(pagina):
    """Las URL de las imágenes grandes que ya hay en la conversación."""
    return set(pagina.evaluate(
        """() => [...document.querySelectorAll('img')]
             .filter(i => i.naturalWidth > 400)
             .filter(i => /oaiusercontent|estuary|blob:/.test(i.src) || /image/i.test(i.alt || ''))
             .map(i => i.src)"""
    ))


def enviar(pagina, prompt):
    """Escribe el prompt por la vía de entrada real y lo envía.

    `type` teclea carácter a carácter: con prompts de mil y pico caracteres el
    campo se queda a medias o se desincroniza. `insert_text` entra de una vez y
    dispara el evento que la interfaz escucha.
    """
    caja = pagina.locator('#prompt-textarea, div[contenteditable="true"]').first
    caja.click(timeout=30000)
    pagina.keyboard.insert_text(prompt)
    pagina.wait_for_timeout(800)
    pagina.keyboard.press("Enter")


def esperar_imagen(pagina, antes=(), segundos=240):
    """Devuelve la URL de la imagen nueva, o None si no aparece.

    Se descartan las imágenes que ya estaban antes de enviar: si la conversación
    no se reinició del todo, la foto de la comunidad anterior seguía en el DOM y
    se guardaba con el nombre de la siguiente.

    Si ChatGPT avisa de que la cuenta llegó a su límite de imágenes, se corta
    aquí: seguir esperando cuatro minutos por imagen solo alarga el mismo final
    y el orquestador necesita el aviso para no cambiar de motor en círculos.
    """
    limite = time.time() + segundos
    while time.time() < limite:
        texto = pagina.evaluate("() => document.body.innerText || ''")
        if LIMITE_IMAGENES.search(texto):
            raise RuntimeError("CUOTA AGOTADA: ChatGPT llegó a su límite de imágenes")
        url = pagina.evaluate(
            """(previas) => {
              const imgs = [...document.querySelectorAll('img')]
                .filter(i => i.naturalWidth > 400)
                .filter(i => !previas.includes(i.src))
                .filter(i => /oaiusercontent|estuary|blob:/.test(i.src) || /image/i.test(i.alt || ''));
              if (!imgs.length) return null;
              imgs.sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight));
              return imgs[0].src;
            }""",
            list(antes),
        )
        if url:
            return url
        pagina.wait_for_timeout(2500)
    return None


def descargar(contexto, pagina, url):
    # ChatGPT entrega las imágenes como blob: del mismo origen. No se pueden
    # pedir con request.get, así que se leen dentro de la página y se pasan en
    # base64.
    if url.startswith("blob:") or url.startswith("data:"):
        b64 = pagina.evaluate(
            """async (u) => {
              const r = await fetch(u);
              const bytes = new Uint8Array(await r.arrayBuffer());
              let bin = '';
              const trozo = 0x8000;
              for (let i = 0; i < bytes.length; i += trozo) {
                bin += String.fromCharCode.apply(null, bytes.subarray(i, i + trozo));
              }
              return btoa(bin);
            }""",
            url,
        )
        return base64.b64decode(b64)
    r = contexto.request.get(url, timeout=120000)
    if not r.ok:
        raise RuntimeError(f"descarga HTTP {r.status}")
    return r.body()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limite", type=int, default=3)
    ap.add_argument("--slugs", default="")
    ap.add_argument("--tier", default="")
    ap.add_argument("--espera", type=int, default=20, help="segundos entre comunidades")
    args = ap.parse_args()

    prompts = json.loads(PROMPTS.read_text(encoding="utf8"))
    pedidos = [p for p in prompts if not args.tier or p["priority"] == args.tier]
    if args.slugs:
        queridos = {s.strip() for s in args.slugs.split(",")}
        pedidos = [p for p in pedidos if p["slug"] in queridos]

    SALIDA.mkdir(parents=True, exist_ok=True)
    # Misma cola que el lote de Flow: pares a medias delante y, de paso, nada
    # que ya esté en disco. Al relevar a Flow no repite ni deja comunidades
    # empezadas a la mitad.
    pendientes = [p for p, _ in flow_plan.construir_cola(prompts, pedidos, SALIDA)[: args.limite]]
    if not pendientes:
        print("Nada pendiente con ese filtro.")
        return 0

    pw, contexto, pagina = conectar()
    try:
        if not sesion_activa(pagina):
            print("ChatGPT no tiene sesión iniciada en este navegador: no se genera nada.")
            print("Inicia sesión en la ventana de Chrome que está abierta y vuelve a ejecutar.")
            return 2

        for i, p in enumerate(pendientes, 1):
            etiqueta = f"{i}/{len(pendientes)} {p['name']} ({p['municipality']})"
            try:
                nueva_conversacion(pagina)
                # En la interfaz hay que pedir la imagen de forma explícita; el
                # prompt de la API ya describe la escena, pero aquí el modelo
                # necesita saber que debe renderizarla.
                antes = imagenes_de(pagina)
                enviar(pagina, "Genera esta imagen (sin texto ni logos): " + p["prompt"])
                url = esperar_imagen(pagina, antes)
                if not url:
                    raise RuntimeError("no apareció ninguna imagen generada")
                datos = descargar(contexto, pagina, url)
                if not datos:
                    raise RuntimeError("la imagen llegó vacía")
                recortada, tam = flow_estado.a_16_9(datos)
                flow_estado.guardar_png(SALIDA, p["archivo"], recortada)
                print(f"{etiqueta} -> {p['archivo']} ({tam[0]}x{tam[1]})")
            except Exception as e:
                print(f"{etiqueta} -> ERROR: {e}")
            finally:
                # El manifiesto se rehace desde el disco: describe lo que existe,
                # venga de Flow o de aquí.
                flow_estado.guardar_manifiesto(prompts, SALIDA, MANIFIESTO)
                time.sleep(args.espera)
    finally:
        # Solo se suelta el enlace de depuración: la pestaña y la ventana del
        # propietario se quedan abiertas.
        pw.stop()

    print(f"\nCarpeta: {SALIDA}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
