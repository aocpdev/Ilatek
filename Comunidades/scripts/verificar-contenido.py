#!/usr/bin/env python3
"""Verificación de contenido de las comunidades publicadas.

Comprueba, página por página, que lo que está en vivo es el embed de SU
payload y no el de otra página, y que su imagen social es la suya. El check
fuerte es de identidad exacta: el HTML del payload tiene que aparecer
*verbatim* dentro de la página publicada (el driver lo inyecta tal cual).

  - status 200
  - el embed de su payload aparece verbatim en la página viva
  - 0 frases exclusivas del servicio hermano de su comunidad
  - 0 frases exclusivas de otra comunidad del municipio, mismo servicio
  - `og:image` presente y distinta de la de cualquier otra página comprobada
  - `<link rel="canonical">` presente y apuntando a esa misma página

Las frases cubren lo que la identidad exacta no ve: texto de otra página
pegado sin su embed. Se comparan solo frases *exclusivas* de la otra página,
porque las de plantilla (CTA, pie, aviso) se repiten a propósito.

Uso:

    python scripts/verificar-contenido.py                      # todas las publicadas
    python scripts/verificar-contenido.py --only dorado/the-isles
    python scripts/verificar-contenido.py --list .tmp-pendientes.txt
    python scripts/verificar-contenido.py --payload-root ../.tmp-payload

Solo hace HTTP: no necesita el Chrome de GHL ni Playwright, así que corre
también donde el driver no puede.

Códigos de salida (los mismos que `auditar-publicadas.py`):

    0  todas las páginas en verde
    1  alguna página con fallos
    2  el filtro no devolvió ninguna página (no es un aprobado)
"""

import argparse
import html
import json
import pathlib
import re
import ssl
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]      # .../Comunidades
BASE = "https://comunidades.ilatekpr.com"
SERVICIOS = ("sellado-de-techo", "limpieza")
MIN_FRASE, MAX_FRASE = 60, 220


# --- payloads --------------------------------------------------------------

def cargar_payloads(root, municipios):
    """{clave: payload} de las comunidades pedidas (todo el árbol por defecto)."""
    datos = {}
    for f in sorted(pathlib.Path(root).glob("*/*.json")):
        if municipios and f.parent.name not in municipios:
            continue
        datos[f"{f.parent.name}/{f.stem}"] = json.loads(f.read_text(encoding="utf-8"))
    return datos


def html_de(payload, path):
    for p in payload.get("pages", []):
        if p.get("path") == path:
            return p.get("html", "")
    return ""


# --- texto -----------------------------------------------------------------

def texto_plano(fragmento):
    fragmento = re.sub(r"<(script|style)\b.*?</\1>", " ", fragmento, flags=re.S | re.I)
    fragmento = re.sub(r"<[^>]+>", " ", fragmento)
    return re.sub(r"\s+", " ", html.unescape(fragmento)).strip().lower()


def frases(fragmento):
    """Frases de contenido de un HTML, sin script/style."""
    return {f.strip() for f in re.split(r"(?<=[.!?])\s+", texto_plano(fragmento))
            if MIN_FRASE < len(f.strip()) < MAX_FRASE}


def exclusivas(otro_html, mi_html):
    """Frases de `otro_html` que no están en el mío: si aparecen, se colaron."""
    mias = texto_plano(mi_html)
    return [f for f in frases(otro_html) if f not in mias]


# --- veredicto -------------------------------------------------------------

def revisar_pagina(html_propio, html_hermano, html_vecinas, vivo):
    """Fallos de una página viva contra su propio payload."""
    fallos = []
    if not html_propio:
        return ["el payload de esa página no tiene embed"]
    if html_propio not in vivo:
        fallos.append("el embed publicado no es el de su payload")

    pag = texto_plano(vivo)
    coladas = [f for f in exclusivas(html_hermano, html_propio) if f in pag]
    if coladas:
        fallos.append(f"{len(coladas)} frases del servicio hermano")

    for vecina in html_vecinas:
        ajenas = [f for f in exclusivas(vecina, html_propio) if f in pag]
        if ajenas:
            fallos.append(f"{len(ajenas)} frases de otra comunidad del municipio")
            break
    return fallos


def revisar_og(og, vistos):
    """Fallos de la imagen social; `vistos` mapea og -> página que ya la usa."""
    if not og:
        return ["sin og:image"]
    if og in vistos:
        return [f"og:image repetida con {vistos[og]}"]
    return []


def codigo_salida(paginas, fallos):
    """Contrato: vacío no es verde, y cualquier fallo es 1."""
    if paginas == 0:
        return 2
    return 1 if fallos else 0


# --- red -------------------------------------------------------------------

def descargar(url):
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (ilatek-contenido)"})
    try:
        with urllib.request.urlopen(req, timeout=45, context=ctx) as res:
            return res.status, res.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        return exc.code, ""


def og_de(vivo):
    for tag in re.findall(r"<meta\b[^>]*>", vivo, re.I):
        if "og:image" in tag.lower():
            m = re.search(r'content="([^"]*)"', tag, re.I)
            if m:
                return m.group(1)
    return ""


def canonical_de(vivo):
    """href del `<link rel="canonical">` de la página viva, o ""."""
    for tag in re.findall(r"<link\b[^>]*>", vivo, re.I):
        if "canonical" in tag.lower():
            m = re.search(r'href="([^"]*)"', tag, re.I)
            if m:
                return m.group(1)
    return ""


def revisar_canonical(canonical, esperado):
    """Cada página declara SU url; el canonical de la hermana no vale."""
    if not canonical:
        return ["sin canonical"]
    if canonical.rstrip("/") != esperado.rstrip("/"):
        return [f"canonical apunta a {canonical}"]
    return []


# --- selección -------------------------------------------------------------

def seleccionar(index_path, pedidas):
    """Claves publicadas del ledger, restringidas a `pedidas` si se pasaron."""
    idx = json.loads(pathlib.Path(index_path).read_text(encoding="utf-8"))
    publicadas = [f"{f['municipalitySlug']}/{f['slug']}" for f in idx["funnels"]
                  if f.get("status") == "publicado"]
    if not pedidas:
        return publicadas, []
    fuera = [k for k in pedidas if k not in publicadas]
    return [k for k in pedidas if k in publicadas], fuera


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--only", action="append", default=[],
                    help="comunidad municipio/comunidad; repetible")
    ap.add_argument("--list", help="archivo con comunidades, una por línea")
    ap.add_argument("--payload-root", default=str(ROOT / "data" / "ghl" / "funnels"),
                    help="árbol de payloads a usar (por defecto el del repo)")
    ap.add_argument("--index", default=str(ROOT / "data" / "ghl" / "index.json"))
    args = ap.parse_args(argv)

    pedidas = list(args.only)
    if args.list:
        pedidas += [l.strip() for l in pathlib.Path(args.list).read_text(encoding="utf-8").splitlines()
                    if l.strip()]
    claves, fuera = seleccionar(args.index, pedidas)
    for k in fuera:
        print(f"   aviso: {k} no figura como `publicado` en el ledger; se omite")
    if not claves:
        print("No hay páginas que verificar con ese filtro (revisa --only / el ledger).")
        return 2

    payloads = cargar_payloads(args.payload_root, {k.split("/")[0] for k in claves})
    faltan = [k for k in claves if k not in payloads]
    if faltan:
        print(f"No encuentro el payload de: {', '.join(faltan)} (--payload-root)")
        return 2

    total = fallos_tot = 0
    ogvistos = {}      # og -> "clave/servicio"
    for clave in claves:
        pay = payloads[clave]
        mun = pay.get("municipalitySlug")
        vecinas = {path: [html_de(d, path) for k, d in payloads.items()
                          if d.get("municipalitySlug") == mun and k != clave]
                   for path in SERVICIOS}
        print(f"\n* {clave} · {pay.get('community', clave.split('/')[1])}")
        for path in SERVICIOS:
            url = f"{BASE}/{clave}/{path}"
            st, vivo = descargar(url)
            total += 1
            if st != 200:
                print(f"   FALLA {path:18} HTTP {st}  {url}")
                fallos_tot += 1
                continue
            hermano = "limpieza" if path == "sellado-de-techo" else "sellado-de-techo"
            fallos = revisar_pagina(html_de(pay, path), html_de(pay, hermano),
                                    vecinas[path], vivo)
            og = og_de(vivo)
            fallos += revisar_og(og, ogvistos)
            ogvistos.setdefault(og, f"{clave}/{path}")
            fallos += revisar_canonical(canonical_de(vivo), f"{BASE}/{clave}/{path}")
            if fallos:
                fallos_tot += 1
                print(f"   FALLA {path:18} {len(vivo)//1024:>3}KB  {'; '.join(fallos)}")
            else:
                print(f"   OK    {path:18} {len(vivo)//1024:>3}KB  og={og.split('/')[-1][-14:]}")

    print(f"\n{total - fallos_tot}/{total} páginas en verde"
          + (f" - {fallos_tot} con fallos" if fallos_tot else ""))
    return codigo_salida(total, fallos_tot)


if __name__ == "__main__":
    sys.exit(main())
