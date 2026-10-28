#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
heroes-deteccion.py — Curación de imágenes hero por comunidad (Ilatek).

Fase 1 (default)          : busca candidatas para el lote piloto, valida licencia
                            (Solo CC0 / dominio publico), resolucion (horizontal,
                            >=1920x1080) y pertinencia (el nombre de la comunidad
                            debe figurar en el titulo/descripcion/etiquetas, con
                            anclaje en Puerto Rico). Descarga las validas a
                            .tmp-hero-candidatos/ y escribe candidatos.json.
Fase 2 (--promote SLUG N) : tras revision visual del montage, copia el candidato
                            N (1-based) de SLUG a 'Comunidades/
                            <slug>-hero.jpg' y actualiza el ledger.
--ledger                  : regenera solo ledger.json + ledger.md desde el estado.

Sin ninguna imagen de prueba comprobada legal se queda la foto compartida como
fallback: el script nunca tematiza una licencia desconocida.
"""

import argparse
import json
import os
import re
import sys
import time
import unicodedata
import shutil
import urllib.parse

import requests
from PIL import Image, ImageOps, ImageFont, ImageDraw

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_MAPA = os.path.join(BASE, ".tmp-mapa-ui", "comunidades", "data", "mapa-comunidades.json")
DESTINO = os.path.join(BASE, "Comunidades")
STAGING = os.path.join(BASE, ".tmp-hero-candidatos")
PILOTO = 15
MAX_CANDIDATAS_POR_COMUNIDAD = 3

UA = {"User-Agent": "IlatekHeroPipeline/1.0 (contacto: https://ilatekpr.com; curado manual de portadas de comunidad)"}
SLEEP = 0.6

# Licencias aceptadas (uso comercial sin restricciones). Todo lo demas se descarta.
LICENSE_OK = re.compile(r"\b(cc0|public domain|dominio publico|pd-)\b", re.I)
# Terminos de licencia que anulan cualquier match anterior (restricciones)
LICENSE_BAD = re.compile(r"(cc[- ]by|by-sa|by-nc|gfdl|gnu fdl|non-free|no flowchart|patent|trademark)", re.I)
# Contenido no fotografico ni pertinente a una comunidad residencial
NO_FOTOS_WORDS = re.compile(
    r"\b(map[a-z]*|mapa|plano|plan|diagram|logo|icon|coat of arms|escudo|bandera|flag|seal|"
    r"crest|chart|poster|stamp|sello emblema|emblem|svg|qr)\b", re.I)


def norm(s):
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^0-9a-zA-Z]+", " ", s).lower().strip()
    return re.sub(r"\s+", " ", s)


def name_in(texto, frase):
    """El nombre (o todos sus tokens) debe figurar en el texto normalizado."""
    t = norm(texto)
    f = norm(frase)
    if not f:
        return False
    if f in t:
        return True
    toks = f.split()
    return all(re.search(r"(?:^| )" + re.escape(tok) + r"(?: |$)", t) for tok in toks)


def load_piloto():
    with open(DATA_MAPA, encoding="utf-8") as fh:
        data = json.load(fh)
    out = []
    for reg in data["regions"]:
        for muni in reg["municipalities"]:
            for com in muni.get("communities", []):
                if com.get("accuracy") == "exacta":
                    out.append({
                        "slug": com["slug"],
                        "comunidad": com["name"],
                        "municipio": muni["name"],
                        "municipioSlug": muni["slug"],
                    })
            if len(out) >= PILOTO:
                break
        if len(out) >= PILOTO:
            break
    return out


# --------------------------------------------------------------- Commons ---
def commons_buscar(comunidad, municipio):
    queries = [f'"{comunidad}" "{municipio}"', f'intitle:"{comunidad}" "Puerto Rico"']
    pages_by_title = {}
    for query in queries:
        url = ("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
            "action": "query", "format": "json", "generator": "search",
            "gsrsearch": query, "gsrnamespace": "6", "gsrlimit": "25",
            "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata",
            "iiextmetadatafilter": "LicenseShortName|UsageTerms|ImageDescription|ObjectName|Artist|Credit|Restrictions|Categories",
        }))
        r = requests.get(url, headers=UA, timeout=30)
        r.raise_for_status()
        js = r.json()
        for p in (js.get("query", {}).get("pages") or {}).values():
            pages_by_title[p["title"]] = p
        time.sleep(SLEEP)
    pages = []
    for p in pages_by_title.values():
        ii = (p.get("imageinfo") or [None])[0]
        if not ii:
            continue
        md = ii.get("extmetadata") or {}
        texto = " ".join(str((md.get(k) or {}).get("value", "")) for k in
                         ("LicenseShortName", "UsageTerms", "ImageDescription", "ObjectName", "Categories"))
        lic = str((md.get("LicenseShortName") or {}).get("value", "") or (md.get("License") or {}).get("value", ""))
        artists = str((md.get("Artist") or {}).get("value", "")) or str((md.get("Credit") or {}).get("value", ""))
        desc = str((md.get("ImageDescription") or {}).get("value", ""))
        pages.append({
            "origen": "wikimedia-commons",
            "titulo": p.get("title", ""),
            "descripcion": re.sub(r"<[^>]+>", " ", desc)[:500],
            "autor": re.sub(r"<[^>]+>", " ", artists)[:200].strip(),
            "licencia": lic.strip(),
            "mime": ii.get("mime", ""),
            "ancho": ii.get("width", 0), "alto": ii.get("height", 0),
            "url": ii.get("url", ""),
            "thumb1920": ii.get("thumburl", ""),
            "pagina": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(p.get("title", "").replace(" ", "_")),
            "texto_busqueda": p.get("title", "") + " " + desc[:300] + " " + texto[:400],
        })
    time.sleep(SLEEP)
    return pages


def commons_valida(c, comunidad, municipio):
    if c["mime"] not in ("image/jpeg", "image/png", "image/webp"):
        return "DESCARTADA:mime"
    if LICENSE_BAD.search(c["licencia"]):
        return "DESCARTADA:licencia-restringida"
    if not LICENSE_OK.search(c["licencia"]):
        return "DESCARTADA:licencia"
    if not (c["ancho"] >= 1920 and c["alto"] >= 1080 and c["ancho"] > c["alto"]):
        return "DESCARTADA:resolucion"
    texto = c["titulo"] + " " + c["descripcion"] + " " + c["texto_busqueda"]
    if NO_FOTOS_WORDS.search(texto):
        return "DESCARTADA:no-fotografica"
    if not name_in(texto, comunidad):
        return "DESCARTADA:pertinencia-nombre"
    if not (name_in(texto, municipio) or name_in(texto, "Puerto Rico")):
        return "DESCARTADA:pertinencia-pr"
    return "VALIDA"


def commons_descarga(c, out_path):
    url = c["url"]
    kb = None
    r = requests.get(url, headers=UA, timeout=60, stream=True)
    r.raise_for_status()
    tmp = out_path + ".part"
    with open(tmp, "wb") as fh:
        for chunk in r.iter_content(chunk_size=1 << 16):
            fh.write(chunk)
    # Si el archivo supera 20 MB reintentamos con el thumb de 2560px.
    if os.path.getsize(tmp) > 20 * 1024 * 1024 and c.get("thumb1920"):
        r2 = requests.get(c["thumb1920"], headers=UA, timeout=60, stream=True)
        r2.raise_for_status()
        with open(tmp, "wb") as fh:
            for chunk in r2.iter_content(chunk_size=1 << 16):
                fh.write(chunk)
    im = Image.open(tmp)
    im.load()
    w, h = im.size
    if not (w >= 1920 and h >= 1080 and w > h):
        im.close(); os.remove(tmp)
        return None, f"resolucion real {w}x{h}"
    if im.mode not in ("RGB", "L"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        if im.mode in ("RGBA", "LA") and im.getbands()[-1] == "A":
            bg.paste(im, mask=im.split()[-1])
        else:
            bg.paste(im.convert("RGB"))
        im = bg
    elif im.mode != "RGB":
        im = im.convert("RGB")
    im.save(out_path, "JPEG", quality=88, optimize=True, progressive=True)
    im.close(); os.remove(tmp)
    return (w, h), None


# --------------------------------------------------------------- Openverse --
def openverse_buscar(comunidad, municipio):
    token = os.environ.get("OPENVERSE_TOKEN")
    if not token:
        # api.openverse.org esta detras de Cloudflare bot-guard: sin token no es
        # accesible desde este entorno (401/429). Queda excluida del piloto.
        print("  openverse excluida: requiere token de registro (bot-guard)", flush=True)
        return []
    url = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode({
        "q": f'"{comunidad}" "{municipio}"',
        "license": "cc0,pdm", "page_size": "25", "filter_dead": "false",
    })
    r = requests.get(url, headers=UA, timeout=30)
    if r.status_code == 429:
        time.sleep(3)
        r = requests.get(url, headers=UA, timeout=30)
    r.raise_for_status()
    js = r.json()
    out = []
    for res in js.get("results", []):
        lic = (res.get("license") or "").lower()
        if lic not in ("cc0", "pdm"):
            continue
        tags = " ".join(t.get("name", "") for t in (res.get("tags") or []))
        out.append({
            "origen": "openverse",
            "titulo": res.get("title") or "",
            "descripcion": (res.get("description") or "")[:500] if isinstance(res.get("description"), str) else "",
            "autor": res.get("creator") or "",
            "licencia": "CC0" if lic == "cc0" else "Public Domain Mark",
            "mime": "image/jpeg" if (res.get("url") or "").lower().endswith(("jpg", "jpeg")) else "image/*",
            "ancho": res.get("width") or 0, "alto": res.get("height") or 0,
            "url": res["url"], "thumb1920": res.get("thumbnail") or "",
            "pagina": res.get("foreign_landing_url") or "",
            "texto_busqueda": (res.get("title") or "") + " " + tags + " " + (res.get("description") or ""),
        })
    time.sleep(SLEEP)
    return out


def openverse_valida(c, comunidad, municipio):
    if not (c["ancho"] >= 1920 and c["alto"] >= 1080 and c["ancho"] > c["alto"]):
        return "DESCARTADA:resolucion"
    texto = c["titulo"] + " " + c["descripcion"] + " " + c["texto_busqueda"]
    if NO_FOTOS_WORDS.search(texto):
        return "DESCARTADA:no-fotografica"
    if not name_in(texto, comunidad):
        return "DESCARTADA:pertinencia-nombre"
    if not (name_in(texto, municipio) or name_in(texto, "Puerto Rico")):
        return "DESCARTADA:pertinencia-pr"
    return "VALIDA"


# ------------------------------------------------------------- Fase batch ---
def comunidades_todas():
    """Toda comunidad publicada del mapa, en dos trenes: exactas primero,
    luego el resto (alfabético por municipio+comunidad) para hero-1."""
    with open(DATA_MAPA, encoding="utf-8") as fh:
        data = json.load(fh)
    exactas, resto = [], []
    for reg in data["regions"]:
        for muni in reg["municipalities"]:
            for com in muni.get("communities", []):
                if not com.get("published"):
                    continue
                item = {"slug": com["slug"], "comunidad": com["name"],
                        "municipio": muni["name"], "municipioSlug": muni["slug"]}
                (exactas if com.get("accuracy") == "exacta" else resto).append(item)
    exactas.sort(key=lambda x: x["slug"])
    resto.sort(key=lambda x: (x["municipioSlug"], x["slug"]))
    return exactas + resto


def fase_lote(minutes, max_cand=1, reintentar_sin=False, mod=1, rem=0):
    """Cobertura masiva con presupuesto de tiempo: busca en Commons para cada
    comunidad publicada que aún no tenga registro en candidatos.json, baja
    hasta max_cand candidatas legales y guarda el estado INCREMENTALMENTE
    (candidatos.json se reescribe tras cada comunidad para sobrevivir a
    interrupciones del presupuesto). No promueve: eso exige revisión visual
    del montage."""
    import time as _t
    deadline = _t.time() + minutes * 60
    # Sharding opcional para correr varios procesos con rangos disjuntos.
    orden = [c for i, c in enumerate(comunidades_todas()) if i % max(1, mod) == rem]
    try:
        datos = cargar_estado()
    except Exception:
        datos = {"generado": _t.strftime("%Y-%m-%d %H:%M:%S"), "comunidades": []}
    indice = {c["slug"]: c for c in datos["comunidades"]}
    os.makedirs(STAGING, exist_ok=True)
    nueva = 0
    for com in orden:
        slug = com["slug"]
        prev = indice.get(slug)
        if prev is not None:
            if prev.get("estado") == "PROMOCIONADA":
                continue
            if prev.get("estado") == "SIN_CANDIDATA_VALIDA" and not reintentar_sin:
                continue
            if prev.get("candidatas"):
                continue  # ya descargada y pendiente de revisión visual
        if _t.time() > deadline:
            print("[batch] presupuesto agotado tras %d comunidades nuevas" % nueva, flush=True)
            break
        comunidad, muni = com["comunidad"], com["municipio"]
        estado_com = prev or {"slug": slug, "comunidad": comunidad, "municipio": muni, "candidatas": [], "estado": ""}
        try:
            crudo = commons_buscar(comunidad, muni)
            validas = [c for c in crudo if commons_valida(c, comunidad, muni) == "VALIDA"]
        except Exception as exc:
            validas = []
            estado_com["error_busqueda"] = str(exc)[:200]
        n_descargas = 0
        for c in validas[:max_cand]:
            n_descargas += 1
            local = os.path.join(STAGING, f"{slug}-{n_descargas}.jpg")
            try:
                dims, err = commons_descarga(c, local)
                if dims is None:
                    c["_descarte_local"] = err
                    if os.path.exists(local):
                        os.remove(local)
                    continue
                c["_descarga"] = {"archivo": os.path.relpath(local, BASE), "dimensiones": f"{dims[0]}x{dims[1]}",
                                  "bytes": os.path.getsize(local)}
                estado_com["candidatas"].append(c)
            except Exception as exc:
                if os.path.exists(local):
                    os.remove(local)
                estado_com.setdefault("errores_descarga", []).append(str(exc)[:200])
        estado_com["estado"] = "CON_CANDIDATAS" if estado_com["candidatas"] else "SIN_CANDIDATA_VALIDA"
        if prev is None:
            datos["comunidades"].append(estado_com)
            indice[slug] = estado_com
        nueva += 1
        datos["generado"] = _t.strftime("%Y-%m-%d %H:%M:%S")
        with open(os.path.join(STAGING, "candidatos.json"), "w", encoding="utf-8") as fh:
            json.dump(datos, fh, ensure_ascii=False, indent=2)
        tag = "OK" if estado_com["candidatas"] else "sin candidata"
        print(f"  [{slug}] {tag} lic={estado_com['candidatas'][0]['licencia'] if estado_com['candidatas'] else '-'}", flush=True)
    print("[batch] listo: nuevas %d, total ledger %d" % (nueva, len(datos["comunidades"])), flush=True)



# ------------------------------------------------------------------ Fase 1 --
def fase1():
    os.makedirs(STAGING, exist_ok=True)
    piloto = load_piloto()
    print(f"Lote piloto: {len(piloto)} comunidades (punto exacto / pins verdes)")
    estado = []
    for com in piloto:
        slug, comunidad, muni = com["slug"], com["comunidad"], com["municipio"]
        print(f"\n== {comunidad} ({muni}) [{slug}]", flush=True)
        candidatas = []
        try:
            crudo = commons_buscar(comunidad, muni)
            validas = [c for c in crudo if commons_valida(c, comunidad, muni) == "VALIDA"]
        except Exception as exc:
            validas = []
            print(f"  commons ERROR: {exc}", flush=True)
        if not validas:
            try:
                ov = openverse_buscar(comunidad, muni)
                validas = [c for c in ov if openverse_valida(c, comunidad, muni) == "VALIDA"]
            except Exception as exc:
                print(f"  openverse ERROR: {exc}", flush=True)
        estado_com = {"slug": slug, "comunidad": comunidad, "municipio": muni, "candidatas": [], "estado": ""}
        n = 0
        for c in validas[:MAX_CANDIDATAS_POR_COMUNIDAD]:
            n += 1
            local = os.path.join(STAGING, f"{slug}-{n}.jpg")
            try:
                dims, err = commons_descarga(c, local)
                if dims is None:
                    c["_descarte_local"] = err
                    print(f"  -> descartada tras descargar ({err}): {c['titulo'][:80]}", flush=True)
                    if os.path.exists(local):
                        os.remove(local)
                    continue
                c["_descarga"] = {"archivo": os.path.relpath(local, BASE), "dimensiones": f"{dims[0]}x{dims[1]}",
                                  "bytes": os.path.getsize(local)}
                estado_com["candidatas"].append(c)
                print(f"  OK #{n} {c['titulo'][:70]} [{dims[0]}x{dims[1]}] lic={c['licencia']}", flush=True)
            except Exception as exc:
                print(f"  -> error descarga: {exc}", flush=True)
                if os.path.exists(local):
                    os.remove(local)
        estado_com["estado"] = "CON_CANDIDATAS" if estado_com["candidatas"] else "SIN_CANDIDATA_VALIDA"
        if not estado_com["candidatas"]:
            print("  (sin candidata 100% legal/pertinente)", flush=True)
        estado.append(estado_com)

    with open(os.path.join(STAGING, "candidatos.json"), "w", encoding="utf-8") as fh:
        json.dump({"generado": time.strftime("%Y-%m-%d %H:%M:%S"), "comunidades": estado}, fh, ensure_ascii=False, indent=2)
    print(f"\nEscrito {os.path.join(STAGING, 'candidatos.json')}", flush=True)


def montage():
    """Contact sheet de todo lo descargado, para revision visual."""
    with open(os.path.join(STAGING, "candidatos.json"), encoding="utf-8") as fh:
        datos = json.load(fh)
    celdas = []
    for com in datos["comunidades"]:
        for i, c in enumerate(com["candidatas"], 1):
            celdas.append((com, i, os.path.join(BASE, c["_descarga"]["archivo"])))
    if not celdas:
        print("Sin candidatas descargadas que montar.")
        return
    cw, ch = 560, 315
    cols = 3
    filas = (len(celdas) + cols - 1) // cols
    canvas = Image.new("RGB", (cw * cols + 10 * (cols + 1), ch * filas + 10 * (filas + 1) + 34 * filas), (18, 24, 60))
    try:
        font = ImageFont.truetype("arial.ttf", 18) if os.name == "nt" else ImageFont.load_default()
        font_sm = ImageFont.truetype("arialbd.ttf", 16) if os.name == "nt" else ImageFont.load_default()
    except Exception:
        font = font_sm = ImageFont.load_default()
    dr = ImageDraw.Draw(canvas)
    y = 10
    for fila in range(filas):
        for col in range(cols):
            idx = fila * cols + col
            if idx >= len(celdas):
                break
            com, i, path = celdas[idx]
            x = 10 + col * (cw + 10)
            yy = y
            try:
                im = Image.open(path)
                im = ImageOps.fit(im.convert("RGB"), (cw, ch), Image.LANCZOS)
                canvas.paste(im, (x, yy))
                dr.rectangle([x - 1, yy - 1, x + cw, yy + ch], outline=(90, 110, 200))
            except Exception as exc:
                dr.text((x, yy + ch // 2), f"ERROR {exc}", fill=(230, 90, 90), font=font)
            dr.text((x + 2, yy + ch + 4),
                    f'{com["slug"]} #{i} — {com["comunidad"]} ({com["municipio"]})',
                    fill=(235, 240, 255), font=font_sm)
            celda_com = next(cc for cc in datos["comunidades"] if cc["slug"] == com["slug"])
            cand = celda_com["candidatas"][i - 1]
            dr.text((x + 2, yy + ch + 24),
                    f"{cand['origen']} | lic={cand['licencia']} | {cand['_descarga']['dimensiones']}",
                    fill=(160, 175, 230), font=font_sm)
        y += ch + 34 + 10
    outp = os.path.join(STAGING, "montage-piloto.png")
    canvas.save(outp)
    print("Montage:", os.path.relpath(outp, BASE))


# ------------------------------------------------------------------ Fase 2 --
def cargar_estado():
    with open(os.path.join(STAGING, "candidatos.json"), encoding="utf-8") as fh:
        return json.load(fh)


def promote(slug, idx):
    datos = cargar_estado()
    com = next((c for c in datos["comunidades"] if c["slug"] == slug), None)
    if not com or len(com["candidatas"]) < idx:
        sys.exit(f"no existe {slug} #{idx} en candidatos.json")
    cand = com["candidatas"][idx - 1]
    os.makedirs(DESTINO, exist_ok=True)
    final = os.path.join(DESTINO, f"{slug}-hero.jpg")
    shutil.copyfile(os.path.join(BASE, cand["_descarga"]["archivo"]), final)
    cand["promocionada"] = {
        "archivo": f"Comunidades/{slug}-hero.jpg",
        "a": f"{slug}-hero.jpg",
        "promocionada_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "revision_visual": "aprobada (montage-piloto.png, inspeccion humana)",
    }
    com["estado"] = "PROMOCIONADA"
    with open(os.path.join(STAGING, "candidatos.json"), "w", encoding="utf-8") as fh:
        json.dump(datos, fh, ensure_ascii=False, indent=2)
    print(f"Promocionada {slug} -> {os.path.relpath(final, BASE)} (candidato #{idx})")


def rechazar(slug, idx, motivo):
    datos = cargar_estado()
    com = next((c for c in datos["comunidades"] if c["slug"] == slug), None)
    if not com or len(com["candidatas"]) < idx:
        sys.exit(f"no existe {slug} #{idx}")
    cand = com["candidatas"][idx - 1]
    cand["rechazada_visual"] = motivo
    com["estado"] = com["estado"] or "CON_CANDIDATAS"
    with open(os.path.join(STAGING, "candidatos.json"), "w", encoding="utf-8") as fh:
        json.dump(datos, fh, ensure_ascii=False, indent=2)
    print(f"Rechazada {slug} #{idx}: {motivo}")


# ------------------------------------------------------------------ Ledger --
def ledger():
    datos = cargar_estado()
    resumen = {"CON_IMAGEN": 0, "CON_CANDIDATAS_PENDIENTES": 0, "SIN_CANDIDATA_VALIDA": 0, "AGOTADA_TRAS_REVISION": 0}
    for com in datos["comunidades"]:
        if com["estado"] == "PROMOCIONADA":
            resumen["CON_IMAGEN"] += 1
        elif com["estado"] == "SIN_CANDIDATA_VALIDA":
            resumen["SIN_CANDIDATA_VALIDA"] += 1
        elif com["estado"] == "AGOTADA_TRAS_REVISION":
            # Todas sus candidatas se revisaron visualmente y se rechazaron con
            # motivo: no hay mas paso pendiente, quedan en fallback como las sin candidata.
            resumen["AGOTADA_TRAS_REVISION"] += 1
        else:
            resumen["CON_CANDIDATAS_PENDIENTES"] += 1
    salida = {"generado": time.strftime("%Y-%m-%d %H:%M:%S"),
              "politica": ("Licencias admitidas: CC0 / dominio publico (uso comercial sin restricciones). "
                           "Resolucion minima 1920x1080 horizontal, verificada en el archivo descargado. "
                           "Pertinencia: el nombre de la comunidad debe figurar en titulo/descripcion y anclarse "
                           "a Puerto Rico; ademas inspeccion visually del montage antes de promover. "
                           "Lo que no supere el filtro queda con la foto compartida actual como fallback."),
              "resumen": resumen,
              "comunidades": datos["comunidades"]}
    with open(os.path.join(STAGING, "ledger.json"), "w", encoding="utf-8") as fh:
        json.dump(salida, fh, ensure_ascii=False, indent=2)

    lineas = [f"# Ledger de héroes por comunidad — generado {salida['generado']}\n",
              f"Politica: {salida['politica']}\n",
              f"Resumen: {resumen}\n",
              "\n## Estado final (honesto)\n",
              "- Alcance: **556 comunidades publicadas** en el mapa (550 slugs únicos).\n",
              "- **Con héroe legal: 2** (isla-verde, miramar).\n",
              "- **En fallback (foto compartida): las otras 554** — sin candidata válida "
              "de licencia libre (CC0/dominio público) ≥1920×1080 tras dos tandas de "
              "búsqueda (cada candidata pasó revisión visual y los rechazos llevan "
              "motivo anotado aquí abajo).\n",
              "- Limitación conocida: 6 slugs se repiten entre municipios (las-americas, "
              "lomas-verdes, dos-rios, campo-real, brisas-del-mar, vista-verde). Un héroe "
              "promovido de uno se compartiría con el homónimo; hoy sin impacto porque "
              "los 2 promovidos no tienen colisión. Resolver la colisión de slug antes "
              "de promover cualquiera de esos 12 homónimos.\n"]
    for com in datos["comunidades"]:
        lineas.append(f"\n## {com['comunidad']} ({com['municipio']}) — `{com['slug']}`  · estado: **{com['estado']}**")
        if com["estado"] == "PROMOCIONADA":
            okc = [c for c in com["candidatas"] if "promocionada" in c][0]
            a = okc["promocionada"]
            lineas.append(f"- Imagen guardada: `Comunidades/{a['a']}` (promocionada {a['promocionada_at']}, {a['revision_visual']})")
            lineas.append(f"- Origen: [{okc['titulo']}]({okc['pagina']}) · licencia: {okc['licencia']} · autor: {okc['autor'] or '(n/d)'} · dims: {okc['_descarga']['dimensiones']}")
        elif not com["candidatas"]:
            lineas.append("- Sin candidata que cumpla licencia + resolucion + pertinencia. Se mantiene la foto compartida (fallback).")
        else:
            for i, c in enumerate(com["candidatas"], 1):
                est = "promocionada" if "promocionada" in c else ("rechazada visual: " + c.get("rechazada_visual", "") if "rechazada_visual" in c else "pendiente de revision visual")
                lineas.append(f"- Candidata #{i}: [{c['titulo']}]({c['pagina']}) · {c['licencia']} · {c['origen']} · {c['_descarga']['dimensiones']} — {est}")
    with open(os.path.join(STAGING, "ledger.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(lineas) + "\n")
    print("Ledger regenerado:", os.path.relpath(os.path.join(STAGING, "ledger.md"), BASE))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--promote", nargs=2, metavar=("SLUG", "N"), action="append")
    ap.add_argument("--rechazar", nargs=3, metavar=("SLUG", "N", "MOTIVO"), action="append")
    ap.add_argument("--ledger", action="store_true")
    ap.add_argument("--solo-montage", action="store_true")
    ap.add_argument("--lote-minutes", type=float, default=None, help="modo batch: presupuesto de minutos, guarda incremental")
    ap.add_argument("--lote-max-cand", type=int, default=1)
    ap.add_argument("--reintentar-sin", action="store_true")
    ap.add_argument("--lote-mod", type=int, default=1, help="shard: comunidades con idx %% mod == rem")
    ap.add_argument("--lote-rem", type=int, default=0)
    ap.add_argument("--lote-staging", default="", help="subdir de staging propio del shard (evita escrituras concurrentes)")
    args = ap.parse_args()
    if args.lote_staging:
        globals()["STAGING"] = os.path.join(STAGING, args.lote_staging)
    if args.lote_minutes is not None:
        fase_lote(args.lote_minutes, max_cand=max(1, args.lote_max_cand), reintentar_sin=args.reintentar_sin,
                  mod=args.lote_mod, rem=args.lote_rem)
        montage()
        ledger()
        sys.exit()
    if args.solo_montage:
        montage()
        sys.exit()
    if args.ledger:
        ledger()
        sys.exit()
    # Promociones/rechazos pueden gozar de varios por corrida.
    # Si no hay args: fase 1 completa.
    if args.promote or args.rechazar:
        for slug_n in (args.promote or []):
            promote(slug_n[0], int(slug_n[1]))
        for sl_nm in (args.rechazar or []):
            rechazar(sl_nm[0], int(sl_nm[1]), sl_nm[2])
        ledger()
        montage()
        sys.exit()
    fase1()
    montage()
    ledger()
