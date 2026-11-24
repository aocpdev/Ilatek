"""Supervisor del lote de comunidades: relanza tras cada corte y cierra la tanda.

Una comunidad cuesta 10-14 min y este entorno corta los procesos a los ~4, así
que el lote se trocea en pasos pequeños: **una página por corrida** del driver.
Cuando un paso se corta, se relanza (el driver es idempotente y reanuda por el
fast-path). Cuando las dos páginas de las comunidades de la tanda están vivas, se
pasan las dos verificaciones oficiales por comunidad y se anota el cierre en
`progress.md`.

    python scripts/supervisar-lote.py --plan          # qué haría, sin tocar nada
    python scripts/supervisar-lote.py                 # hasta agotar la cola
    python scripts/supervisar-lote.py --max-tandas 2  # dos tandas y sale

Estado en `.tmp-supervisor.json` (se puede matar y relanzar: el ledger manda) y
un candado de puerto para que no haya dos supervisores robándose la pestaña.

Carriles: `--carril N` es el paralelismo soportado. Cada carril abre su propia
pestaña (el driver ya lo hace con `--carril`), lleva su estado
(`.tmp-supervisor-N.json`), su candado de puerto (8791+N) y reparte el trabajo
con un fichero de reclamos con caducidad, así que dos carriles nunca toman la
misma comunidad. El carril 0 tiene que correr esta versión (deja latido) antes
de abrir el carril 1; si no, el segundo sale sin tocar nada.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import re
import socket
import subprocess
import sys
import time
import urllib.request
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
PY = sys.executable
DRIVER = ROOT / "scripts" / "alta-funnel-ghl.py"
AUDITOR = ROOT / "scripts" / "auditar-publicadas.py"
CONTENIDO = ROOT / "scripts" / "verificar-contenido.py"
COLA = ROOT / "data" / "ghl" / "cola-hero.txt"
LEDGER = ROOT / "data" / "ghl" / "index.json"
PROGRESO = ROOT / "progress.md"
ESTADO = ROOT / ".tmp-supervisor.json"
SERVICIOS = ("techos", "limpieza")
# Palabra que tiene que aparecer en el H1 para que la página sirva SU servicio.
SERVICIO = {"techos": "sellado", "limpieza": "limpieza"}
PUERTO = 8791
# El candado de puerto solo impide dos supervisores sobre la misma pestaña; para
# que dos carriles no elijan la misma comunidad hace falta reparto explícito.
# Una ficha por comunidad, creada con O_EXCL: crear el fichero ES el candado.
RECLAMOS = ROOT / ".tmp-reclamos"
CARGO_RECLAMO = 1800            # segundos que vale un reclamo abandonado
_PREFIJO = ""

# La consola de Windows es cp1252 y la salida de los scripts hijos trae bytes
# sueltos que GHL devuelve fuera de UTF-8: sin esto, un `print` con U+FFFD mata
# al supervisor en mitad de una tanda (pasó al cerrar la tanda 1).
for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding="utf-8", errors="replace")
    except Exception:                          # noqa: BLE001
        pass


def log(msg):
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] {_PREFIJO}{msg}".replace("\ufffd", "?"), flush=True)


def cdp_vivo():
    try:
        with urllib.request.urlopen("http://127.0.0.1:9222/json/version", timeout=10) as r:
            return r.status == 200
    except Exception:                           # noqa: BLE001
        return False


def pestanas_abiertas():
    """Cuenta las pestañas page-builder abiertas y avisa si sobran. No cierra.

    `AGENTS.md` prohíbe cerrar la ventana o la pestaña del propietario, y cerrar
    la última apaga Chrome (pasó el 2026-11-06: 25 pestañas cerradas se llevaron
    la ventana por delante). Lo que evita la acumulación es que el driver
    **reutilice** la pestaña de su carril (`.tmp-carril-N.pestana`), no la poda.
    """
    try:
        lst = json.load(urllib.request.urlopen("http://127.0.0.1:9222/json/list", timeout=10))
    except Exception:                              # noqa: BLE001
        return 0
    n = sum(1 for t in lst if t.get("type") == "page"
            and "page-builder" in (t.get("url") or ""))
    if n > 4:
        log(f"aviso: {n} pestañas page-builder abiertas; no se cierran (AGENTS.md). "
            "El driver reutiliza la de su carril; el resto las cierra el propietario.")
    return n


def ultimo_verde():
    """Epoch del último verde anotado por CUALQUIER carril.

    Con tres carriles, un carril lento no significa nada; que el lote entero lleve
    media hora sin un solo verde sí: eso es GHL saturado, no mala suerte.
    """
    ultimo = 0.0
    for f in sorted(ROOT.glob(".tmp-supervisor*.json")):
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
        except Exception:                          # noqa: BLE001
            continue
        for iso in (d.get("verde") or {}).values():
            try:
                ultimo = max(ultimo, datetime.fromisoformat(iso).timestamp())
            except Exception:                      # noqa: BLE001
                pass
    return ultimo


def vigilar(args, est, motivo):
    """Avisa si el lote lleva demasiado tiempo sin cerrar una comunidad.

    Una comunidad cuesta 10-14 min; si pasan `--aviso-min` sin un solo verde en
    ningún carril, GHL está saturado (o algo se atascó) y lo que viene después son
    páginas bloqueadas por hidratación. El aviso sale **antes** de que el
    supervisor empiece a bloquear, que es cuando ya solo queda bajar carriles.
    Se cuenta desde que esta corrida puede publicar (`arranque`) o desde el último
    verde de cualquier carril, lo que sea más reciente.
    """
    limite = args.aviso_min * 60
    if limite <= 0:
        return
    base = max(ultimo_verde(), float(est.get("arranque", 0) or 0))
    ahora = time.time()
    if ahora - base < limite or ahora - float(est.get("ultimo_aviso", 0) or 0) < limite:
        return
    est["ultimo_aviso"] = ahora
    guardar_estado(est)
    log(f"AVISO: {int((ahora - base) // 60)} min sin cerrar ninguna comunidad ({motivo}) · "
        f"CDP {'vivo' if cdp_vivo() else 'caído'} · {pestanas_abiertas()} pestañas GHL · "
        "si se repite, baja carriles antes de que bloquee tandas")


def esperar_cdp(minutos):
    """El puerto 9222 solo existe si Chrome se abrió con la bandera de depuración.

    Si el dueño reinicia Chrome sin `--remote-debugging-port=9222`, el puerto no
    vuelve solo y cerrar su ventana está prohibido (AGENTS.md). Con
    `--esperar-cdp` el supervisor aguanta y arranca cuando el puerto reaparezca.
    """
    if cdp_vivo():
        return True
    if minutos <= 0:
        return False
    log(f"CDP caído: se espera hasta {minutos} min a que vuelva 127.0.0.1:9222")
    fin = time.time() + minutos * 60
    while time.time() < fin:
        time.sleep(30)
        if cdp_vivo():
            log("CDP de vuelta: arranca el lote")
            return True
    return False


def publicado():
    idx = json.loads(LEDGER.read_text(encoding="utf-8"))
    return {f"{f['municipalitySlug']}/{f['slug']}" for f in idx["funnels"]
            if f.get("status") == "publicado"}


def cola():
    vistas, orden = set(), []
    for linea in COLA.read_text(encoding="utf-8").splitlines():
        clave = linea.strip()
        if clave and clave not in vistas:
            vistas.add(clave)
            orden.append(clave)
    return orden


def cargar_estado():
    base = {"tandas": [], "bloqueadas": {}, "intentos": {}, "rojas": {},
            "verde": {}, "sweep_i": 0, "cortes": {}}
    if ESTADO.exists():
        base.update(json.loads(ESTADO.read_text(encoding="utf-8")))
    return base


def guardar_estado(est):
    ESTADO.write_text(json.dumps(est, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _ficha(clave):
    """Fichero de reclamo de una comunidad (nombre estable y sin colisiones)."""
    limpio = re.sub(r"[^a-z0-9]+", "-", clave.lower()).strip("-")
    return RECLAMOS / f"{limpio}-{hashlib.sha1(clave.encode()).hexdigest()[:8]}.claim"


def _leer_ficha(f):
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except Exception:                              # noqa: BLE001
        return {}


def reclamadas_por_otros(carril):
    """Claves reclamadas por otros carriles y aún vivas."""
    ajenas = set()
    if not RECLAMOS.is_dir():
        return ajenas
    for f in RECLAMOS.glob("*.claim"):
        d = _leer_ficha(f)
        if d.get("carril") == carril:
            continue
        if time.time() - float(d.get("t", 0) or 0) < CARGO_RECLAMO:
            ajenas.add(d.get("clave", ""))
    return ajenas - {""}


def reclamar(clave, carril):
    """Toma `clave` creando su ficha con O_EXCL. False si la tiene otro carril.

    Antes esto era un candado global con fichero: dos procesos que veían el mismo
    candado viejo (de una corrida matada) lo borraban a la vez y **los dos se
    creían dueños**. Así acabaron tres carriles republicando dorado/la-cala el
    2026-11-06. Crear la ficha es atómico: solo uno recibe el descriptor.
    """
    RECLAMOS.mkdir(exist_ok=True)
    f = _ficha(clave)
    for _ in range(2):
        try:
            fd = os.open(f, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError:
            d = _leer_ficha(f)
            if d.get("carril") == carril:
                return True                        # ya era mía
            if not d:
                # Ficha creada y aún sin contenido: se está escribiendo AHORA.
                # Se da por viva (fallar cerrado). Darla por caducada es lo que
                # hizo que dos carriles borraran la ficha del otro y ambos se
                # creyeran dueños: así se cruzaron a las 09:09 en la-cala y the-isles.
                return False
            try:
                edad = time.time() - f.stat().st_mtime
            except Exception:                      # noqa: BLE001
                return False
            if edad < CARGO_RECLAMO:
                return False                       # viva y de otro carril
            try:
                f.unlink()                         # caducada: se libera
            except Exception:                      # noqa: BLE001
                return False
            continue
        try:
            os.write(fd, json.dumps({"clave": clave, "carril": carril,
                                     "t": time.time()}).encode())
        finally:
            os.close(fd)
        return True
    return False


def soy_dueno(clave, carril):
    """¿La ficha de esta comunidad es de este carril?"""
    return _leer_ficha(_ficha(clave)).get("carril") == carril


def refrescar(clave, carril):
    """Renueva la caducidad de la ficha propia mientras se trabaja en ella.

    Sin esto, un carril que lleva un rato en la misma comunidad pierde el
    reclamo a los 30 min y otro se la lleva por caducada: al relanzar a las
    09:48 las fichas de las 09:17 caducaron justo entonces y dos carriles
    acabaron con la misma comunidad en la tanda.
    """
    f = _ficha(clave)
    if _leer_ficha(f).get("carril") != carril:
        return
    try:
        os.utime(f, None)
    except Exception:                              # noqa: BLE001
        pass


def liberar(clave, carril):
    """Suelta la ficha SOLO si es de este carril.

    Sin la comprobación, un carril que llega tarde borra la ficha del que sí es
    dueño y el reparto se deshace por detrás.
    """
    f = _ficha(clave)
    if _leer_ficha(f).get("carril") != carril:
        return
    try:
        f.unlink()
    except Exception:                              # noqa: BLE001
        pass


def latir(carril):
    """Marca que el carril corre esta versión (con reparto de trabajo)."""
    (ROOT / f".tmp-carril-{carril}.latido").write_text(
        json.dumps({"carril": carril, "t": time.time()}), encoding="utf-8")


def latido_vivo(carril, margen=300):
    try:
        d = json.loads((ROOT / f".tmp-carril-{carril}.latido").read_text(encoding="utf-8"))
        return time.time() - float(d.get("t", 0)) < margen
    except Exception:                              # noqa: BLE001
        return False


def correr(cmd, timeout):
    """Corre un paso. Un corte del entorno vuelve como 124, no como excepción."""
    try:
        res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=timeout,
                             encoding="utf-8", errors="replace")
        return res.returncode, (res.stdout or "") + (res.stderr or "")
    except subprocess.TimeoutExpired:
        return 124, ""


def publicar_pagina(clave, servicio, args, est, forzar=False):
    """Publica una página. Devuelve True, "corte" o False.

    Un corte del entorno (124) no es un fallo de la página: el driver reanuda
    donde iba y cada intento avanza. Distinguirlos evita bloquear comunidades
    que solo necesitaban un intento más (luquillo/luquillo-mar, 2026-11-06).
    """
    cortes = 0
    rotar = False
    for intento in range(1, args.reintentos + 1):
        marca = f"{clave}:{servicio}"
        est["intentos"][marca] = est["intentos"].get(marca, 0) + 1
        guardar_estado(est)
        log(f"   {clave} · {servicio} · intento {intento}/{args.reintentos}"
            + (" · repúblico" if forzar else ""))
        # Cinturón además de tirantes: aunque la tanda se armara con una lista
        # vieja, aquí no se lanza un driver si la ficha es de otro carril.
        if not soy_dueno(clave, args.carril) and not reclamar(clave, args.carril):
            log(f"   {clave} · {servicio}: la tiene otro carril → no se lanza")
            return "corte"
        cmd = [PY, "-u", str(DRIVER), "--only", clave, "--servicio", servicio,
               "--carril", str(args.carril)]
        if args.sin_chat:
            cmd.append("--sin-chat")
        if rotar:
            cmd.append("--pestana-nueva")
        if forzar:
            # La página vive pero no pasa el gate (chat sin cargar, og del otro
            # servicio, path revertido): sin --force el driver se la salta porque
            # el ledger ya la da por publicada y nunca se arreglaría.
            cmd.append("--force")
        rc, salida = correr(cmd, args.corte)
        refrescar(clave, args.carril)
        # Justo aquí es donde se ve la saturación: cada intento son ~5 min y una
        # comunidad encadenando intentos es el síntoma previo al bloqueo.
        vigilar(args, est, f"{clave} · {servicio} sigue sin cerrar")
        if rc == 0:
            return True
        pistas = [l.strip() for l in salida.splitlines() if "FALLA" in l or "falta" in l][-1:]
        motivo = "corte del entorno" if rc == 124 else f"exit {rc}"
        log(f"   {clave} · {servicio}: {motivo}" + (f" → {pistas[0]}" if pistas else ""))
        if rc != 124:
            # Fallo duro (no corte): la pestaña registrada pudo quedarse trabada
            # —"GHL no inicializó", "no abrió el overview"— y reintentar en la
            # misma gasta la tanda entera (2026-11-06, tres carriles en bucle).
            rotar = True
        if rc == 124:
            cortes += 1
            est["cortes"][marca] = est["cortes"].get(marca, 0) + 1
            guardar_estado(est)
            if est["cortes"][marca] >= 15:
                log(f"   {clave} · {servicio}: {est['cortes'][marca]} cortes seguidos "
                    f"→ se abandona para revisión")
                return False
        if not cdp_vivo():
            log("   CDP dejó de responder: no tiene sentido reintentar")
            return False
        if clave in publicado() and not pistas:
            return True
    return "corte" if cortes else False


def verificar(clave, corte, sin_chat=False, carril=-1):
    """Las dos verificaciones oficiales: (ok, detalle, en rojo, ciego).

    Saber QUÉ página falla evita republicar la hermana buena: la reparación
    cuesta 2-4 min por página y republicar de más es lo que cruza paths.

    `ciego` separa "el verificador no pudo opinar" de "la página está mal". El
    2026-11-06 el auditor dejó de conectar al CDP (`connect_over_cdp: Timeout
    180000ms exceeded`) y el supervisor marcó en rojo seis comunidades de Dorado
    y bloqueó dos: las páginas servían su contenido y su auditoría anterior era
    verde. Un fallo de herramienta no es un defecto de la página.
    """
    marca = ["--only", clave] + (["--carril", str(carril)] if carril >= 0 else [])
    fallos, rojos, ciegos = [], [], []
    for nombre, script in (("contenido", CONTENIDO), ("auditoría", AUDITOR)):
        # El auditor tiene que juzgar con el mismo contrato con el que se publicó:
        # si el carril corre con --sin-chat, la página no lleva widget y exigirlo
        # la marcaba en rojo para siempre (la-cala, 2026-11-06: bucle de
        # republicación con la única falla `chat`).
        extra = ["--sin-chat"] if (nombre == "auditoría" and sin_chat) else []
        rc, salida = correr([PY, "-u", str(script), *marca, *extra], corte)
        # Veredicto = el script terminó su pasada. Sin él (traceback, timeout de
        # CDP, corte) no hay nada que reprocharle a la landing.
        veredicto = ""
        for linea in reversed(salida.splitlines()):
            if "en verde" in linea or "con fallos" in linea or "FALLA" in linea:
                veredicto = linea.strip()
                break
        log(f"   {clave} · {nombre}: exit {rc} · {veredicto or 'sin veredicto'}")
        if rc != 0:
            (fallos if veredicto else ciegos).append(nombre)
        for linea in salida.splitlines():
            m = re.search(r"FALLA\s+([a-z]+)", linea)
            if m and m.group(1) in SERVICIOS and m.group(1) not in rojos:
                rojos.append(m.group(1))
    detalle = ", ".join(fallos) or "OK"
    if ciegos:
        detalle = (detalle + " · " if fallos else "") + "sin veredicto: " + ", ".join(ciegos)
    return ((not fallos) and not ciegos), detalle, rojos, bool(ciegos)


def anotar(linea):
    with PROGRESO.open("a", encoding="utf-8") as fh:
        fh.write(linea + "\n")


def compartidas():
    """Bloqueadas y rojas de TODOS los carriles.

    El estado es por carril (cursores, intentos), pero "bloqueada" o "en rojo"
    es un hecho del lote: si un carril la bloquea y el otro no se entera, la
    republica y vuelve a cruzar paths.
    """
    bloq, rojas = set(), set()
    for f in sorted(ROOT.glob(".tmp-supervisor*.json")):
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
        except Exception:                          # noqa: BLE001
            continue
        bloq.update(d.get("bloqueadas") or {})
        rojas.update(d.get("rojas") or {})
    return bloq, rojas


def pendientes_de(est, hechos, carril=0):
    """Lo que falta: primero las publicadas que quedaron en rojo, luego la cola.

    Una comunidad en rojo no puede esperar al final del lote: queda "publicada"
    en el ledger y, mientras no se repare, el verde es falso. Las reclamadas por
    otro carril no entran: dos carriles sobre la misma comunidad escriben los
    mismos Settings y el mismo path.
    """
    ajenas = reclamadas_por_otros(carril)
    bloq, rojas = compartidas()
    bloqueadas = set(est["bloqueadas"]) | bloq
    rojas |= set(est["rojas"])
    orden = cola()
    rojas_ok = [k for k in orden if k in rojas and k in hechos and k not in bloqueadas]
    rojas_ok += [k for k in sorted(rojas) if k not in orden and k in hechos
                 and k not in bloqueadas]
    cola_ok = [k for k in orden if k not in hechos and k not in bloqueadas]
    return [k for k in rojas_ok + [k for k in cola_ok if k not in rojas_ok]
            if k not in ajenas]


def barrido(args, est, tope):
    """Repasa publicadas que no constan en verde y repara las que fallan.

    El ledger dice qué se publicó; esto dice qué sigue sirviendo bien. Va por
    cursor (`sweep_i`) y guarda cada verde, así que se corta y se reanuda sin
    repetir trabajo. Devuelve cuántas quedaron verdes en esta pasada.
    """
    if tope <= 0:
        return 0
    claves = [k for k in cola() if k in publicado()]
    pend = [k for k in claves if not est["verde"].get(k) and k not in est["bloqueadas"]]
    if not pend:
        return 0
    i = est["sweep_i"] % len(pend)
    verdes = 0
    for _ in range(min(tope, len(pend))):
        clave = pend[i % len(pend)]
        i += 1
        est["sweep_i"] = i % len(pend)
        guardar_estado(est)
        if not reclamar(clave, args.carril):
            continue                      # la está repasando el otro carril
        ok, detalle, malas, ciego = verificar(clave, args.corte_auditoria, args.sin_chat, args.carril)
        if ciego:
            log(f"   barrido {clave}: sin veredicto ({detalle}) → para la próxima")
            liberar(clave, args.carril)
            continue
        if not ok and not args.sin_reparar:
            objetivo = malas or list(SERVICIOS)
            log(f"   barrido {clave}: en rojo ({detalle}) → se republica "
                f"{', '.join(objetivo)}")
            for servicio in objetivo:
                publicar_pagina(clave, servicio, args, est, forzar=True)
            ok, detalle, _, _ = verificar(clave, args.corte_auditoria, args.sin_chat, args.carril)
        if ok:
            est["verde"][clave] = datetime.now().isoformat(timespec="seconds")
            est["rojas"].pop(clave, None)
            verdes += 1
        else:
            est["rojas"][clave] = detalle
        guardar_estado(est)
        liberar(clave, args.carril)
    return verdes


def main():
    ap = argparse.ArgumentParser(description="Relanza el lote tras cada corte y cierra tandas.")
    ap.add_argument("--comunidades", type=int, default=3, help="comunidades por tanda")
    ap.add_argument("--max-tandas", type=int, default=0, help="0 = hasta agotar la cola")
    ap.add_argument("--reintentos", type=int, default=5,
                    help="intentos por página (un corte del entorno no cuenta como fallo)")
    # 280 s salía del tope de ~295 s que el entorno pone a un comando en primer
    # plano, pero el supervisor corre en segundo plano y cada página necesita
    # 210-320 s con tres carriles. Con 280 se mataba al driver justo antes de
    # publicar: cinco intentos por página, todos cortados, y un clon a medio
    # configurar por intento (2026-11-06, tanda de la 09:17).
    # 420 s volvía a quedarse corto con el Chrome recién abierto: cada página
    # tardaba más de 7 min y el corte la mataba justo antes de publicar, tres
    # carriles a la vez, sin un solo verde (2026-11-06, tanda de las 17:14).
    # 900 s es el doble del peor caso medido y deja terminar la publicación.
    ap.add_argument("--corte", type=int, default=900, help="segundos por página antes de relanzar")
    ap.add_argument("--corte-auditoria", type=int, default=200)
    ap.add_argument("--max-vacias", type=int, default=2,
                    help="tandas seguidas sin avanzar antes de rendirse")
    ap.add_argument("--sin-reparar", action="store_true",
                    help="no reintentar la comunidad que sale en rojo en la verificación")
    ap.add_argument("--barrido", type=int, default=2,
                    help="publicadas a repasar por tanda (0 = no repasar)")
    ap.add_argument("--aviso-min", type=int, default=25,
                    help="minutos sin cerrar comunidad antes de avisar de saturación (0 = off)")
    ap.add_argument("--sin-chat", action="store_true",
                    help="deja el widget de chat en none en las páginas que publique")
    ap.add_argument("--plan", action="store_true", help="solo muestra las próximas tandas")
    ap.add_argument("--esperar-cdp", type=int, default=0,
                    help="minutos a esperar a que Chrome vuelva con CDP en 9222")
    ap.add_argument("--carril", type=int, default=0,
                    help="0-2: carriles en paralelo (pestana, estado y puerto propios)")
    ap.add_argument("--puerto", type=int, default=0, help="0 = 8791 + carril")
    ap.add_argument("--estado", default="", help="0 = .tmp-supervisor[-N].json")
    args = ap.parse_args()

    # Cada carril con su estado y su puerto: dos carriles sobre el mismo fichero
    # se pisan las rojas y el cursor del barrido.
    global ESTADO, _PREFIJO
    if not 0 <= args.carril <= 2:
        # Con cuatro la SPA de GHL no hidrata y los clones salen repetidos
        # (2026-11-05): el tope va en el código, no solo en el runbook.
        log("--carril va de 0 a 2: cuatro carriles ya cruzaron paths y clonaron de más")
        return 2
    if args.estado:
        ESTADO = pathlib.Path(args.estado)
        if not ESTADO.is_absolute():
            ESTADO = ROOT / ESTADO
    elif args.carril:
        ESTADO = ROOT / f".tmp-supervisor-{args.carril}.json"
    if not args.puerto:
        args.puerto = PUERTO + args.carril
    _PREFIJO = f"[c{args.carril}] " if args.carril else ""

    est = cargar_estado()
    pendientes = pendientes_de(est, publicado(), args.carril)
    if args.plan:
        tope = args.comunidades * 3
        for i in range(0, min(len(pendientes), tope), args.comunidades):
            log("tanda: " + ", ".join(pendientes[i:i + args.comunidades]))
        log(f"{len(pendientes)} pendientes · {args.comunidades} por tanda · "
            f"{len(set(est['bloqueadas']) | compartidas()[0])} bloqueadas de antes")
        return 0
    if not pendientes:
        log("Cola terminada: no quedan comunidades pendientes.")
        return 0

    # Candado: dos supervisores sobre la misma pestaña de GHL se cruzan los
    # Settings y los paths (fue el incidente de los clones duplicados).
    candado = socket.socket()
    try:
        candado.bind(("127.0.0.1", args.puerto))
        candado.listen(1)
    except OSError:
        log(f"Ya hay un supervisor vivo (puerto {args.puerto} ocupado): este sale sin hacer nada.")
        return 0
    latir(args.carril)

    # Un carril >0 solo es seguro si el 0 corre esta versión (deja latido): con
    # el supervisor viejo no hay reparto de comunidades y se cruzarían.
    if args.carril:
        # El latido del carril 0 puede tardar un par de segundos si los tres se
        # lanzan a la vez: se espera en vez de salir por una carrera de arranque.
        fin_latido = time.time() + 90
        while not latido_vivo(0) and time.time() < fin_latido:
            time.sleep(2)
        if not latido_vivo(0):
            log("El carril 0 no está corriendo la versión con reparto (sin latido): "
                "relánzalo antes de abrir este carril.")
            return 3
        log(f"carril 0 con latido: arranca el carril {args.carril}")

    # El CDP se comprueba ya con el candado tomado: el segundo supervisor tiene
    # que salir por "ya hay uno", no por un diagnóstico de Chrome que confunde.
    if not esperar_cdp(args.esperar_cdp):
        log("El Chrome del CDP (127.0.0.1:9222) no responde: el driver no puede trabajar. "
            "Reabre Chrome con --remote-debugging-port=9222, o relanza con --esperar-cdp N.")
        return 2
    # Solo informa: las pestañas no las cierra este proceso (AGENTS.md).
    if not args.carril:
        pestanas_abiertas()
    # El aviso cuenta desde que este proceso puede publicar: al arrancar no se
    # queja de los verdes de hace horas.
    est["arranque"] = time.time()
    guardar_estado(est)

    tanda_n = len(est["tandas"])
    vacias = 0
    intentos_roja = {}
    while True:
        if args.max_tandas and tanda_n >= args.max_tandas:
            log("Tope de tandas alcanzado.")
            break
        latir(args.carril)
        pendientes = pendientes_de(est, publicado(), args.carril)
        if not pendientes:
            # Cola terminada: se remata el barrido para que no quede ninguna
            # publicada sin verificar (o reparada) antes de cerrar.
            for _ in range(3):
                if not barrido(args, est, 50):
                    break
            log("Cola terminada: no quedan comunidades pendientes.")
            break
        if not esperar_cdp(args.esperar_cdp):
            log("CDP caído: se detiene el supervisor (relánzalo cuando Chrome esté de vuelta).")
            break

        # Tanda con reclamo: si otro carril se quedó una, entra la siguiente.
        tanda = []
        for clave in pendientes:
            if len(tanda) >= args.comunidades:
                break
            if reclamar(clave, args.carril):
                tanda.append(clave)
        if not tanda:
            log("Todas las pendientes están reclamadas por otro carril: nada que hacer.")
            break
        tanda_n += 1
        log(f"== tanda {tanda_n}: {', '.join(tanda)}")
        vigilar(args, est, f"empieza la tanda {tanda_n}")

        for clave in tanda:
            try:
                if clave in publicado():
                    log(f"   {clave}: ya estaba publicada, se salta")
                    continue
                resultados = []
                for servicio in SERVICIOS:
                    r = publicar_pagina(clave, servicio, args, est)
                    resultados.append(r)
                    if r is not True:
                        break
                if clave in publicado():
                    log(f"   {clave}: publicado")
                elif any(r == "corte" for r in resultados):
                    # Solo se cortó el entorno: no se bloquea, sigue pendiente y
                    # la próxima tanda la retoma donde iba.
                    log(f"   {clave}: queda pendiente (solo cortes del entorno)")
                else:
                    est["bloqueadas"][clave] = f"sin publicar tras {args.reintentos} intentos"
                    guardar_estado(est)
                    log(f"   {clave}: BLOQUEADA para revisión manual")
            except Exception as exc:            # noqa: BLE001
                # Una comunidad no puede tumbar la corrida entera (la tanda 1
                # murió por un carácter raro al escribir el log).
                log(f"   {clave}: excepción ({exc}) → se sigue con la siguiente")
            # El reclamo NO se suelta aquí: se suelta al cerrar la tanda, ya
            # verificada. Soltarlo al publicar dejaba que otro carril la retomara
            # mientras este todavía la verificaba y acababa republicándola
            # (dorado/la-cala, 2026-11-06 09:10).
            vigilar(args, est, f"{clave} terminó sin verde")

        cerradas = [k for k in tanda if k in publicado()]
        rojas = []
        for clave in cerradas:
            ok, detalle, malas, ciego = verificar(clave, args.corte_auditoria, args.sin_chat, args.carril)
            if ciego:
                # Ni verde ni rojo: no se bloquea ni se republica a ciegas.
                est["rojas"].pop(clave, None)
                log(f"   {clave}: sin veredicto ({detalle}) → sigue pendiente de verificar")
                continue
            if not ok and not args.sin_reparar:
                objetivo = malas or list(SERVICIOS)
                log(f"   {clave}: en rojo ({detalle}) → se republica {', '.join(objetivo)}")
                for servicio in objetivo:
                    publicar_pagina(clave, servicio, args, est, forzar=True)
                ok, detalle, _, _ = verificar(clave, args.corte_auditoria, args.sin_chat, args.carril)
            if ok:
                est["verde"][clave] = datetime.now().isoformat(timespec="seconds")
                est["rojas"].pop(clave, None)
                continue
            rojas.append((clave, detalle))
            est["rojas"][clave] = detalle
            intentos_roja[clave] = intentos_roja.get(clave, 0) + 1
            if intentos_roja[clave] >= 2:
                # Dos reparaciones seguidas sin verde: no se insiste más (cada
                # una son 2-4 min y puede cruzar paths). A revisión manual.
                est["bloqueadas"][clave] = f"en rojo tras 2 reparaciones: {detalle}"[:200]
                est["rojas"].pop(clave, None)
                log(f"   {clave}: BLOQUEADA en rojo tras 2 reparaciones → revisión manual")

        # Reclamos de la tanda, liberados de golpe y ya verificada.
        for k in tanda:
            liberar(k, args.carril)

        if args.barrido:
            verdes = barrido(args, est, args.barrido)
            if verdes:
                log(f"   barrido: {verdes} publicadas repasadas, en verde")

        est["tandas"].append({"n": tanda_n, "claves": tanda, "cerradas": cerradas,
                              "rojas": {k: d for k, d in rojas},
                              "hora": datetime.now().isoformat(timespec="seconds")})
        guardar_estado(est)

        if cerradas and not rojas:
            anotar(f"- Tanda automática {tanda_n} ({datetime.now():%Y-%m-%d %H:%M}): "
                   f"{', '.join(cerradas)} — contenido y auditoría en verde.")
        elif rojas:
            anotar(f"- Tanda automática {tanda_n} ({datetime.now():%Y-%m-%d %H:%M}): "
                   f"{', '.join(cerradas) or 'ninguna'} — en rojo: "
                   + ", ".join(f"{k} ({d})" for k, d in rojas))
        log(f"== tanda {tanda_n}: {len(cerradas)} cerradas, {len(rojas)} en rojo")

        # Una tanda solo cuenta como vacía si no dejó nada en verde: reparar
        # una roja también es avanzar.
        verde_ahora = {k for k in cerradas if k not in {c for c, _ in rojas}}
        vacias = 0 if verde_ahora else vacias + 1
        if vacias >= args.max_vacias:
            log(f"{vacias} tandas seguidas sin publicar nada: se detiene para revisión.")
            break
        time.sleep(5)

    hechos = publicado()
    log(f"Fin. Ledger: {len(hechos)} publicadas · "
        f"{len([k for k in cola() if k not in hechos])} pendientes · "
        f"{len(est['bloqueadas'])} bloqueadas.")
    return 0 if not est["bloqueadas"] else 1


if __name__ == "__main__":
    sys.exit(main())
