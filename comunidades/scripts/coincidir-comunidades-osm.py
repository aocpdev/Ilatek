#!/usr/bin/env python3
"""Cruza las comunidades LUXURY con los nodos place=* de OpenStreetMap de PR.

Tres consultas a Overpass, todo local despues:

  * los lugares de la isla (place=*);
  * los limites administrativos de nivel 6 (los 78 municipios de PR);
  * los limites de nivel 9 (los barrios), para afinar el punto cuando el
    lugar OSM es el mismo barrio que la comunidad.

Un emparejado es exacto solo si se cumplen las dos condiciones:

  * el nombre del lugar coincide exactamente (sin tildes ni mayusculas);
  * el punto cae dentro del poligono del municipio (ray casting sobre la
    geometria oficial), no "cerca" del centroide.

Si no hay coincidencia exacta la comunidad queda sin punto propio y el mapa
la lista dentro de su municipio: no se inventa ninguna coordenada.

Salida: data/_coordenadas-comunidades.json
"""
import json
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
UA = "IlatekComunidades/1.0 (https://ilatekpr.com)"
OVERPASS = "https://overpass-api.de/api/interpreter"
OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
BBOX = "(17.85,-67.35,18.55,-65.15)"
QUERY_LUGARES = ('[out:json][timeout:180];'
                 'node["place"~"^(hamlet|village|town|suburb|neighbourhood|neighborhood'
                 '|quarter|isolated_dwelling|locality)$"]'
                 + BBOX + ';out center;')
QUERY_MUNI = ('[out:json][timeout:240];'
              'rel["boundary"="administrative"]["admin_level"="6"]'
              + BBOX + ';out geom;')
QUERY_BARRIOS = ('[out:json][timeout:240];'
                 'rel["boundary"="administrative"]["admin_level"="9"]'
                 + BBOX + ';out geom;')

PLACE_TYPES = {"hamlet", "village", "town", "suburb", "neighbourhood", "neighborhood",
               "quarter", "isolated_dwelling", "locality"}


def norm(text):
    text = unicodedata.normalize("NFKD", str(text or ""))
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return " ".join(text.split())


def descargar(query, destino):
    """Descarga de Overpass con cache en disco."""
    if os.path.exists(destino) and os.path.getsize(destino) > 1000:
        print(f"cache: {destino}", flush=True)
        return json.load(open(destino, encoding="utf-8"))
    for endpoint in OVERPASS_MIRRORS:
        url = endpoint + "?" + urllib.parse.urlencode({"data": query})
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=300) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as exc:
            print(f"  overpass {endpoint} fallo: {exc}", flush=True)
            time.sleep(5)
            continue
        json.dump(data, open(destino, "w", encoding="utf-8"), ensure_ascii=False)
        print(f"descargado de {endpoint}: {len(data.get('elements', []))} elementos", flush=True)
        return data
    raise SystemExit(f"No se pudo descargar {destino}")


def punto_en_anillo(lat, lon, ring):
    """Ray casting: el punto cae dentro del anillo (exterior)."""
    dentro = False
    n = len(ring)
    for i in range(n - 1):
        y1, x1 = ring[i]
        y2, x2 = ring[i + 1]
        if (y1 > lat) != (y2 > lat):
            x_int = (x2 - x1) * (lat - y1) / (y2 - y1) + x1
            if lon < x_int:
                dentro = not dentro
    return dentro


def punto_en_poligono(lat, lon, anillos_exteriores, anillos_interiores):
    """Dentro de un poligono multipartes: en algun exterior y en ningun interior."""
    if not any(punto_en_anillo(lat, lon, r) for r in anillos_exteriores):
        return False
    return not any(punto_en_anillo(lat, lon, r) for r in anillos_interiores)


def geometria_poligonos(element):
    """Devuelve (exteriores, interiores) de una relacion con geometria.

    Overpass entrega cada *way* del poligono por separado y en orden, asi que
    hay que coser los tramos en anillos cerrados antes de usar el ray casting.
    """
    def coser(members):
        anillos, actual = [], []
        for member in members:
            geom = member.get("geometry") or []
            if len(geom) < 2:
                continue
            tramo = [(p["lat"], p["lon"]) for p in geom]
            if actual and actual[-1] != tramo[0]:
                tramo.reverse()
            actual.extend(tramo)
            if actual[0] == actual[-1]:
                anillos.append(actual)
                actual = []
        if len(actual) >= 3:
            if actual[0] != actual[-1]:
                actual.append(actual[0])
            anillos.append(actual)
        return anillos

    exteriores, interiores = [], []
    outer_members, inner_members = [], []
    for member in element.get("members", []):
        if member.get("role") == "inner":
            inner_members.append(member)
        else:
            outer_members.append(member)
    exteriores = coser(outer_members)
    interiores = coser(inner_members)
    return exteriores, interiores


def cargar_municipios(ruta):
    """Nombre del municipio -> poligono oficial."""
    data = json.load(open(ruta, encoding="utf-8"))
    out = {}
    for el in data.get("elements", []):
        name = (el.get("tags") or {}).get("name")
        if not name:
            continue
        ext, inte = geometria_poligonos(el)
        if not ext:
            continue
        out.setdefault(norm(name), []).append({"name": name, "outer": ext, "inner": inte})
    return out


def main():
    db = json.load(open(os.path.join(ROOT, "master-database.json"), encoding="utf-8"))
    records = db["records"] if isinstance(db, dict) else db
    lux = [r for r in records if r.get("priority") == "LUXURY"]
    muni_coords = json.load(open(os.path.join(ROOT, "data", "_coordenadas-municipios.json"),
                                 encoding="utf-8"))

    osm = descargar(QUERY_LUGARES, os.path.join(ROOT, "data", "_osm-lugares-pr.json"))
    muni_raw = descargar(QUERY_MUNI, os.path.join(ROOT, "data", "_municipios-osm.json"))
    poligonos = cargar_municipios(os.path.join(ROOT, "data", "_municipios-osm.json"))
    print(f"municipios con poligono: {len(poligonos)}", flush=True)

    # Indices de lugares por nombre normalizado.
    by_name = {}
    for el in osm.get("elements", []):
        tags = el.get("tags", {})
        name, ptype = tags.get("name"), tags.get("place")
        if not name or ptype not in PLACE_TYPES:
            continue
        lat = el.get("lat") or (el.get("center") or {}).get("lat")
        lon = el.get("lon") or (el.get("center") or {}).get("lon")
        if lat is None or lon is None:
            continue
        by_name.setdefault(norm(name), []).append(
            {"lat": lat, "lon": lon, "type": ptype, "osmId": el.get("id"),
             "county": tags.get("is_in:county") or tags.get("county")})

    out, sin_coincidencia = {}, []
    for i, rec in enumerate(lux, 1):
        slug, muni = rec["slug"], rec["municipalitySlug"]
        muni_polys = poligonos.get(norm(rec["municipality"]), [])
        candidatos = by_name.get(norm(rec["name"]), [])
        chosen, motivo = None, None
        for cand in candidatos:
            dentro = False
            for poly in muni_polys:
                if punto_en_poligono(cand["lat"], cand["lon"], poly["outer"], poly["inner"]):
                    dentro = True
                    break
            if not dentro:
                motivo = "fuera del municipio"
                continue
            if chosen is None:
                chosen = cand
            else:
                # Si hay varios, gana el mas especifico (hamlet > suburb).
                orden = {"hamlet": 0, "village": 0, "town": 0, "locality": 1,
                         "neighbourhood": 2, "neighborhood": 2, "quarter": 2,
                         "suburb": 3, "isolated_dwelling": 3}
                if orden.get(cand["type"], 9) < orden.get(chosen["type"], 9):
                    chosen = cand
        if chosen:
            out[slug] = {"status": "exacta", "lat": round(chosen["lat"], 6),
                         "lon": round(chosen["lon"], 6), "osmType": chosen["type"],
                         "osmId": chosen["osmId"], "source": "OpenStreetMap (Overpass)",
                         "municipality": rec["municipality"]}
        else:
            base = muni_coords.get(muni)
            out[slug] = {"status": "aproximada",
                         "lat": base["lat"] if base else None,
                         "lon": base["lon"] if base else None,
                         "source": "centroide del municipio (Wikipedia)",
                         "municipality": rec["municipality"]}
            sin_coincidencia.append({
                "slug": slug, "name": rec["name"], "municipality": rec["municipality"],
                "candidatosOSM": [{"lat": c["lat"], "lon": c["lon"], "type": c["type"]}
                                  for c in candidatos],
                "motivo": motivo or "sin lugar OSM con ese nombre",
            })
        print(f"  [{i}/{len(lux)}] {muni}/{slug} -> {out[slug]['status']}"
              f"{'' if chosen else '  (' + (motivo or 'sin coincidencia') + ')'}", flush=True)

    payload = {"generatedAt": time.strftime("%Y-%m-%d"), "municipios": muni_coords,
               "comunidades": out}
    path = os.path.join(ROOT, "data", "_coordenadas-comunidades.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)
    review = os.path.join(ROOT, "data", "_sin-coincidencia.json")
    with open(review, "w", encoding="utf-8") as fh:
        json.dump(sin_coincidencia, fh, ensure_ascii=False, indent=1)
    exact = sum(1 for v in out.values() if v["status"] == "exacta")
    print(f"escrito {path} | exactas: {exact} | aproximadas: {len(out) - exact}")
    print(f"revision manual: {review} ({len(sin_coincidencia)} sin coincidencia exacta)")


if __name__ == "__main__":
    sys.exit(main())
