"""Prueba controlada del cambio de cuenta, sin tocar la tanda real."""
import importlib.util
import pathlib
import sys
import types

AQUI = pathlib.Path(__file__).resolve().parent


def cargar(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, AQUI / archivo)
    modulo = importlib.util.module_from_spec(spec)
    sys.modules[nombre] = modulo
    spec.loader.exec_module(modulo)
    return modulo


fn = cargar("flow_navegador", "flow_navegador.py")
ui = cargar("flow_ui", "flow-ui.py")
ui.CUENTA_ACTIVA = AQUI / "cuenta-activa-prueba.json"


class Sesion:
    url = ""


class Pg:
    pass


def montar(cuenta, cambio, login=False, espera=True, indice="2", cuenta_tras=None):
    llamadas = {"cambio": [], "abrir": []}
    estado = {"cuenta": cuenta}
    fn.cuenta = lambda pg: estado["cuenta"]
    fn.cambiar_cuenta = lambda pg, correo, indices=6: (llamadas["cambio"].append(correo) or cambio)
    fn.en_login = lambda pg: login
    def esperar(pg, minutos=20):
        # Al entrar de verdad, la etiqueta de la cuenta cambia en la pestaña.
        if espera and cuenta_tras:
            estado["cuenta"] = cuenta_tras
        return espera

    fn.esperar_sesion = esperar
    fn.indice_de_cuenta = lambda pg: indice

    def abrir(pg, authuser=""):
        llamadas["abrir"].append(authuser)
        if cuenta_tras:
            estado["cuenta"] = cuenta_tras
        return "https://flow.google.com/u/%s/project/x" % (authuser or "0")

    fn.abrir_proyecto = abrir
    return llamadas, estado


ARGS = types.SimpleNamespace(espera=0)
CUENTAS = ["o.melendez1991@gmail.com", "fullnessfrequency@gmail.com", "osvaldodmelendez@gmail.com"]
ACTUAL = "Cuenta de Google: Osvaldo (o.melendez1991@gmail.com)"
fallos = 0


def comprobar(nombre, obtenido, esperado):
    global fallos
    bien = obtenido == esperado
    print(("OK  " if bien else "MAL ") + "%s: %r (esperado %r)" % (nombre, obtenido, esperado))
    if not bien:
        fallos += 1


# 1. SinImagen -> siguiente cuenta -> reintento de la MISMA comunidad
llamadas, _ = montar(ACTUAL, cambio=1)
intentos = {"n": 0}


def genera_una_vez_mal(sesion, p, etiqueta, prompts):
    intentos["n"] += 1
    if intentos["n"] == 1:
        raise fn.SinImagen("no aparecio imagen")


r = ui.procesar_comunidad({"name": "Parque", "municipality": "Ponce"}, "1/3 Parque",
                          Sesion(), Pg(), ARGS, CUENTAS, set(),
                          generar=genera_una_vez_mal, prompts=[])
comprobar("SinImagen salta de cuenta y reintenta la misma comunidad", (r, intentos["n"]), ("ok", 2))
comprobar("salta a la siguiente de la cadena", llamadas["cambio"], ["fullnessfrequency@gmail.com"])

# 2. cuota agotada -> mismo camino
llamadas, _ = montar(ACTUAL, cambio=1)
intentos = {"n": 0}


def genera_cuota(sesion, p, etiqueta, prompts):
    intentos["n"] += 1
    if intentos["n"] == 1:
        raise fn.CuotaAgotada("limite de cuota")


comprobar("cuota con aviso salta de cuenta",
          ui.procesar_comunidad({}, "2/3 X", Sesion(), Pg(), ARGS, CUENTAS, set(),
                                generar=genera_cuota, prompts=[]), "ok")

# 3. sin cuentas libres -> para
montar("Cuenta de Google: Osvaldo (osvaldodmelendez@gmail.com)", cambio=None)


def genera_sin(sesion, p, etiqueta, prompts):
    raise fn.SinImagen("sin imagen")


comprobar("sin cuentas libres el lote para",
          ui.procesar_comunidad({}, "3/3 Y", Sesion(), Pg(), ARGS, CUENTAS,
                                {"o.melendez1991@gmail.com", "fullnessfrequency@gmail.com"},
                                generar=genera_sin, prompts=[]), "sin-cuentas")

# 4. cuenta sin sesion -> espera login y reanuda conservando /u/N/
llamadas, _ = montar(ACTUAL, cambio=-2, login=True, espera=True, indice="3",
                     cuenta_tras="Cuenta de Google: Osvaldo (fullnessfrequency@gmail.com)")
intentos = {"n": 0}


def genera_login(sesion, p, etiqueta, prompts):
    intentos["n"] += 1
    if intentos["n"] == 1:
        raise fn.SinImagen("sin imagen")


sesion = Sesion()
r = ui.procesar_comunidad({}, "4/3 Z", sesion, Pg(), ARGS, CUENTAS, set(),
                          generar=genera_login, prompts=[])
comprobar("espera el login y reanuda solo", (r, intentos["n"]), ("ok", 2))
comprobar("conserva el indice /u/N/", llamadas["abrir"], ["3"])
comprobar("apunta la cuenta que entrega", sesion.url, "https://flow.google.com/u/3/project/x")

# 5. login que no llega -> para
montar(ACTUAL, cambio=-2, login=True, espera=False)


def genera_mudo(sesion, p, etiqueta, prompts):
    raise fn.SinImagen("sin imagen")


comprobar("login que no llega detiene el lote",
          ui.procesar_comunidad({}, "5/3 W", Sesion(), Pg(), ARGS, CUENTAS, set(),
                                generar=genera_mudo, prompts=[]), "sin-sesion")

# 6. fallo de envio -> reintenta en la MISMA cuenta
llamadas, _ = montar(ACTUAL, cambio=1)
intentos = {"n": 0}


def genera_envio(sesion, p, etiqueta, prompts):
    intentos["n"] += 1
    raise RuntimeError("Flow no arranco la generacion al enviar el prompt")


comprobar("fallo de envio no se cuenta como cuota",
          ui.procesar_comunidad({}, "6/3 V", Sesion(), Pg(), ARGS, CUENTAS, set(),
                                generar=genera_envio, prompts=[]), "fallo")
comprobar("reintenta en la misma cuenta", intentos["n"], 2)
comprobar("no cambia de cuenta por un fallo de envio", llamadas["cambio"], [])

prueba = AQUI / "cuenta-activa-prueba.json"
if prueba.exists():
    prueba.unlink()

print()
print("fallos:", fallos)
sys.exit(1 if fallos else 0)
