#!/usr/bin/env python3
"""Segunda pasada: resuelve con Nominatim las comunidades que OSM no tiene como place=*.

El dato sigue viniendo de OpenStreetMap, pero con la busqueda por texto de
Nominatim, que tambien indexa areas `landuse=residential` (urbanizaciones) y no
solo los nodos `place=*`.

Reglas para aceptar un resultado:

  * el nombre devuelto coincide exactamente con el nombre de la comunidad o con
    alguno de sus nombres alternos (sin el prefijo "Urb." / "Cond." / "The");
  * el punto cae dentro del poligono del municipio (ray casting), no "cerca";
  * el tipo del elemento es de superficie (residential, place, suburb...) y no
    una calle, un edificio o un comercio.

Las consultas se cachean en disco para no repetir la red.
"""
import json
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

import importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

_spec = importlib.util.spec_from_file_location(
    "coincidir", os.path.join(HERE, "coincidir-comunidades-osm.py"))
_coincidir = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_coincidir)
norm = _coincidir.norm
cargar_municipios = _coincidir.cargar_municipios
punto_en_poligono = _coincidir.punto_en_poligono
descargar = _coincidir.descargar
QUERY_MUNI = _coincidir.QUERY_MUNI
UA = "IlatekComunidades/1.0 (https://ilatekpr.com)"
NOMINATIM = "https://nominatim.openstreetmap.org/search"
CACHE = os.path.join(ROOT, "data", "_nominatim-cache.json")

PREFIXES = ("urb ", "urbanizacion ", "cond ", "condominio ", "the ", "sector ",
             "residencial ", "bo ", "barrio ", "comunidad ")

# Tipos de elemento que representan un lugar (no una calle ni un comercio).
TIPOS_OK = {"residential", "neighbourhood", "neighborhood", "suburb", "hamlet",
             "village", "town", "locality", "quarter", "isolated_dwelling",
             "island", "farm", "city_block", "neighbourhood"}


def limpiar_alias(nombre):
    n = norm(nombre)
    for p in PREFIXES:
        if n.startswith(p):
            n = n[len(p):]
            break
    return n


def claves_de_busqueda(rec):
    """Nombre y alternos normalizados, sin prefijos."""
    claves = []
    for bruto in [rec.get("name", "")] + str(rec.get("alternates") or "").split(";"):
        bruto = bruto.strip()
        if not bruto:
            continue
        k = limpiar_alias(bruto)
        if k and k not in claves:
            claves.append(k)
    return claves


def consultar(texto):
    params = {"q": texto, "format": "jsonv2", "limit": "8"}
    url = NOMINATIM + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA,
                                               "Accept-Language": "es"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    db = json.load(open(os.path.join(ROOT, "master-database.json"), encoding="utf-8"))
    records = db["records"] if isinstance(db, dict) else db
    coords_path = os.path.join(ROOT, "data", "_coordenadas-comunidades.json")
    payload = json.load(open(coords_path, encoding="utf-8"))
    pendientes = [r for r in records
                  if r.get("priority") == "LUXURY"
                  and payload["comunidades"].get(r["slug"], {}).get("status") != "exacta"]

    descargar(QUERY_MUNI, os.path.join(ROOT, "data", "_municipios-osm.json"))
    poligonos = cargar_municipios(os.path.join(ROOT, "data", "_municipios-osm.json"))
    cache = json.load(open(CACHE, encoding="utf-8")) if os.path.exists(CACHE) else {}

    print(f"pendientes: {len(pendientes)}", flush=True)
    resueltos = 0
    for i, rec in enumerate(pendientes, 1):
        slug, muni = rec["slug"], rec["municipality"]
        polys = poligonos.get(norm(muni), [])
        claves = claves_de_busqueda(rec)
        found = None
        for clave in claves:
            texto = f"{clave}, {muni}, Puerto Rico"
            if texto in cache:
                resultados = cache[texto]
            else:
                try:
                    resultados = consultar(texto)
                except Exception as exc:
                    print(f"  [{i}/{len(pendientes)}] {muni}/{slug} consulta fallo: {exc}", flush=True)
                    time.sleep(4)
                    continue
                cache[texto] = resultados
                time.sleep(1.1)
            for res in resultados:
                nombre = norm(res.get("name") or res.get("display_name", "").split(",")[0])
                tipo = res.get("type") or res.get("category") or ""
                if tipo not in TIPOS_OK:
                    continue
                if nombre not in claves:
                    continue
                try:
                    lat, lon = float(res["lat"]), float(res["lon"])
                except (KeyError, ValueError):
                    continue
                dentro = False
                for poly in polys:
                    if punto_en_poligono(lat, lon, poly["outer"], poly["inner"]):
                        dentro = True
                        break
                if not dentro:
                    continue
                found = {"lat": round(lat, 6), "lon": round(lon, 6),
                         "osmType": tipo, "osmId": res.get("osm_id"),
                         "osmName": res.get("name")}
                break
            if found:
                break
        if found:
            payload["comunidades"][slug] = {
                "status": "exacta", "lat": found["lat"], "lon": found["lon"],
                "osmType": found["osmType"], "osmId": found["osmId"],
                "osmName": found["osmName"], "municipality": muni,
                "source": "OpenStreetMap (Nominatim)"}
            resueltos += 1
            print(f"  [{i}/{len(pendientes)}] {muni}/{slug} -> exacta "
                  f"({found['osmName']} / {found['osmType']})", flush=True)
        else:
            print(f"  [{i}/{len(pendientes)}] {muni}/{slug} -> sin coincidencia", flush=True)
        with open(CACHE, "w", encoding="utf-8") as fh:
            json.dump(cache, fh, ensure_ascii=False)

    with open(coords_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)
    exact = sum(1 for v in payload["comunidades"].values() if v["status"] == "exacta")
    total = len(payload["comunidades"])
    print(f"escrito {coords_path} | exactas: {exact}/{total} | resueltas en esta pasada: {resueltos}")


if __name__ == "__main__":
    sys.exit(main())
