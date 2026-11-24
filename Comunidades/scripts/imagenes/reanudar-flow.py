"""Mantiene vivo el lote de imagenes usando SOLO Flow, sin respaldo de ChatGPT.

    python -u scripts/imagenes/reanudar-flow.py

Que hace, y por que hace falta:

- Corre `lote-automatico.py --rondas 1` (una sola tanda) y compara los PNG antes
  y despues. Si entraron imagenes nuevas vuelve a entrar de inmediato; si no,
  espera 5, 10, 20 y 30 minutos (tope) antes de reintentar. Asi engancha solo
  cuando Flow repone la cuota o cuando aparece una cuenta de Google con sesion,
  sin que nadie tenga que relanzar nada a mano.
- Un solo ejemplar: toma el puerto 47667 y, si ya esta ocupado, sale sin tocar
  nada. Antes de lanzar una tanda mira el candado de Flow (47666): si otro lote
  esta dentro, espera en vez de pelearse por la pestana.
- Nunca pasa `--respaldo-chatgpt`: el respaldo de ChatGPT queda fuera del
  circuito, porque su tope de imagenes es diario y quemarlo deja el lote en un
  bucle de errores.
- El estado del mundo es el disco (que PNG existen), asi que se puede cortar y
  volver a lanzar sin perder trabajo.
"""
import json
import pathlib
import socket
import subprocess
import sys
import time

import flow_plan

AQUI = pathlib.Path(__file__).resolve().parent
COMUNIDADES = AQUI.parent.parent
SALIDA = COMUNIDADES.parent / "comunidades imagenes"
PROMPTS = AQUI / "prompts.json"
REGISTRO = AQUI / "reanudar-flow.log"
PUERTO_PROPIO = 47667   # candado de este reanudador
PUERTO_FLOW = 47666     # candado que toma flow-ui.py mientras genera
ESPERA_MIN = 300
ESPERA_MAX = 900
REINTENTO_CORTO = 120
SALIDA_RAPIDA = 90
TANDA = 150
ESPERA_IMAGEN = 1

sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def anotar(texto):
    linea = f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {texto}"
    print(linea, flush=True)
    with REGISTRO.open("a", encoding="utf8") as f:
        f.write(linea + "\n")


def pngs():
    return len(list(SALIDA.glob("*.png")))


def pendientes():
    prompts = json.loads(PROMPTS.read_text(encoding="utf8"))
    return len(flow_plan.construir_cola(prompts, prompts, SALIDA))


def flow_ocupado():
    """True si otro lote esta dentro de Flow: alguien escucha en 47666.

    Se prueba con connect y no con bind: bind falla por TIME_WAIT aunque no
    quede nadie dentro, y dejaba al reanudador esperando para siempre.
    """
    for puerto in (PUERTO_FLOW, PUERTO_FLOW + 2):
        s = socket.socket()
        s.settimeout(1)
        try:
            s.connect(("127.0.0.1", puerto))
            return True
        except OSError:
            continue
        finally:
            s.close()
    return False


def carriles():
    try:
        datos = json.loads((AQUI / 'carriles.json').read_text(encoding='utf8'))
        return max(1, int(datos.get('workers', 1)))
    except Exception:                                # noqa: BLE001
        return 1


def lote_vivo():
    """True si ya hay un lote-automatico corriendo (lo normal: lo lleva el vigia).

    Sin esta comprobacion el reanudador lanzaba un segundo lote que se quedaba
    fuera por el candado, salia con 0 imagenes y subia la espera como si Flow
    estuviera agotado.
    """
    ps = ("Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | "
          "Where-Object { $_.CommandLine -like '*lote-automatico*' } | "
          "ForEach-Object { $_.ProcessId }")
    try:
        out = subprocess.run(['powershell', '-NoProfile', '-Command', ps],
                             capture_output=True, text=True, timeout=60).stdout
    except Exception:                                   # noqa: BLE001
        return False
    return any(x.strip().isdigit() for x in out.split())


def main():
    candado = socket.socket()
    try:
        candado.bind(("127.0.0.1", PUERTO_PROPIO))
        candado.listen(1)
    except OSError:
        print("ya hay un reanudador vivo: este ejemplar sale sin hacer nada", flush=True)
        return 0

    espera = ESPERA_MIN
    anotar(f"reanudador arrancado · {pngs()} PNG · {pendientes()} pendientes · "
           f"siguiente espera {espera // 60} min si no hay imagenes")

    while True:
        if pendientes() == 0:
            anotar("no queda ninguna imagen pendiente: el reanudador termina")
            return 0
        if flow_ocupado():
            # Otro lote esta dentro de Flow: lanzar aqui solo robaria la pestana.
            anotar("Flow ocupado por otro lote; se espera 60 s sin lanzar nada")
            time.sleep(60)
            continue

        if lote_vivo():
            anotar("ya hay un lote vivo (lo lleva el vigia); se espera 2 min")
            time.sleep(REINTENTO_CORTO)
            continue

        antes = pngs()
        orden = [
            sys.executable, "-u", str(AQUI / "lote-automatico.py"),
            "--rondas", "1", "--tanda", str(TANDA), "--espera", str(ESPERA_IMAGEN),
            "--workers", str(carriles()),
        ]
        inicio = time.time()
        codigo = subprocess.call(orden, cwd=AQUI)
        duracion = time.time() - inicio
        despues = pngs()
        nuevas = despues - antes

        if nuevas > 0:
            anotar(f"tanda con {nuevas} imagenes nuevas · {despues} PNG · se repite de inmediato")
            espera = ESPERA_MIN
            continue
        if duracion < SALIDA_RAPIDA:
            # Murio enseguida: candado, pestaña cerrada o arranque roto.
            # Eso no es cuota agotada, asi que la espera no sube.
            anotar(f"el lote salio en {duracion:.0f}s sin imagenes; se reintenta en 2 min")
            time.sleep(REINTENTO_CORTO)
            continue
        anotar(f"sin imagenes nuevas (el lote salio con {codigo}) · {despues} PNG · "
               f"{pendientes()} pendientes · siguiente intento en {espera // 60} min")
        time.sleep(espera)
        espera = min(espera * 2, ESPERA_MAX)


if __name__ == "__main__":
    sys.exit(main())
