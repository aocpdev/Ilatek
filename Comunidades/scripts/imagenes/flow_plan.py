"""Qué toca generar: identidad de cada comunidad, selección y orden de la cola.

Es cálculo puro sobre el catálogo y lo que hay en disco: no abre navegador, no
escribe imágenes ni sabe de Playwright. La autocomprobación vive aquí al lado
porque prueba justo estas decisiones.
"""
import pathlib
import shutil
import tempfile
import unicodedata

RANGO = {"LUXURY": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}


def clave_comunidad(p):
    """Identidad real de una comunidad: nombre + municipio.

    `comunidadSlug` se arma con el nombre, y el nombre se repite entre pueblos
    (Vista Verde en Aguadilla y en Naguabo). Usarlo como clave junta dos
    comunidades distintas: si una tiene el par completo, la otra nunca se ve a
    medias. Nombre + municipio es la misma identidad que llevan el nombre del
    archivo y el manifiesto.
    """
    return (p["name"], p["municipality"])


def _normalizar(texto):
    """Compara sin acentos, mayúsculas ni espacios de sobra."""
    plano = unicodedata.normalize("NFKD", str(texto))
    limpio = "".join(c for c in plano if not unicodedata.combining(c))
    return " ".join(limpio.split()).lower()


def seleccionar(prompts, texto):
    """Resuelve `slug` o `slug@Municipio`, separados por coma, sin adivinar.

    Un slug se repite entre pueblos (Vista Verde en Aguadilla y en Naguabo),
    así que elegir «el primero que coincida» regenera o pisa el par de la
    comunidad equivocada sin avisar. Si el slug es ambiguo y no trae municipio,
    se rechaza nombrando los candidatos; devuelve `(elegidos, faltas)`.
    """
    elegidos, faltas = [], []
    for trozo in (t.strip() for t in texto.split(",")):
        if not trozo:
            continue
        slug, _, municipio = trozo.partition("@")
        candidatos = [p for p in prompts if _normalizar(p["slug"]) == _normalizar(slug)]
        if not candidatos:
            faltas.append(f"no hay ninguna comunidad con el slug {slug!r}")
            continue
        if municipio:
            candidatos = [
                p for p in candidatos
                if _normalizar(p["municipality"]) == _normalizar(municipio)
            ]
            if not candidatos:
                pueblos = sorted({p["municipality"] for p in prompts
                                  if _normalizar(p["slug"]) == _normalizar(slug)})
                faltas.append(f"{slug!r} no está en {municipio!r}; está en {', '.join(pueblos)}")
                continue
        if len(candidatos) > 1:
            donde = sorted({f"{p['name']} ({p['municipality']})" for p in candidatos})
            faltas.append(
                f"{slug!r} es ambiguo: coincide con {', '.join(donde)}. "
                f"Añade el municipio, por ejemplo {slug}@{candidatos[0]['municipality']}"
            )
            continue
        if candidatos[0]["archivo"] not in {p["archivo"] for p in elegidos}:
            elegidos.append(candidatos[0])
    return elegidos, faltas


def construir_cola(prompts, pedidos, salida):
    """Los pendientes en el orden en que los quiere el lote.

    Primero las comunidades con media pareja (una de sus dos imágenes), luego
    por nivel LUXURY, HIGH y el resto. Devuelve pares `(prompt, a_medias)` para
    que quien imprima el plan no tenga que recalcular la clasificación.

    Es el único cálculo de cola: lo usan el lote y la autocomprobación, así que
    probar el orden es probar el que corre de verdad.
    """
    tiene = {}
    for p in prompts:
        if (salida / p["archivo"]).exists():
            tiene.setdefault(clave_comunidad(p), set()).add(p["servicio"])
    prioridad = {clave_comunidad(p): p["priority"] for p in prompts}
    cola = [
        (p, len(tiene.get(clave_comunidad(p), ())) == 1)
        for p in pedidos
        if not (salida / p["archivo"]).exists()
    ]
    cola.sort(key=lambda par: (
        0 if par[1] else 1,
        RANGO.get(prioridad.get(clave_comunidad(par[0]), ""), 9),
        par[0]["name"], par[0]["municipality"], par[0]["servicio"],
    ))
    return cola


def autocomprobar(prompts, salida):
    """Revisa el orden de la cola sin navegador ni red. Devuelve los fallos.

    Arma una carpeta temporal con los homónimos reales del catálogo —dos
    comunidades con el mismo nombre en pueblos distintos, cada una con una sola
    de sus dos imágenes—, una LUXURY sin empezar y otra con el par entero. Sirve
    para lo que un fallo silencioso se lleva por delante: si alguien vuelve a
    agrupar por nombre, los pares incompletos se van al fondo sin error visible.
    """
    fallos = 0

    def revisar(ok, mensaje):
        nonlocal fallos
        print(("  ok    " if ok else "  FALLA ") + mensaje)
        if not ok:
            fallos += 1

    catalogo = {(p["name"], p["municipality"], p["servicio"]): p for p in prompts}
    # Cada homónimo trae una sola imagen; la pareja que falta es la que el orden
    # tiene que adelantar, y es la que una clave por nombre esconde.
    mitades = [
        ("Vista Verde", "Aguadilla", "techos", "limpieza"),
        ("Vista Verde", "Naguabo", "limpieza", "techos"),
        ("Campo Real", "Arecibo", "limpieza", "techos"),
        ("Campo Real", "Las Piedras", "techos", "limpieza"),
    ]
    arranque = ("Livingston Estates", "Dorado")   # LUXURY sin ninguna imagen
    completa = ("AMANÉ Estates", "Río Grande")     # LUXURY con su par entero
    necesarias = [catalogo[(n, m, s)] for n, m, s, _ in mitades]
    necesarias += [catalogo[completa + (s,)] for s in ("techos", "limpieza")]
    if any(clave + (s,) not in catalogo for clave in (arranque,) for s in ("techos", "limpieza")):
        print("  FALLA el catálogo ya no trae los casos de nombres repetidos")
        return 1

    tmp = pathlib.Path(tempfile.mkdtemp())
    try:
        # La cola solo mira si el archivo existe, así que basta un archivo vacío.
        for p in necesarias:
            (tmp / p["archivo"]).write_bytes(b"")
        cola = construir_cola(prompts, prompts, tmp)
        pares = {p["archivo"]: par for p, par in cola}

        print("homónimos con media pareja:")
        for nombre, municipio, _, falta in mitades:
            p = catalogo[(nombre, municipio, falta)]
            revisar(
                pares.get(p["archivo"]) is True,
                f"{nombre} ({municipio}) pone su pareja pendiente como par a medias",
            )

        pos_mitad = [i for i, (_, par) in enumerate(cola) if par]
        pos_arranque = [
            i for i, (p, _) in enumerate(cola)
            if (p["name"], p["municipality"]) == arranque
        ]
        revisar(
            bool(pos_mitad) and bool(pos_arranque) and max(pos_mitad) < min(pos_arranque),
            "los pares a medias van delante de una LUXURY sin empezar",
        )
        revisar(
            not any(par for p, par in cola if (p["name"], p["municipality"]) == arranque),
            "la LUXURY sin empezar no se marca a medias",
        )
        revisar(
            not any((p["name"], p["municipality"]) == completa for p, _ in cola),
            "la comunidad con el par entero no entra en la cola",
        )
    finally:
        shutil.rmtree(tmp)

    print("selección por --slugs:")
    elegidos, faltas = seleccionar(prompts, "vista-verde-techos@aguadilla")
    revisar(
        len(elegidos) == 1 and elegidos[0]["municipality"] == "Aguadilla" and not faltas,
        "el slug con municipio elige una sola comunidad, sin importar mayúsculas",
    )
    elegidos, faltas = seleccionar(prompts, "vista-verde-techos")
    revisar(
        not elegidos and len(faltas) == 1
        and "Aguadilla" in faltas[0] and "Naguabo" in faltas[0],
        "el slug ambiguo se rechaza y nombra los pueblos que coinciden",
    )
    elegidos, faltas = seleccionar(prompts, "alturas-de-adjuntas-techos")
    revisar(
        len(elegidos) == 1 and not faltas,
        "un slug que no se repite se acepta sin municipio",
    )
    elegidos, faltas = seleccionar(prompts, "vista-verde-techos@Mayagüez")
    revisar(
        not elegidos and faltas and "Aguadilla" in faltas[0],
        "un municipio que no tiene esa comunidad se rechaza",
    )
    elegidos, faltas = seleccionar(prompts, "comunidad-que-no-existe")
    revisar(not elegidos and faltas, "un slug inexistente se rechaza")

    print(f"carpeta real ({salida.name}):")
    disco = {}
    for p in prompts:
        if (salida / p["archivo"]).exists():
            disco.setdefault(clave_comunidad(p), set()).add(p["servicio"])
    real = construir_cola(prompts, prompts, salida)
    marcas = [par for _, par in real]
    revisar(
        all(par == (len(disco.get(clave_comunidad(p), ())) == 1) for p, par in real),
        f"cada marca coincide con el disco ({len(disco)} comunidades, {marcas.count(True)} a medias)",
    )
    revisar(
        marcas == sorted(marcas, reverse=True),
        f"ningún par completo se cuela delante de uno a medias ({len(real)} pendientes)",
    )
    return fallos
