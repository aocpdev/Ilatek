#!/usr/bin/env python3
"""Mapeo sitemap GHL -> archivo canonico tokenizado del repo.

Uso:
  python Ilatek/tools/qa/ghl_paste_map.py [https://juncos.ilatekpr.com]

Salida (stdout):
- tabla URL -> archivo canonico (para el checklist de repaste)
- resumen: cubiertos / sin-mapeo / lotes sugeridos (2-3 paginas por lote)

Reglas de mapeo (rutas vistas en el sitemap real de un location):
  "/" o "/home*"              -> Ilatek/home/es/landing-pages/ghl-home-multiservicios.html
  "/servicios" , "/servicios-techos", "/servi*"      -> landing de la categoria correspondiente
  "/<slug>"                   -> Ilatek/servicios/<slug>/es/landing-pages/ghl-<slug>-landing.html
                                 o  Ilatek/categorias/<slug>/es/landing-pages/ghl-<slug>-landing.html
  paginas utilitarias (error, gracias, terminos, privacidad, cotizacion,
  contactanos, reclutamiento, resenas) -> archivo canonico conocido si existe
"""
from __future__ import annotations

import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

from repo_root import REPO

HOME = REPO / "home" / "es" / "landing-pages" / "ghl-home-multiservicios.html"

# Paginas no-servicio conocidas y sus servidores de archivos
UTIL = {
    "terminos-y-condiciones": REPO / "terminos-y-condiciones" / "ILATEK-Terminos-Condiciones.html",
    "politica-de-privacidad": REPO / "politica-de-privacidad" / "ILATEK-Politica-Privacidad.html",
    "resenas": REPO / "resenas" / "ghl-resenas-landing.html",
    "cotizacion": REPO / "cotizador" / "landing-pages" / "ghl-cotizador-landing.html",
    "contactanos": REPO / "contacto" / "landing-pages" / "ghl-contacto-landing.html",
}
# Paginas construidas con elementos NATIVOS del builder GHL (sin Custom Code):
# el runtime no aplica, no llevan canónico del repo (verde en el sweep con 0 crudos).
NATIVA_GHL = {
    "error-ilatek-404",
    "reclutamiento-empleo",
    "reclutamiento-empleo-gracias-por-aplicar",
    "cotizacion-techos",
    "reclutamiento-empleo-techos",
    "cotizacion",
    "contactanos",
}
# Rutas de categoria/servicios-categoria (dir categorias)
CATEGORIA = {
    "servicios-techos": REPO / "categorias" / "techos" / "es" / "landing-pages",
    "servicios-limpieza": REPO / "categorias" / "limpieza" / "es" / "landing-pages",
    "limpieza-residencial": REPO / "categorias" / "limpieza-residencial" / "es" / "landing-pages",
    "limpieza-comercial": REPO / "categorias" / "limpieza-comercial" / "es" / "landing-pages",
    "limpieza-industrial": REPO / "categorias" / "limpieza-industrial" / "es" / "landing-pages",
}


def landing_file(dirpath: Path, slug: str) -> Path | None:
    if not dirpath.exists():
        return None
    cand = dirpath / f"ghl-{slug}-landing.html"
    if cand.exists():
        return cand
    h = sorted(p for p in dirpath.glob("*.html"))
    return h[0] if h else None


def map_path(path: str) -> tuple[Path | None, str]:
    seg = path.strip("/").lower()
    if not seg or seg == "home" or re.match(r"^home-\d+$", seg) or seg.startswith("home-"):
        return HOME, ""
    slug = seg.split("?")[0].rstrip("/")
    # 1) slug completo sin tocar (evita romper nombres con digitos propios, ej. 404)
    hit, tag = _lookup(slug, "")
    if hit is not None or tag == "NATIVA-GHL":
        return hit, tag
    # 2) clon de GHL: base + sufijo numerico (slug-123456 o slug-123-456)
    m = re.match(r"^(.*\D)-\d+(?:-\d+)*$", slug)
    if m:
        hit2, _ = _lookup(m.group(1), "CLON-GHL")
        if hit2 is not None:
            return hit2, "CLON-GHL"
    return None, ""


def _lookup(slug: str, tag: str) -> tuple[Path | None, str]:
    if slug in NATIVA_GHL:
        return None, "NATIVA-GHL"
    if slug in UTIL:
        p = UTIL[slug]
        return (p if p.exists() else None), tag
    if slug in NATIVA_GHL:
        return None, "NATIVA-GHL"
    if slug in CATEGORIA:
        return landing_file(CATEGORIA[slug], slug.replace("servicios-", "")), tag
    for tier in ("servicios", "categorias"):
        if (REPO / tier / slug).exists():
            return landing_file(REPO / tier / slug / "es" / "landing-pages", slug), tag
    return None, ""


def fetch_sitemap(domain: str) -> list[str]:
    url = domain.rstrip("/") + "/sitemap.xml"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    xml = urllib.request.urlopen(req, timeout=25).read().decode("utf-8", "replace")
    return [
        loc.text.strip()
        for loc in ET.fromstring(xml).iter()
        if loc.tag.endswith("loc") and loc.text
    ]


def main() -> None:
    domain = sys.argv[1] if len(sys.argv) > 1 else "https://juncos.ilatekpr.com"
    urls = fetch_sitemap(domain)
    rows, missing, native = [], [], []
    for u in urls:
        path = "/" + u.split("/", 3)[-1] if u.count("/") > 2 else "/"
        canon, tag = map_path(path)
        rel = str(canon.relative_to(REPO)) if canon else (tag or "?SIN-MAPPING?")
        row = {"url": u, "path": path, "canon": rel}
        if tag == "NATIVA-GHL":
            native.append(row)
        elif canon:
            rows.append(row)
        else:
            missing.append(row)
    print(f"sitemap {domain}: {len(urls)} paginas; mapeadas {len(rows)}; nativas GHL {len(native)}; sin mapeo {len(missing)}")
    for r in rows:
        print(f"  {r['path']:<34} -> {r['canon']}")
    if native:
        print("\nNATIVAS GHL (builder, sin custom code; no llevan canónico):")
        for r in native:
            print(f"  - {r['path']}")
    if missing:
        print("\nSIN MAPPING:")
        for r in missing:
            print(f"  - {r['path']}")
        sys.exit(2)
    print(json.dumps({"domain": domain, "rows": rows}, ensure_ascii=False)[:1])


if __name__ == "__main__":
    main()
