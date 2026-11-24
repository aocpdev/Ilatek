"""Hablar con Google Flow en el Chrome del propietario (CDP 9222).

Aquí vive toda la fragilidad de la interfaz: la pestaña que se descarta, el
campo contenteditable que se re-renderiza y la cuadrícula que tarda en pintar.
Nada de este módulo sabe qué comunidades hay ni dónde se guardan.
"""
import base64
import re
import time

from playwright.sync_api import sync_playwright

# Chrome cierra, descarta o mata el renderizador de la pestaña y Playwright lo
# ve como un target cerrado. Todos los mensajes de esa familia comparten esto.
CAIDA = "has been closed"

# Aviso de cuota agotada del agente. Sin esto, una cuenta sin cuota repetía
# «no apareció ninguna imagen nueva» cada cuatro minutos sin decir por qué.
CUOTA = re.compile(r"l[ií]mite de cuota|quota limit|reached your .{0,24}quota", re.I)


class CuotaAgotada(RuntimeError):
    """Flow no genera más con esta cuenta: reintentar no sirve de nada."""


class SinImagen(RuntimeError):
    """Flow aceptó el prompt y no devolvió imagen, sin avisar de cuota.

    Es la otra cara del mismo límite: la cuenta queda seca pero la interfaz no
    pinta el aviso. Se trata igual que la cuota —cambiar de cuenta— porque
    reintentar contra la misma solo gasta cuatro minutos por comunidad.
    """


def cerrada(exc):
    """¿El error fue que Chrome se llevó la pestaña, el contexto o el navegador?"""
    return CAIDA in str(exc) or "Target closed" in str(exc)


class Sesion:
    """El Chrome del propietario y la pestaña del proyecto, vivos.

    Chrome descarta pestañas inactivas (ahorro de memoria) y a veces el
    renderizador se cae. Antes, cuando eso pasaba, la tanda seguía enviando
    prompts a una pestaña muerta hasta el final. Aquí se vuelve a conectar al
    mismo Chrome —sin cerrarlo, sin reiniciarlo y sin tocar la sesión de la
    cuenta— y se reabre la misma pestaña del proyecto.
    """

    def __init__(self, puerto=9222, cual=0):
        self.puerto = puerto
        # Con dos workers, cada uno manda en SU pestaña de Flow: compartir la
        # misma pestaña haría que uno leyera el mosaico del otro y guardara la
        # imagen de una comunidad con el nombre de otra.
        self.cual = cual
        self.pw = None
        self.contexto = None
        self.pg = None
        self.url = ""

    def conectar(self):
        """(Re)conecta por CDP y elige la pestaña de Flow que ya esté abierta."""
        if self.pw is not None:
            try:
                self.pw.stop()
            except Exception:
                pass
        self.pw = sync_playwright().start()
        navegador = self.pw.chromium.connect_over_cdp(f"http://127.0.0.1:{self.puerto}")
        self.contexto = navegador.contexts[0]
        paginas = [p for p in self.contexto.pages if "flow.google.com" in p.url]
        self.pg = paginas[self.cual] if len(paginas) > self.cual else None
        if self.pg is None:
            self.pg = self.contexto.new_page()
        return self.pg

    def viva(self):
        """La pestaña del proyecto, usable; la reabre si Chrome la tiró."""
        pg = self.pg
        try:
            viva = pg is not None and not pg.is_closed()
        except Exception:
            viva = False
        if not viva:
            try:
                pg = self.contexto.new_page()
            except Exception:
                # Se cayó la pestaña, el contexto o el navegador entero.
                self.conectar()
                pg = self.pg
            self.pg = pg
        # Una pestaña en primer plano no la descarta el ahorro de memoria.
        pg.bring_to_front()
        if "flow.google.com" not in pg.url:
            pg.goto(self.url or "https://flow.google.com/", wait_until="domcontentloaded", timeout=90000)
            pg.wait_for_timeout(8000)
        return pg

    def parar(self):
        """Suelta CDP: la ventana y la pestaña del propietario siguen abiertas."""
        if self.pw is not None:
            try:
                self.pw.stop()
            except Exception:
                pass
            self.pw = None


def abrir_proyecto(pg, authuser=""):
    """Deja la pestaña en el editor de un proyecto de Flow.

    `authuser` fija el índice de la cuenta de Google (?authuser=N). Sin él,
    cualquier navegación devuelve Flow a la cuenta por defecto del navegador y
    las generaciones se cobran a una cuenta distinta de la pedida.
    """
    pg.bring_to_front()
    consulta = f"?authuser={authuser}" if authuser else ""
    # La cuenta con varias sesiones abre en /u/2/project/...; comparar contra
    # "flow.google.com/project" no lo reconocía y cada reanudación creaba un
    # proyecto nuevo en vez de seguir en el que estaba abierto.
    if "/project/" not in pg.url:
        pg.goto(f"https://flow.google.com/{consulta}", wait_until="domcontentloaded", timeout=90000)
        pg.wait_for_timeout(8000)
        boton = pg.get_by_text("Proyecto nuevo", exact=False).first
        try:
            boton.click(timeout=20000)
        except Exception:
            # La ventana del dueño puede ser pequeña y el botón queda fuera del
            # viewport: se pulsa por JS, que no exige tenerlo a la vista.
            boton.evaluate("el => ((el.closest('button') || el)).click()")
            pg.wait_for_timeout(3000)
            if "/project/" not in pg.url:
                raise
        pg.wait_for_timeout(9000)
    pg.keyboard.press("Escape")
    return pg.url



def cuenta(pg):
    """Etiqueta de la cuenta de Google que Flow tiene delante.

    Chrome la pinta en el botón de la cuenta; el correo va dentro del
    aria-label, así que sirve para saber a quién se le está cobrando la imagen.
    """
    try:
        etiqueta = pg.evaluate(
            "() => { const e = document.querySelector('[aria-label*=\"Cuenta de Google\"]');"
            " return e ? (e.getAttribute('aria-label') || '') : ''; }")
    except Exception:
        return ""
    return " ".join(str(etiqueta).split())


def cambiar_cuenta(pg, correo, indices=6):
    """Pone Flow en otra cuenta de Google que ya tenga sesión en Chrome.

    No escribe contraseñas: recorre ?authuser=N, que es como Chrome elige entre
    las sesiones ya abiertas, y comprueba la etiqueta de la cuenta. Devuelve el
    índice usado, -2 si su hueco está sin sesión (Google pide entrar) o None si
    no hay ninguna sesión abierta que corresponda.
    """
    for i in range(indices):
        try:
            pg.goto(f"https://flow.google.com/?authuser={i}",
                    wait_until="domcontentloaded", timeout=90000)
            pg.wait_for_timeout(6000)
        except Exception:
            continue
        if correo.lower() in cuenta(pg).lower():
            return i
        if en_login(pg):
            # Ese hueco de cuenta existe pero está sin sesión: Chrome manda al
            # inicio de sesión. Se devuelve para que quien llama espere ahí.
            return -2
    return None



def en_login(pg):
    """¿La pestaña está en el inicio de sesión de Google?"""
    try:
        return "accounts.google.com" in pg.url
    except Exception:
        return False


def esperar_sesion(pg, minutos=20):
    """Espera a que el dueño termine de iniciar sesión en la pestaña.

    Chrome no deja escribir la contraseña desde aquí, así que cuando aparece el
    selector de cuenta se deja la pestaña abierta y se espera: en cuanto el
    dueño entra, Flow vuelve y el lote sigue con esa cuenta, sin relanzar nada.
    """
    fin = time.time() + minutos * 60
    while time.time() < fin:
        if not en_login(pg):
            pg.wait_for_timeout(4000)
            return True
        pg.wait_for_timeout(5000)
    return False



def indice_de_cuenta(pg):
    """El N de /u/N/ de la cuenta en la que está la pestaña ('' si no hay)."""
    m = re.search(r"/u/(\d+)/", pg.url or "")
    return m.group(1) if m else ""


def imagenes(pg):
    """Devuelve cada imagen del mosaico con el texto de su tarjeta.

    El texto de la tarjeta es el prompt que se envió, así que permite saber a
    qué comunidad pertenece cada imagen: si dos tandas coinciden, la que se
    guarda es la del prompt pedido y no simplemente la primera nueva.
    """
    return pg.evaluate(
        """() => [...document.querySelectorAll('img')]
                          .filter(i => i.naturalWidth > 500 && i.naturalHeight > 300)
             // Flow cambió de CDN: las imágenes del mosaico pasaron de
             // /asb/ a flow-content.google/image/<uuid>. Se aceptan las dos.
             .filter(i => i.src.indexOf('/asb/') >= 0 || i.src.indexOf('flow-content.google/image/') >= 0)
             .map(i => {
               let n = i, t = '';
               for (let k = 0; k < 8 && n; k++) {
                 n = n.parentElement;
                 if (n && n.innerText && n.innerText.length > 40) { t = n.innerText; break; }
               }
               return {src: i.src, w: i.naturalWidth, h: i.naturalHeight, txt: t.slice(0, 2500)};
             })"""
    )


def asentar(pg, quieto=10, tope=180):
    """Espera a que el mosaico deje de cambiar.

    Cada envío puede devolver más de una variación, y la segunda llega después
    de que ya se guardó la primera. Sin esta espera, esa variación sobrante se
    confundiría con la imagen de la siguiente comunidad.
    """
    fin = time.time() + tope
    previo = None
    estable_desde = time.time()
    while time.time() < fin:
        actual = sorted(i["src"] for i in imagenes(pg))
        if actual != previo:
            previo, estable_desde = actual, time.time()
        elif time.time() - estable_desde >= quieto:
            return
        pg.wait_for_timeout(3000)


def preparar(pg):
    """Deja el campo de instrucciones a la vista y devuelve su control.

    Un panel lateral abierto —instrucciones del agente, detalles de la cuenta—
    esconde el campo y deshabilita el envío: el lote moría en la primera
    imagen sin poder escribir. Escape no cierra esos paneles, su botón sí; y
    si aun así queda tapado, se recarga la página (no el navegador) una vez.
    """
    caja = pg.locator('div[role="textbox"]').last
    for intento in range(2):
        for _ in range(3):
            if caja.is_visible():
                return caja
            pg.keyboard.press("Escape")
            pg.wait_for_timeout(600)
            # Acierta «Cerrar» y «Cerrar el panel de la cuenta», que son dos
            # botones distintos para el mismo gesto.
            cerrar = pg.get_by_label("Cerrar")
            for i in range(cerrar.count()):
                try:
                    if cerrar.nth(i).is_visible():
                        cerrar.nth(i).click(timeout=3000)
                except Exception:
                    pass
            pg.wait_for_timeout(600)
        if caja.is_visible():
            return caja
        if intento == 0:
            pg.reload(wait_until="domcontentloaded", timeout=90000)
            pg.wait_for_timeout(9000)
    # Un muro de cuota deja el campo tapado en vez de escribir el aviso en el
    # mosaico: sin esto, la cuenta seca se quedaba en «campo tapado» para
    # siempre y nunca se pasaba a la siguiente cuenta.
    aviso = aviso_cuota(pg)
    if aviso:
        raise CuotaAgotada(aviso)
    raise RuntimeError("el campo de instrucciones de Flow sigue tapado por un panel")


def escribir(pg, prompt):
    """Deja el prompt entero en el campo y lo comprueba.

    El campo es un contenteditable que Angular re-renderiza: escribir tecla a
    tecla mezcla los caracteres y `execCommand` puede dejar el texto en el DOM
    sin avisarle a Angular, que entonces envía un prompt vacío. `insert_text`
    entra por la vía de entrada real del navegador, que dispara el evento.
    """
    caja = pg.locator('div[role="textbox"]').last
    caja.click(timeout=20000)
    escrito = ""
    for _ in range(3):
        pg.keyboard.press("Control+a")
        pg.keyboard.press("Delete")
        pg.keyboard.insert_text(prompt)
        pg.wait_for_timeout(1200)
        escrito = caja.inner_text().strip()
        # Se comprueba principio y final: si el campo se cortó o se mezcló, el
        # final no aparece y se reintenta.
        if prompt.strip()[:80] in escrito and prompt.strip()[-60:] in escrito:
            return caja
    raise RuntimeError(
        f"el campo no retuvo el prompt (largo {len(escrito)} de {len(prompt)}; termina en: {escrito[-50:]!r})"
    )


def _en_marcha(pg):
    """¿Flow aceptó el envío? El campo se vacía y el botón pasa a «Detener»."""
    try:
        if pg.get_by_label("Detener generación").count():
            return True
        return not pg.locator('div[role="textbox"]').last.inner_text().strip()
    except Exception:
        return False


def enviar(pg, caja):
    """Envía el prompt y confirma que la tanda arrancó, o reintenta.

    Si el clic cae mientras Angular reconstruye el campo, no envía nada: la
    tanda se quedaba minutos esperando una imagen que nunca iba a llegar, y el
    intento siguiente repetía el mismo fallo silencioso.
    """
    for _ in range(3):
        try:
            boton = pg.get_by_label("Iniciar generación")
            if boton.count():
                boton.first.click(timeout=6000)
            else:
                caja.click(timeout=10000)
                pg.keyboard.press("Enter")
        except Exception:
            pass
        fin = time.time() + 20
        while time.time() < fin:
            if _en_marcha(pg):
                return
            pg.wait_for_timeout(1500)
    raise RuntimeError("Flow no arrancó la generación al enviar el prompt")


def esperar(pg, antes, pistas, segundos=180, prorroga=60):
    """Espera la imagen de esta tanda y devuelve su tarjeta, o None.

    La cuadrícula tarda, y cada envío devuelve dos variaciones: la segunda
    puede llegar después de que se guardó la primera. Mientras el mosaico siga
    creciendo hay tanda en curso y se sigue esperando —hasta un tope— en vez de
    dar la imagen por perdida.

    Se acepta la imagen cuya tarjeta nombre la comunidad y el pueblo. Flow a
    veces pinta la tarjeta sin texto —las variaciones nuevas llegan con la
    tarjeta vacía y así se quedan—, y exigirlo descartaba imágenes buenas: por
    eso, si el mosaico ya se asentó y hay imágenes nuevas sin texto, se toma la
    última. Un solo prompt está en vuelo a la vez, así que cualquier imagen que
    no estuviera en `antes` es de esta tanda.
    """
    inicio = time.time()
    limite = inicio + segundos
    vistas = {}
    previo = None
    estable_desde = None
    while time.time() < limite:
        pg.wait_for_timeout(6000)
        aviso = aviso_cuota(pg)
        if aviso:
            raise CuotaAgotada(aviso)
        actual = imagenes(pg)
        if sorted(i["src"] for i in actual) != previo:
            previo = sorted(i["src"] for i in actual)
            estable_desde = time.time()
        for im in actual:
            if im["src"] in antes:
                continue
            if im["src"] not in vistas:
                limite = min(inicio + segundos + prorroga, time.time() + prorroga)
            # Se refresca el texto: la tarjeta pinta después de la imagen.
            vistas[im["src"]] = im
        propias = [
            im for im in vistas.values()
            if pistas and all(x.lower() in im["txt"].lower() for x in pistas)
        ]
        if propias:
            return propias[0]
        if vistas and estable_desde and time.time() - estable_desde >= 24:
            # El mosaico pone lo nuevo arriba: la primera nueva del DOM es la de
            # esta tanda, no una variación que llegó tarde de la anterior.
            for im in actual:
                if im["src"] in vistas:
                    return im
    return None


def aviso_cuota(pg):
    """El aviso de cuota de Flow, si está en pantalla; '' si no."""
    try:
        texto = pg.evaluate("() => document.body.innerText || ''")
    except Exception:
        return ""
    m = CUOTA.search(texto)
    if not m:
        return ""
    return " ".join(texto[m.start(): m.end() + 130].split())


def detalle(pg):
    """Lo que Flow esté avisando, para que el registro diga por qué falló."""
    try:
        texto = pg.evaluate(
            """() => (document.body.innerText || '')
                 .split('\\n').map(s => s.trim()).filter(Boolean)
                 .filter(s => /(l[ií]mite|limit|cuota|quota|agotad|error|no se pudo|int[eé]ntalo)/i.test(s))
                 .slice(-2).join(' | ')"""
        )
    except Exception:
        return ""
    return f" — Flow dice: {texto[:200]}" if texto else ""


def generar(pg, prompt, antes, pistas=(), segundos=240):
    """Envía el prompt y devuelve la imagen nueva, o None si no aparece."""
    caja = escribir(pg, prompt)
    enviar(pg, caja)
    return esperar(pg, antes, pistas, segundos)


def bajar(pg, src):
    """Trae los bytes de la imagen desde la misma sesión, sin CORS de por medio."""
    try:
        b64 = pg.evaluate(
            """async (u) => {
              const r = await fetch(u);
              const bytes = new Uint8Array(await r.arrayBuffer());
              let bin = ''; const trozo = 0x8000;
              for (let i = 0; i < bytes.length; i += trozo) {
                bin += String.fromCharCode.apply(null, bytes.subarray(i, i + trozo));
              }
              return btoa(bin);
            }""",
            src,
        )
        return base64.b64decode(b64)
    except Exception:
        # flow-content.google no abre CORS al fetch de la pestaña; el contexto
        # de peticiones de Playwright pide los mismos bytes con la sesión viva.
        respuesta = pg.request.get(src, timeout=120000)
        if not respuesta.ok:
            raise RuntimeError(f"no se pudo bajar la imagen: HTTP {respuesta.status}")
        return respuesta.body()
