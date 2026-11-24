"""Lleva Flow hasta el final del catálogo, tanda tras tanda, sin manos.

    python -u scripts/imagenes/lote-automatico.py
    python -u scripts/imagenes/lote-automatico.py --tanda 50 --espera 10

Qué resuelve, y por qué hace falta:

- `flow-ui.py` genera una tanda y se detiene. Completar 438 comunidades a mano
  son decenas de lanzamientos, y el lote se queda a medias cuando Chrome cierra
  la pestaña, cuando Flow agota la cuota o cuando el proceso muere.
- Aquí se repite la tanda hasta que no quede nada pendiente, se reintenta tras
  un fallo del proceso y se para en seco si Flow dice que no hay cuota —seguir
  solo acumula esperas de cuatro minutos por imagen inexistente.
- Al final de cada tanda que haya dejado PNG nuevos se corre el generador de
  landings, así las fotos llegan a su página sin un paso manual.

El estado del mundo siempre es el disco: qué PNG existen y qué prompts siguen
pendientes. Por eso se puede cortar con Ctrl+C y volver a lanzar.
"""
import argparse
import json
import pathlib
import subprocess
import sys
import time

import flow_plan

AQUI = pathlib.Path(__file__).resolve().parent
COMUNIDADES = AQUI.parent.parent
SALIDA = COMUNIDADES.parent / "comunidades imagenes"
PROMPTS = AQUI / "prompts.json"
GENERADOR = COMUNIDADES / "scripts" / "generar-landings.mjs"
COLA_HERO = COMUNIDADES / "scripts" / "cola-hero.mjs"
PREPARAR = COMUNIDADES / "scripts" / "preparar-funnel-ghl.mjs"
# Foto compartida del CDN: si el payload la sigue usando, esa comunidad aún no
# tiene su hero montado.
FOTO_COMPARTIDA = "6ab0a4884091fa65e6a1ce3d"
REGISTRO = AQUI / "lote-automatico.log"
CUENTA_ACTIVA = AQUI / "cuenta-activa.json"
CUOTA = "CUOTA AGOTADA"
CANDADO = "Ya hay un lote de Flow en marcha"
SIN_SESION = "no tiene sesión iniciada"

sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def anotar(texto):
    """Una línea fechada al registro y a la consola, sin búfer."""
    linea = f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {texto}"
    print(linea, flush=True)
    with REGISTRO.open("a", encoding="utf8") as f:
        f.write(linea + "\n")


def pngs():
    return len(list(SALIDA.glob("*.png")))


def pendientes(prompts):
    return flow_plan.construir_cola(prompts, prompts, SALIDA)


def correr(orden):
    """Corre un generador de una tanda y devuelve los avisos que aparecieron."""
    avisos = {"cuota": False, "candado": False, "sesion": False}
    proceso = subprocess.Popen(
        orden, cwd=AQUI, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, encoding="utf8", errors="replace", bufsize=1,
    )
    for linea in proceso.stdout:
        linea = linea.rstrip()
        if not linea:
            continue
        print(linea, flush=True)
        with REGISTRO.open("a", encoding="utf8") as f:
            f.write(linea + "\n")
        avisos["cuota"] = avisos["cuota"] or CUOTA in linea
        avisos["candado"] = avisos["candado"] or CANDADO in linea
        avisos["sesion"] = avisos["sesion"] or SIN_SESION in linea
    proceso.wait()
    return avisos


def refrescar_cola():
    """Rearma la cola de publicación con lo que hay ahora mismo en disco.

    `cola-hero.mjs` mira `landings/hero`: cada comunidad cuyas fotos ya existen
    entra sola. Después se reescribe `.tmp-pendientes.txt` sin las ya publicadas,
    que es el archivo que relee el supervisor de GHL en cada ronda. Sin este
    paso, las comunidades recién fotografiadas se quedaban fuera de la cola
    hasta que alguien refrescara la lista a mano.
    """
    subprocess.run(["node", str(COLA_HERO)], cwd=COMUNIDADES, capture_output=True,
                   text=True, encoding="utf8", errors="replace")
    cola = COMUNIDADES / "data" / "ghl" / "cola-hero.txt"
    indice = COMUNIDADES / "data" / "ghl" / "index.json"
    if not cola.exists() or not indice.exists():
        return "sin cola que refrescar"
    publicadas = {
        f"{f['municipalitySlug']}/{f['slug']}"
        for f in json.loads(indice.read_text(encoding="utf8"))["funnels"]
        if f.get("status") == "publicado"
    }
    claves = [l.strip() for l in cola.read_text(encoding="utf8").splitlines() if l.strip()]
    pendientes = [k for k in claves if k not in publicadas]
    (COMUNIDADES.parent / ".tmp-pendientes.txt").write_text(
        "\n".join(pendientes) + "\n", encoding="utf8")
    return (f"{len(claves)} comunidades con hero · {len(pendientes)} pendientes de publicar"
            + " · " + preparar_payloads(claves))


def preparar_payloads(claves):
    """Sube el hero de cada comunidad nueva y rehace su payload.

    El embed de GHL no lleva rutas relativas: `preparar-funnel-ghl.mjs --upload`
    sube el WebP a la Media Library y guarda ESA URL en el payload. Sin este paso
    la página se publica con la foto compartida aunque el WebP exista, que es lo
    que pasó con las primeras comunidades de la tirada nueva.
    """
    faltan = []
    for clave in claves:
        municipio, _, slug = clave.partition("/")
        payload = COMUNIDADES / "data" / "ghl" / "funnels" / municipio / f"{slug}.json"
        if not payload.exists():
            faltan.append(clave)
            continue
        if FOTO_COMPARTIDA in payload.read_text(encoding="utf8"):
            faltan.append(clave)
    if not faltan:
        return "payloads al día"
    hechos = 0
    for i in range(0, len(faltan), 15):
        trozo = faltan[i:i + 15]
        hecho = subprocess.run(
            ["node", str(PREPARAR), "--only", ",".join(trozo), "--upload"],
            cwd=COMUNIDADES, capture_output=True, text=True, encoding="utf8", errors="replace",
        )
        if hecho.returncode != 0:
            ultimo = ((hecho.stderr or hecho.stdout).strip().splitlines() or ["sin salida"])[-1]
            return f"payloads: fallo con {len(trozo)} ({ultimo})"
        hechos += len(trozo)
    return f"payloads preparados: {hechos}"


def generar_landings():
    """Convierte los PNG nuevos, reescribe las páginas y refresca la cola."""
    hecho = subprocess.run(
        ["node", str(GENERADOR)], cwd=COMUNIDADES,
        capture_output=True, text=True, encoding="utf8", errors="replace",
    )
    resumen = (hecho.stdout or hecho.stderr).strip().splitlines()[-2:]
    return (" | ".join(resumen) if resumen else f"node salió con {hecho.returncode}") + " · cola: " + refrescar_cola()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tanda", type=int, default=50, help="imágenes por tanda")
    ap.add_argument("--espera", type=int, default=10, help="segundos entre imágenes")
    ap.add_argument("--workers", type=int, default=1, help="workers en paralelo (reparto por hash)")
    ap.add_argument("--rondas", type=int, default=200, help="tope de tandas")
    ap.add_argument("--vacias", type=int, default=3, help="tandas seguidas sin avance antes de parar")
    ap.add_argument("--respaldo-chatgpt", action="store_true",
                    help="seguir con ChatGPT si Flow agota la cuota (por defecto NO: solo Flow)")
    ap.add_argument("--sin-respaldo", action="store_true",
                    help="(ya es el comportamiento por defecto; se acepta por compatibilidad)")
    ap.add_argument("--authuser", default="", help="índice de la cuenta de Google con la que arranca (0, 1, 2...)")
    args = ap.parse_args()

    if not args.authuser and CUENTA_ACTIVA.exists():
        # El vigilante relanza sin argumentos: se retoma la cuenta que estaba
        # entregando en vez de volver a la agotada.
        try:
            args.authuser = str(json.loads(CUENTA_ACTIVA.read_text(encoding="utf8")).get("authuser") or "")
        except Exception:
            args.authuser = ""
    prompts = json.loads(PROMPTS.read_text(encoding="utf8"))
    anotar(f"inicio · {pngs()} PNG en disco · {len(pendientes(prompts))} imágenes pendientes · tanda {args.tanda}")

    modo = "flow"
    sin_avance = 0
    for ronda in range(1, args.rondas + 1):
        cola = pendientes(prompts)
        if not cola:
            anotar("cola vacía: no queda ninguna imagen por generar")
            break

        antes = pngs()
        anotar(f"tanda {ronda} · {len(cola)} pendientes · generando {min(args.tanda, len(cola))} en {modo}")
        if modo == "flow":
            orden = [
                sys.executable, "-u", str(AQUI / "flow-ui.py"),
                "--limite", str(args.tanda), "--espera", str(args.espera),
                "--worker", "0", "--workers", str(args.workers),
            ]
            if args.authuser:
                orden += ["--authuser", args.authuser]
            avisos = correr(orden)
        else:
            avisos = correr([
                sys.executable, "-u", str(AQUI / "chatgpt-ui.py"),
                "--limite", str(args.tanda), "--espera", str(max(args.espera, 20)),
            ])

        if avisos["candado"]:
            # Otro proceso tiene el candado: no se cuenta como fallo propio.
            anotar("otro lote tiene el candado; se espera 15 s y se reintenta")
            time.sleep(15)
            continue

        despues = pngs()
        nuevas = despues - antes
        anotar(f"tanda {ronda} terminada · {nuevas} imágenes nuevas · {despues} PNG en total")

        if nuevas:
            sin_avance = 0
            anotar("regenerando landings: " + generar_landings())
        else:
            sin_avance += 1

        if avisos["sesion"]:
            anotar("ChatGPT no tiene sesión en el navegador de automatización: se detiene el lote")
            break
        if avisos["cuota"] and not nuevas:
            # Sin cuota Y sin una sola imagen: no hay a dónde seguir.
            # Ojo: una rotación de cuenta también escribe «CUOTA AGOTADA», y antes
            # eso cortaba la tanda entera aunque la cuenta nueva estuviera
            # entregando. Si hubo imágenes, la rotación funcionó y se sigue.
            if modo == "chatgpt" or not args.respaldo_chatgpt:
                anotar("sin cuota ni imagenes en el motor en uso: se detiene. Se reanuda con el mismo comando.")
                break
            anotar("Flow agotó la cuota: se sigue con ChatGPT en la siguiente tanda")
            modo = "chatgpt"
            continue
        if sin_avance >= args.vacias:
            anotar(f"{sin_avance} tandas seguidas sin una sola imagen: se detiene para no quemar cuota.")
            break
        if nuevas == 0:
            anotar("sin avance: se espera 120 s antes de la siguiente tanda")
            time.sleep(45)

    anotar(f"fin · {pngs()} PNG en disco · {len(pendientes(prompts))} imágenes siguen pendientes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
