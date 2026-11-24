"""Genera la imagen de cada comunidad en Google Flow, dentro del Chrome real del
propietario (CDP 9222), y la guarda en "Ilatek/comunidades imagenes".

    python scripts/imagenes/flow-ui.py --limite 3
    python scripts/imagenes/flow-ui.py --slugs la-granja,the-isles
    python scripts/imagenes/flow-ui.py --limite 10 --espera 20
    python scripts/imagenes/flow-ui.py --autocomprobar

Qué hace y qué no:
- Reutiliza la pestaña del proyecto de Flow que ya esté abierta y NO la cierra.
- Compara las imágenes que hay en el mosaico antes y después de generar, para
  descargar solo la nueva (Flow deja las anteriores en la cuadrícula).
- Recorta a 16:9 exacto sin reescalar: Flow entrega 1376x768, y fingir 4K
  reescalando sería inventar resolución.
- Se salta las comunidades que ya tienen archivo, así que se puede reanudar.

Las piezas están repartidas por responsabilidad: `flow_plan` decide qué toca
generar, `flow_navegador` habla con la interfaz de Flow y `flow_estado` escribe
la imagen y el manifiesto. Este archivo solo las compone.
"""
import argparse
import json
import pathlib
import re
import socket
import sys
import time
import zlib

import flow_estado
import flow_navegador
import flow_plan

AQUI = pathlib.Path(__file__).resolve().parent
COMUNIDADES = AQUI.parent.parent
SALIDA = COMUNIDADES.parent / "comunidades imagenes"
PROMPTS = AQUI / "prompts.json"
MANIFIESTO = AQUI / "imagenes-flow.json"
CUENTAS = AQUI / "cuentas.json"
CUENTA_ACTIVA = AQUI / "cuenta-activa.json"

sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def generar_una(sesion, p, etiqueta, prompts):
    """Genera y guarda la imagen de una comunidad.

    Si Chrome se lleva la pestaña a mitad de la tanda, se reabre y se reintenta
    una vez: sin esto, un solo cierre arrastraba el resto del lote.
    """
    for intento in (0, 1):
        try:
            pg = sesion.viva()
            # Antes de fotografiar el mosaico: si hay un panel abierto se cierra
            # aquí, para que la recarga (si hiciera falta) no invalide «antes».
            flow_navegador.preparar(pg)
            # 6 s de mosaico quieto en vez de 10: la imagen ya esta
            # pintada y cada segundo aqui se paga en cada PNG.
            flow_navegador.asentar(pg, quieto=6)
            antes = {im["src"] for im in flow_navegador.imagenes(pg)}
            # Flow responde mejor en inglés, que es como están los prompts.
            nueva = flow_navegador.generar(
                pg, p["prompt"], antes, (p["name"], p["municipality"])
            )
            if not nueva:
                raise flow_navegador.SinImagen(
                    "no apareció ninguna imagen nueva en la cuadrícula"
                    + flow_navegador.detalle(pg)
                )
            datos = flow_navegador.bajar(pg, nueva["src"])
            recortada, tam = flow_estado.a_16_9(datos)
            flow_estado.guardar_png(SALIDA, p["archivo"], recortada)
            flow_estado.guardar_manifiesto(prompts, SALIDA, MANIFIESTO)
            print(f"{etiqueta} -> {p['archivo']} ({tam[0]}x{tam[1]})")
            return
        except Exception as e:
            if intento == 0 and flow_navegador.cerrada(e):
                print(f"{etiqueta} -> la pestaña de Flow se cerró; se reabre y se reintenta", flush=True)
                continue
            raise


def cargar_cuentas(desde_arg=""):
    """Orden en que se prueban las cuentas de Google cuando se agota la cuota.

    Manda `--cuentas`; si no, `cuentas.json` junto a este script, para que el
    lote lanzado por el vigilante use la misma cadena sin argumentos extra.
    """
    if desde_arg:
        return [c.strip() for c in desde_arg.split(",") if c.strip()]
    if CUENTAS.exists():
        datos = json.loads(CUENTAS.read_text(encoding="utf8"))
        lista = datos.get("cuentas", datos if isinstance(datos, list) else [])
        return [str(c).strip() for c in lista if str(c).strip()]
    return []


def cuentas_de_otros(worker):
    """Cuentas que OTRO worker tiene abiertas ahora mismo.

    Cada worker escribe `cuenta-activa-wN.json` con la cuenta que esta usando.
    Cuando uno se queda sin cuota, salta a la siguiente cuenta de la lista, pero
    nunca a la que el otro worker tiene puesta: dos pestanas generando contra la
    misma cuenta agotan la cuota al doble y dejan a los dos sin nada.
    """
    ocupadas = set()
    for f in AQUI.glob("cuenta-activa-w*.json"):
        if f.name == f"cuenta-activa-w{worker}.json":
            continue
        try:
            # Ventana corta: el worker reescribe su registro con cada imagen,
            # asi un archivo viejo de un worker que ya murio no bloquea al vivo.
            if time.time() - f.stat().st_mtime > 240:
                continue
            datos = json.loads(f.read_text(encoding="utf8"))
        except Exception:
            continue
        correo = str(datos.get("cuenta") or "").strip().lower()
        if correo:
            ocupadas.add(correo)
    return ocupadas


def siguiente_cuenta(cuentas, actual, usadas):
    """La primera cuenta de la lista que no sea la de ahora ni se haya gastado."""
    for correo in cuentas:
        if correo.lower() in actual.lower() or correo.lower() in usadas:
            continue
        return correo
    return ""


def guardar_cuenta(indice, etiqueta, worker=0):
    """Anota la cuenta que está entregando, para el relanzamiento del vigilante.

    El vigilante arranca el lote sin `--authuser`; sin este archivo, cada
    relanzamiento volvía a la cuenta agotada y perdía minutos antes de saltar.
    """
    m = re.search(r"\(([^)]+@[^)]+)\)", etiqueta or "")
    datos = {"authuser": str(indice or ""), "cuenta": m.group(1) if m else ""}
    CUENTA_ACTIVA.write_text(json.dumps(datos), encoding="utf8")
    # Registro por worker: el otro worker lo lee para no caer en la misma
    # cuenta y duplicar el consumo.
    (AQUI / f"cuenta-activa-w{worker}.json").write_text(
        json.dumps(datos), encoding="utf8")


def procesar_comunidad(p, etiqueta, sesion, pg, args, cuentas, gastadas,
                       generar=None, prompts=None):
    """Genera una comunidad, cambiando de cuenta cuando Flow deja de entregar.

    Devuelve "ok", "sin-cuentas", "sin-sesion" o "fallo". Un límite de la cuenta
    (cuota o Flow que no entrega imagen) cambia de cuenta y reintenta ESTA
    comunidad; un fallo de envío o de sondeo se reintenta en la misma cuenta sin
    gastar el turno de ninguna.
    """
    generar = generar or generar_una
    fallos = 0
    while True:
        try:
            generar(sesion, p, etiqueta, prompts)
            return "ok"
        except (flow_navegador.CuotaAgotada, flow_navegador.SinImagen) as e:
            motivo = ("CUOTA AGOTADA" if isinstance(e, flow_navegador.CuotaAgotada)
                      else "SIN IMAGEN")
            actual = flow_navegador.cuenta(pg)
            gastadas |= cuentas_de_otros(getattr(args, "worker", 0))
            siguiente = siguiente_cuenta(cuentas, actual, gastadas)
            if not siguiente:
                print(f"{etiqueta} -> {motivo}: {e}", flush=True)
                return "sin-cuentas"
            print(f"{etiqueta} -> {motivo} en {actual or 'la cuenta actual'}"
                  f": se pasa a {siguiente}", flush=True)
            indice = flow_navegador.cambiar_cuenta(pg, siguiente)
            if indice == -2 or (indice is None and flow_navegador.en_login(pg)):
                # La cuenta no tiene sesión: se deja la pestaña en el login de
                # Google y se espera allí, sin relanzar nada.
                print(f"Flow pide iniciar sesion para {siguiente}. "
                      "Inicia sesion en la pestana de Chrome que quedo abierta; "
                      "el lote sigue solo al terminar.", flush=True)
                if flow_navegador.esperar_sesion(pg):
                    indice = (flow_navegador.indice_de_cuenta(pg)
                              if siguiente.lower() in flow_navegador.cuenta(pg).lower()
                              else None)
                else:
                    # El login no llegó: seguir con -2 abriría un proyecto en
                    # ninguna cuenta y se generarían imágenes a nombre de nadie.
                    indice = None
                if indice == "":
                    print("sesion iniciada:", flow_navegador.cuenta(pg), flush=True)
            if indice is None:
                print(f"ERROR: {siguiente} no tiene sesion abierta en Chrome.", flush=True)
                return "sin-sesion"
            gastadas.add(siguiente.lower())
            url = flow_navegador.abrir_proyecto(pg, str(indice))
            sesion.url = url
            guardar_cuenta(str(indice), flow_navegador.cuenta(pg), getattr(args, "worker", 0))
            print("proyecto:", url[:80], "| cuenta:", flow_navegador.cuenta(pg), flush=True)
            continue
        except Exception as e:
            print(f"{etiqueta} -> ERROR: {e}", flush=True)
            fallos += 1
            if fallos < 2:
                print("  se reintenta en la misma cuenta", flush=True)
                continue
            return "fallo"
        finally:
            if getattr(args, "espera", 0):
                time.sleep(args.espera)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limite", type=int, default=3)
    ap.add_argument("--slugs", default="", help="slug o slug@Municipio, separados por coma")
    ap.add_argument("--tier", default="")
    ap.add_argument("--espera", type=int, default=15)
    ap.add_argument("--authuser", default="", help="índice de la cuenta de Google (0, 1, 2...)")
    ap.add_argument("--cuentas", default="", help="correos separados por coma, en orden de respaldo")
    ap.add_argument("--worker", type=int, default=0, help="qué mitad del reparto le toca (0..workers-1)")
    ap.add_argument("--workers", type=int, default=1, help="cuántos workers generan a la vez")
    ap.add_argument("--puerto", type=int, default=9222,
                    help="puerto CDP del Chrome de este worker (9222, 9223...)")
    ap.add_argument("--pestana", type=int, default=-1,
                    help="indice de la pestana de Flow (-1: la del worker)")
    ap.add_argument("--plan", action="store_true", help="solo muestra el orden de la tanda, sin generar")
    ap.add_argument("--sin-rotacion", action="store_true",
                    help="no salta a otra cuenta: si la suya se agota, sale y deja el sitio a otro worker")
    ap.add_argument("--autocomprobar", action="store_true", help="comprueba el orden de la cola; sale con 1 si falla")
    args = ap.parse_args()

    prompts = json.loads(PROMPTS.read_text(encoding="utf8"))
    if args.autocomprobar:
        print("autocomprobación del orden de la cola\n")
        fallos = flow_plan.autocomprobar(prompts, SALIDA)
        print(f"\n{fallos} fallo(s)")
        return 1 if fallos else 0

    pedidos = [p for p in prompts if not args.tier or p["priority"] == args.tier]
    if args.slugs:
        elegidos, faltas = flow_plan.seleccionar(prompts, args.slugs)
        if faltas:
            for falta in faltas:
                print(f"ERROR: {falta}")
            print("\nNo se generó nada: corrige --slugs y vuelve a lanzar.")
            return 1
        pedidos = [p for p in pedidos if p["archivo"] in {e["archivo"] for e in elegidos}]
        for e in elegidos:
            print(f"seleccionada: {e['name']} ({e['municipality']}) - {e['servicio']}")

    SALIDA.mkdir(parents=True, exist_ok=True)
    # Alinea el manifiesto con el disco antes de generar nada: así un lote que
    # muere en el primer ítem igual no arrastra claves huérfanas.
    flow_estado.guardar_manifiesto(prompts, SALIDA, MANIFIESTO)
    # Cada comunidad debe tener sus dos imágenes (techos y limpieza): los pares
    # a medias van primero, antes de abrir comunidades nuevas. Se mira el
    # catálogo completo y no solo lo filtrado, para que --tier no falsee el par.
    cola = flow_plan.construir_cola(prompts, pedidos, SALIDA)
    if args.workers > 1:
        # Reparto estable por nombre de archivo: cada comunidad cae siempre en
        # el mismo worker, así dos workers nunca escriben el mismo PNG.
        cola = [(p, par) for p, par in cola
                if zlib.crc32(p["archivo"].encode("utf-8")) % args.workers == args.worker]
    if args.plan:
        tanda = cola[: args.limite]
        for i, (p, par) in enumerate(tanda, 1):
            marca = "par " if par else "    "
            print(f"{i:3}/{len(tanda)} {marca}[{p['priority']:6}] {p['name']} ({p['municipality']}) - {p['servicio']}")
        print(f"\n{len(cola)} pendientes; esta tanda {len(tanda)}")
        return 0
    pendientes = [p for p, _ in cola[: args.limite]]
    if not pendientes:
        print("Nada pendiente con ese filtro.")
        return 0

    # Candado de un solo proceso: dos lotes a la vez se roban las imágenes del
    # mosaico y guardan la de una comunidad bajo el nombre de otra.
    candado = socket.socket()
    try:
        # 47666/47668: el 47667 queda para el reanudador, que si no chocaba
        # con el candado del worker 1 y lo dejaba fuera toda la tanda.
        candado.bind(("127.0.0.1", 47666 + 2 * args.worker))
        candado.listen(1)
    except OSError:
        print("Ya hay un lote de Flow en marcha; espera a que termine.")
        return 1

    # Cada carril puede vivir en su propio Chrome (y su propia cuenta):
    # el puerto CDP y la pestana se eligen por worker.
    cual = args.worker if args.pestana < 0 else args.pestana
    sesion = flow_navegador.Sesion(puerto=args.puerto, cual=cual)
    pg = sesion.conectar()
    try:
        url = flow_navegador.abrir_proyecto(pg, args.authuser)
        # La pestaña reabierta a mitad de lote vuelve a este mismo proyecto.
        sesion.url = url
        guardar_cuenta(args.authuser, flow_navegador.cuenta(pg), args.worker)
        print("proyecto:", url[:80], "| cuenta:", pg.evaluate(
            "() => { const e=document.querySelector('[aria-label*=\"Cuenta de Google\"]'); "
            "return e ? e.getAttribute('aria-label').split(String.fromCharCode(10)).join(' ') : '?'; }"),
            flush=True)

        # Un worker por cuenta: si la que abrio esta pestana es la misma que el
        # otro worker tiene puesta, se sale sin generar. Dos pestanas contra la
        # misma cuenta consumen la misma cuota y se pisan los limites.
        mia = (flow_navegador.cuenta(pg) or "").lower()
        ajenas = cuentas_de_otros(args.worker)
        if any(c and c in mia for c in ajenas):
            print(f"La cuenta de esta pestana ya la tiene otro worker ({mia[-40:]}): "
                  "este sale para no duplicar el consumo.", flush=True)
            return 0

        cuentas = [] if args.sin_rotacion else cargar_cuentas(args.cuentas)
        gastadas = cuentas_de_otros(args.worker)
        for i, p in enumerate(pendientes, 1):
            etiqueta = f"{i}/{len(pendientes)} {p['name']} ({p['municipality']})"
            resultado = procesar_comunidad(p, etiqueta, sesion, pg, args, cuentas,
                                           gastadas, prompts=prompts)
            if resultado == "ok":
                # Latido: mantiene fresco cuenta-activa-wN.json mientras genera.
                guardar_cuenta(args.authuser, flow_navegador.cuenta(pg), args.worker)
                continue
            if resultado == "sin-cuentas":
                print("Ninguna cuenta de la lista entrega imagenes: se reanuda con el mismo comando.")
                return 3
            if resultado == "sin-sesion":
                print("La cuenta siguiente pide login y no llego: se reanuda con el mismo comando.")
                return 2
        faltan = len(flow_plan.construir_cola(prompts, pedidos, SALIDA))
        print(f"\nFaltan {faltan} imágenes en la cola.")
    finally:
        # Solo se suelta CDP: la ventana y la pestaña del propietario siguen abiertas.
        sesion.parar()

    print(f"\nCarpeta: {SALIDA}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
