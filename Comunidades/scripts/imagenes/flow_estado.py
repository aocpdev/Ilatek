"""Lo que toca el disco: recortar la imagen, guardarla y llevar el manifiesto."""
import io
import json
import time

from PIL import Image


def a_16_9(datos):
    """Recorta a 16:9 exacto sin reescalar y devuelve `(bytes, tamaño)`."""
    im = Image.open(io.BytesIO(datos)).convert("RGB")
    a, h = im.size
    if a / h > 16 / 9:
        n = int(h * 16 / 9)
        izq = (a - n) // 2
        im = im.crop((izq, 0, izq + n, h))
    else:
        n = int(a * 9 / 16)
        arr = (h - n) // 2
        im = im.crop((0, arr, a, arr + n))
    buf = io.BytesIO()
    im.save(buf, "PNG", optimize=True)
    return buf.getvalue(), im.size


def guardar_png(salida, archivo, datos):
    """Escribe el PNG de forma atómica.

    Si el proceso muere a mitad, queda el .tmp y no un PNG truncado que después
    nadie puede leer ni reanudar.
    """
    destino = salida / archivo
    borrador = destino.with_suffix(".png.tmp")
    borrador.write_bytes(datos)
    borrador.replace(destino)
    return destino


def guardar_manifiesto(catalogo, salida, manifiesto):
    """Escribe el manifiesto recorriendo la carpeta, no la memoria del proceso.

    El manifiesto se reescribe entero en cada imagen y el lote se relanza a
    menudo, así que armarlo con lo que el proceso recuerda deja basura: claves
    de imágenes ya borradas y errores de reintentos viejos. Aquí la carpeta es
    la única verdad: entra cada PNG que existe, con su servicio y la fecha real
    del archivo, y no entra nada más.

    La clave es el nombre del archivo porque es lo único que no se repite: hay
    comunidades homónimas en pueblos distintos, así que `slug` y
    `comunidadSlug` se repiten (Vista Verde en Aguadilla y en Naguabo).
    """
    disco = {p.name for p in salida.glob("*.png")}
    nuevo = {}
    for p in catalogo:
        if p["archivo"] not in disco:
            continue
        ruta = salida / p["archivo"]
        # Un PNG truncado no debe tumbar el guardado: si no se puede leer la
        # cabecera, la entrada igual se escribe (el archivo existe y el lote lo
        # saltaría) pero sin tamaño, en vez de congelar el manifiesto entero.
        try:
            with Image.open(ruta) as im:
                tam = list(im.size)
        except OSError:
            tam = None
        nuevo[p["archivo"]] = {
            "name": p["name"],
            "municipality": p["municipality"],
            "servicio": p["servicio"],
            "slug": p["slug"],
            "via": "flow",
            "tamano": tam,
            "fecha": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(ruta.stat().st_mtime)),
        }
    manifiesto.write_text(json.dumps(nuevo, ensure_ascii=False, indent=1), encoding="utf8")
    return nuevo
