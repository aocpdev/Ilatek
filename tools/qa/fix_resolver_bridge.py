#!/usr/bin/env python3
"""Resolvers seccionales: data-* crudos se resuelven contra el puente dv-ghl-values.

Defecto (demostrado por tools/qa/qa_tokenized_headings.mjs, variante bridge-only):
los resolvers embebidos en los canónicos ghl-*-landing.html leen data-location-label,
data-primary-location, data-* de contacto desde los atributos de la sección; esos
atributos llevan el token crudo {{custom_values.*}} (GHL no los expande dentro del
Custom Code), el clean() local lo descarta y h1/h3 caen al literal 'Puerto Rico'.

Fix mínimo y uniforme:
  1. Un script-guía por archivo publicable que lee el puente. Su cuerpo tiene UNA
     definición — bridge/ilatek-bridge.html — y este script la renderiza con
     custom-values.json (slots + separador + min_slots); no hay copia aquí.
  2. En los canónicos, cada statement que alimentaba el mapa de valores con
     clean(attr) pasa a ilBV.attr(attr) || ilBV.slot(N) || fallback. El N sale del
     contrato del puente (custom-values.json), no de una tabla duplicada.
  3. Los walkers propios de cada página (ILATEK_LINKS / ILATEK_GEO / footer)
     exigen `parts.length !== 6`; con el párrafo de 7 slots del contrato
     descartaban el párrafo y los enlaces caían al dominio central. Pasan a
     aceptar min_slots o más (parts.length < min_slots / >= min_slots).
  4. Los titulares y nodos de sección que traían el pueblo horneado
     ("… en Puerto Rico") pasan al MISMO contrato que el h1 y las tarjetas:
     el texto queda con {{custom_values.business__county_name}} y lo resuelve
     el puente. Se salta el texto legal (garantía, términos, privacidad), donde
     "en Puerto Rico" es jurisdicción y no localidad. El JSON-LD queda fuera a
     propósito: no es texto visible y se trata en una pasada aparte.

Los resolvers del pueblo se aplican en TODOS los archivos, no solo en los
canónicos nuevos: un statement ya puenteado no vuelve a coincidir, así que la
pasada sigue siendo idempotente aunque el helper ya viva en el archivo.

Idempotente: un archivo con el marcador ILATEK_BRIDGE ya no se re-parchea, pero su
helper se re-renderiza si difiere del contrato (el pixel es parte del helper).
Con --check no se escribe nada: se exige helper byte a byte, gates tolerantes y
(para canónicos) los resolvers con ilBV.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from repo_root import REPO

HERE = Path(__file__).resolve().parent
CONTRACT = json.loads((HERE / "custom-values.json").read_text(encoding="utf-8"))
SLOTS: list[str] = CONTRACT["bridge"]["slots"]
SEPARATOR: str = CONTRACT["bridge"]["separator"]
MIN: int = int(CONTRACT["bridge"]["min_slots"])
FULL: int = len(SLOTS)


def _plain(key: str) -> dict[str, str]:
    """Bloque del contrato sin las claves de documentación (_doc)."""
    return {k: v for k, v in CONTRACT[key].items() if not k.startswith("_")}


BRAND = _plain("brand")
TOWN_ACCENTS = _plain("town_accents")

# Cabecera única del helper (no cualquier comentario ILATEK de la página).
HELPER_HEAD = "<!-- ILATEK · resolver global del puente"
# Párrafo portador: viaja con el embed y se oculta siempre (nunca es contenido).
CARRIER_HEAD = "<!-- ILATEK · párrafo portador de los custom values"
EXCLUDE_PARTS = {".backups-uiux", "archivo", "docs", "documentacion", "tools",
                 "node_modules", ".git", "src", "Comunidades"}
LEAK_RE = re.compile(r"/\.tmp|tmp-|_preview|\.pre-|-pre-|\.log$")
# Gate exacto del párrafo: descarta un puente más largo (o uno viejo, en la otra
# dirección). Los dos aceptan min_slots o más.
GATE_SKIP = re.compile(r"parts\.length\s*!==?\s*6(?!\d)")
GATE_ONLY = re.compile(r"parts\.length\s*===?\s*6(?!\d)")
GATE_OTHER = re.compile(r"parts\.length\s*[!=]==?\s*(\d+)")


def render_helper() -> str:
    """Helper ILATEK_BRIDGE desde su única definición (plantilla + contrato)."""
    slot_map = "{" + ",".join(f"{name}:{i}" for i, name in enumerate(SLOTS)) + "}"
    return (
        (HERE / "bridge" / "ilatek-bridge.html")
        .read_text(encoding="utf-8")
        .rstrip("\n")
        .replace("__SLOT_MAP__", slot_map)
        .replace("__SEPARATOR__", SEPARATOR)
        .replace("__SLOT_COUNT__", str(FULL))
        .replace("__MIN_SLOT_COUNT__", str(MIN))
        .replace("__PIXEL_SLOT__", str(SLOTS.index("pixel_id")))
        .replace("__BRAND__", json.dumps(BRAND, ensure_ascii=False, sort_keys=True))
        .replace("__TOWN_ACCENTS__", json.dumps(TOWN_ACCENTS, ensure_ascii=False, sort_keys=True))
    )


# Alias robusto para statements individuales (self-suficiente por IIFE):
# window.ILATEK_BRIDGE si el helper cargó, o identidad/'' si no.
GUARD = "{slot:function(){return ''},attr:function(v){return String(v==null?'':v)}}"
ALIAS = "var ilBV=window.ILATEK_BRIDGE||" + GUARD + ";"

# Atributo del resolver -> nombre del custom value; el slot sale del contrato.
ATTR_TOKEN = {
    "data-location-label": "business__county_name",
    "data-primary-location": "business__county_name",
    "data-website-url": "website_url",
    "data-business-email": "business__email",
    "data-business-phone": "business__phone",
    "data-facebook-url": "facebook_url",
    "data-instagram-url": "instagram_url",
    "dataset.websiteUrl": "website_url",
    "dataset.businessEmail": "business__email",
    "dataset.businessPhone": "business__phone",
    "dataset.facebookUrl": "facebook_url",
    "dataset.instagramUrl": "instagram_url",
}
_ARG = r"(?:\w+|root)\.(?:getAttribute\('[^']+'\)|dataset\.\w+)"
CLEAN_CALL = re.compile(rf"clean\(\(\s*({_ARG}(?:\|\|[^()]*)?)\s*\)\)|clean\(({_ARG}(?:\|\|[^()]*)?)\)")


def _bridge_call(m: re.Match) -> str:
    arg = m.group(1) or m.group(2)
    for key, token in ATTR_TOKEN.items():
        if key in arg:
            return f"ilBV.attr({arg})||ilBV.slot({SLOTS.index(token)})"
    return m.group(0)


def with_bridge(stmt: str) -> str:
    return CLEAN_CALL.sub(_bridge_call, stmt)


def patched(stmt: str, sep: str | None) -> str:
    """Statement con el alias delante (sep) o reusando el alias de un B1 vecino (None)."""
    return (ALIAS + sep if sep is not None else "") + with_bridge(stmt)


# Statements originales de los resolvers (una entrada por forma real encontrada
# en los canónicos; el reemplazo se genera, no se escribe).
A_LONG_OLD = "var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico', website=clean(root.dataset.websiteUrl)||'https://ilatekpr.com', phone=clean(root.dataset.businessPhone), email=clean(root.dataset.businessEmail), fb=clean(root.dataset.facebookUrl)||'https://www.facebook.com/ilatek.pr/', ig=clean(root.dataset.instagramUrl)||'https://www.instagram.com/ilatek.pr/';"
A_SHORT_OLD = "var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico', website=clean(root.dataset.websiteUrl)||'https://ilatekpr.com', fb=clean(root.dataset.facebookUrl)||'https://www.facebook.com/ilatek.pr/', ig=clean(root.dataset.instagramUrl)||'https://www.instagram.com/ilatek.pr/';"
A_BARE_OLD = "var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico';"
A_SWAP_OLD = "var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico', website=clean(root.dataset.websiteUrl)||'https://ilatekpr.com', fb=clean(root.dataset.facebookUrl)||'https://www.facebook.com/ilatek.pr/', ig=clean(root.dataset.instagramUrl)||'https://www.instagram.com/ilatek.pr/', email=clean(root.dataset.businessEmail), phone=clean(root.dataset.businessPhone);"
B1_OLD = "var primaryLocation=clean(root.getAttribute('data-primary-location'))||'Puerto Rico';"
B2_OLD = "var locationLabel=hostTown?hostTown+', '+primaryLocation:(clean(root.getAttribute('data-location-label'))||primaryLocation);"
B3_OLD = "var website=clean(root.getAttribute('data-website-url'))||'https://ilatekpr.com';"
D_OLD = "var website=clean((root.getAttribute('data-website-url')||''))||'https://ilatekpr.com';"
C_OLD = ("var cel=document.querySelector('[data-location-label]');\n"
         "      if(cel){var cv=clean(cel.getAttribute('data-location-label'));if(cv)county=cv}")
# Formas que traían su PROPIO resolver del pueblo, sin preguntar al puente: los
# componentes de tarjetas/nav calculaban `county` con el literal 'Puerto Rico' y
# con ese valor hacían su propio swap de tokens, así que el pueblo de la sección
# nunca llegaba a coincidir con el del h1.
A_WEB_OLD = "var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico', website=clean(root.dataset.websiteUrl)||'https://ilatekpr.com';"
A_WEB_ATTR_OLD = "var county=clean(root.getAttribute('data-location-label'))||'Puerto Rico', website=clean(root.getAttribute('data-website-url'))||'https://ilatekpr.com';"
# Variante sin respaldo: si el atributo traía el token crudo, county quedaba
# vacío ("… en " sin pueblo).
C3_OLD = r"var county=(root.getAttribute('data-location-label')||'').replace(/\u00a0/g,' ').trim();"
C3_NEW = "var county=ilBV.attr(root.getAttribute('data-location-label'))||ilBV.slot(0)||'Puerto Rico';"

# (nombre, statement original, separador antes del statement; None = reusa el
# alias que ya define el B1 del mismo resolver)
SHAPES = [
    ("A-long", A_LONG_OLD, "\n    "),
    ("A-short", A_SHORT_OLD, "\n    "),
    ("A-bare", A_BARE_OLD, " "),
    ("A-swap", A_SWAP_OLD, "\n    "),
    ("B1", B1_OLD, " "),
    ("B2", B2_OLD, None),
    ("B3", B3_OLD, "\n    "),
    ("D", D_OLD, "\n    "),
    ("A-web", A_WEB_OLD, "\n    "),
    ("A-web-attr", A_WEB_ATTR_OLD, "\n    "),
]
A_SHAPES = {"A-long", "A-short", "A-bare", "A-swap"}


def patched_c() -> str:
    head, rest = with_bridge(C_OLD).split("\n", 1)
    return head + "\n      " + ALIAS + "\n" + rest


# --- Resolver propio del nav/tarjetas (iln-/ilcm-) -------------------------
# Se repetía con `var county='Puerto Rico';` hardcodeado: resolvía los tokens de
# las tarjetas y del mega-menú con su propio literal y BORRABA el token del DOM,
# así que el barrido del puente ya no tenía nada que arreglar. Ahora pregunta al
# puente y se re-aplica cuando llegan los values (evento ilatek:values).
# El bloque real tiene tres variantes (con/sin ilBV ya inyectado, con una o dos
# líneas de `out`), así que se localiza por líneas y se reemplaza la región
# completa: desde `var website=` hasta el cierre de `function resolve(){…}`.
NAV_MARK = "window.__ilnCountyHook"
NAV_COUNTY = "var county='Puerto Rico';"
# El pueblo se pide al puente en el momento (síncrono: título/subdominio/data),
# y el aviso ilatek:values re-aplica el idioma si los values llegan después.
COUNTY_BRIDGE = (
    "var county=(function(){try{var b=window.ILATEK_BRIDGE;if(b&&b.county)return b.county()||'Puerto Rico'}catch(e){}return 'Puerto Rico'})();\n"
    "    if(document&&document.addEventListener&&!window.__ilnCountyHook){window.__ilnCountyHook=1;"
    "document.addEventListener('ilatek:values',function(){try{window.__ilatekSetLang&&window.__ilatekSetLang(window.__ilatekLang||document.documentElement.lang||'es')}catch(e){}});}"
)
# Respaldo final del segundo resolver (variante `readCounty`).
READCOUNTY_OLD = "return clean(content&&content.getAttribute('data-location-label'))||'Puerto Rico';"
READCOUNTY_NEW = (
    "return clean(content&&content.getAttribute('data-location-label'))||"
    "(function(){try{var b=window.ILATEK_BRIDGE;if(b&&b.county)return b.county()||'Puerto Rico'}catch(e){}return 'Puerto Rico'})();"
)
DICTVAL_RE = re.compile(r"return \(d&&d\[k\]&&d\[k\]\[lang\]\)\?d\[k\]\[lang\]:null;")
DICTVAL_NEW = (
    "var v=(d&&d[k]&&d[k][lang])?d[k][lang]:null;\n"
    "      return v==null?null:resolve(v);"
)





# --- Titulares y secciones con el pueblo horneado --------------------------
# Los títulos de las secciones reutilizables (tarjetas y mega-menú) decían
# "… en Puerto Rico" en duro: no llevan token ni data-*, así que ningún resolver
# los alcanza y el pueblo queda escrito en el HTML. Pasan al mismo dueño que el
# h1 y las tarjetas: el custom value, resuelto por el puente.
TOWN_TOKEN = "{{custom_values.business__county_name}}"
TOWN_LITERAL = re.compile(r"\ben\s+Puerto\s+Rico\b")
TOWN_REPL = "en " + TOWN_TOKEN
# El nodo ya lo resuelve otro canal (i18n por atributo): no se toca.
TOWN_OWNED = re.compile(r"data-(?:es|en|en-key)\s*=")
# Donde "en Puerto Rico" es jurisdicción, no localidad.
LEGAL_DIRS = {"garantia", "terminos-y-condiciones", "politica-de-privacidad"}
_TAG = re.compile(r"<(/?)([a-zA-Z][\w:-]*)([^>]*)>", re.S)
_OPAQUE = re.compile(r"(<script\b[^>]*>.*?</script\s*>|<style\b[^>]*>.*?</style\s*>)", re.S | re.I)
_TOWN_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "span", "div",
              "a", "small", "strong", "em", "b", "i", "td", "th", "figcaption",
              "blockquote", "button", "label"}
_NO_TEXT = {"script", "style", "title", "textarea", "noscript", "template", "code", "pre"}
_VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
         "meta", "param", "source", "track", "wbr"}


def _town(chunk: str, stack: list[tuple[str, str]]) -> tuple[str, int]:
    """Un nodo de texto: si su elemento no es texto propio de otro canal, al token.

    No se descarta el nodo porque ya tenga un token: un párrafo puede llevar el
    custom value en una frase y el literal suelto en otra. TOWN_LITERAL solo
    empareja texto literal, así que los tokens existentes quedan intactos.
    """
    if not chunk or not stack:
        return chunk, 0
    name, attrs = stack[-1]
    if (name not in _TOWN_TAGS or TOWN_OWNED.search(attrs)
            or any(t[0] in _NO_TEXT for t in stack)):
        return chunk, 0
    return TOWN_LITERAL.subn(TOWN_REPL, chunk)


def _walk_town(segment: str) -> tuple[str, int]:
    """Cambia el literal por el token en el texto de los elementos visibles."""
    out: list[str] = []
    pos = 0
    stack: list[tuple[str, str]] = []
    hits = 0
    for m in _TAG.finditer(segment):
        chunk, n = _town(segment[pos:m.start()], stack)
        hits += n
        out.append(chunk)
        out.append(m.group(0))
        pos = m.end()
        closing, name, attrs = m.group(1), m.group(2).lower(), m.group(3)
        if closing:
            for i in range(len(stack) - 1, -1, -1):
                if stack[i][0] == name:
                    del stack[i:]
                    break
        elif name not in _VOID and not attrs.rstrip().endswith("/"):
            stack.append((name, attrs))
    # La cola tras la última etiqueta del segmento también es texto de un nodo:
    # si no se procesa, el párrafo que precede a un <script> se queda en literal.
    tail, n = _town(segment[pos:], stack)
    out.append(tail)
    return "".join(out), hits + n


def apply_town_literals(text: str) -> tuple[str, int]:
    """Titulares/secciones al contrato, sin tocar <script>/<style>.

    Los bloques de script se aíslan antes de recorrer: dentro de ellos el texto
    puede llevar `>` y romper el emparejamiento de etiquetas del walker.
    """
    parts = _OPAQUE.split(text)
    total = 0
    for i in range(0, len(parts), 2):
        parts[i], hits = _walk_town(parts[i])
        total += hits
    return "".join(parts), total


def apply_nav(text: str) -> tuple[str, dict[str, int]]:
    """Resolver del nav/tarjetas sobre el puente (idempotente).

    El literal `var county='Puerto Rico';` puede aparecer dos veces por archivo
    (barra y segundo resolver) y en variantes con `resolve` o `readCounty`, así
    que se cambia la línea (no el bloque) y el respaldo final de `readCounty`.
    """
    applied: dict[str, int] = {}
    n = text.count(NAV_COUNTY)
    if n:
        text = text.replace(NAV_COUNTY, COUNTY_BRIDGE)
        applied["county"] = n
    d = text.count(READCOUNTY_OLD)
    if d:
        text = text.replace(READCOUNTY_OLD, READCOUNTY_NEW)
        applied["readCounty"] = d
    text, d = DICTVAL_RE.subn(DICTVAL_NEW, text)
    if d:
        applied["dictVal"] = d
    return text, applied


def nav_files() -> list[Path]:
    """Archivos publicables con el resolver del nav hardcodeado (o ya parcheado)."""
    out = []
    for p in sorted(REPO.rglob("*.html")):
        rel = p.relative_to(REPO).as_posix()
        if LEAK_RE.search("/" + rel):
            continue
        if any(part in EXCLUDE_PARTS for part in Path(rel).parts[:-1]):
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if NAV_COUNTY in text or NAV_MARK in text:
            out.append(p)
    return out


def consumers() -> list[Path]:
    """Archivos publicables que LEEN el puente (contienen dv-ghl-values)."""
    out = []
    for p in sorted(REPO.rglob("*.html")):
        rel = p.relative_to(REPO).as_posix()
        if LEAK_RE.search("/" + rel):
            continue
        if any(part in EXCLUDE_PARTS for part in Path(rel).parts[:-1]):
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if "dv-ghl-values" in text:
            out.append(p)
    return out


def is_canonico(p: Path) -> bool:
    rel = p.relative_to(REPO).as_posix()
    return "/landing-pages/" in "/" + rel and bool(re.match(r"ghl-.*-landing\.html$", p.name, re.I))


def helper_block(text: str) -> str | None:
    i = text.find(HELPER_HEAD)
    if i < 0:
        return None
    j = text.find("</script>", i)
    return text[i:j + len("</script>")] if j >= 0 else None


def render_carrier() -> str:
    """Párrafo portador de los 7 tokens, generado desde el contrato."""
    tokens = SEPARATOR.join("{{custom_values.%s}}" % name for name in SLOTS)
    return (
        CARRIER_HEAD + " (viaja en el embed; GHL solo lo expande si se pega\n"
        "     como elemento nativo del builder). -->\n"
        '<p class="dv-ghl-values" id="dv-ghl-values" hidden>' + tokens + "</p>"
    )


def carrier_block(text: str) -> str | None:
    i = text.find(CARRIER_HEAD)
    if i < 0:
        return None
    j = text.find("</p>", i)
    return text[i:j + len("</p>")] if j >= 0 else None


def apply_carrier(text: str) -> str:
    """Deja el portador una sola vez (idempotente).

    En documentos completos va justo después de <body>: el helper ahora vive antes
    de </head> y un <p> ahí cerraría el head a la fuerza. En fragmentos (Custom
    Code, sin head/body) va pegado al helper.
    """
    block = carrier_block(text)
    if block is not None:
        i = text.find(block)
        text = text[:i] + text[i + len(block):]
        for nl in ("\r\n", "\n"):
            if text.startswith(nl, i):
                text = text[:i] + text[i + len(nl):]
                break
    bodies = list(re.finditer(r"<body\b[^>]*>", text, flags=re.I))
    if len(bodies) == 1:
        j = bodies[0].end()
        return text[:j] + "\n" + render_carrier() + text[j:]
    helper = helper_block(text)
    if helper is None:
        return text
    j = text.find(helper) + len(helper)
    return text[:j] + "\n" + render_carrier() + text[j:]


def apply_helper(text: str, helper: str) -> tuple[str, str | None]:
    """Deja el helper una sola vez, antes de </head>: el gate debe existir antes
    del primer paint (si ya estaba tras <body>, se recoloca)."""
    block = helper_block(text)
    if block is not None:
        i = text.find(block)
        text = text[:i] + text[i + len(block):]
        # Se consume el salto que puso el insertador: recolocar no debe sumar
        # una línea en blanco por pasada (idempotencia de --check).
        for nl in ("\r\n", "\n"):
            if text.startswith(nl, i):
                text = text[:i] + text[i + len(nl):]
                break
    heads = list(re.finditer(r"</head\s*>", text, flags=re.I))
    if len(heads) == 1:
        i = heads[0].start()
        return text[:i] + helper + "\n" + text[i:], None
    bodies = re.findall(r"<body\b[^>]*>", text, flags=re.I)
    if len(bodies) == 1:
        return re.sub(r"(<body\b[^>]*>)", lambda m: m.group(1) + "\n" + helper, text, count=1, flags=re.I), None
    if not bodies:
        return helper + "\n" + text, None
    return text, f"<body> tags: {len(bodies)}"


def tolerant_gates(text: str) -> tuple[str, int, list[str]]:
    """Walkers que exigen 6 exactos -> aceptan min_slots o más."""
    text, n = GATE_SKIP.subn(f"parts.length<{MIN}", text)
    text, m = GATE_ONLY.subn(f"parts.length>={MIN}", text)
    stray = [g for g in GATE_OTHER.findall(text) if int(g) != MIN]
    return text, n + m, stray


def is_legal(p: Path) -> bool:
    """Texto legal: ahí "en Puerto Rico" es jurisdicción, no localidad."""
    return any(part in LEGAL_DIRS for part in p.relative_to(REPO).parts[:-1])


def patch(text: str, helper: str, resolvers: bool, bridge: bool = True,
          literals: bool = True) -> tuple[str, dict[str, int], list[str]]:
    problems: list[str] = []
    applied: dict[str, int] = {}

    if bridge:
        text, body_problem = apply_helper(text, helper)
        if body_problem:
            return text, applied, [body_problem]
        text = apply_carrier(text)

    text, nav = apply_nav(text)
    applied.update(nav)
    if NAV_COUNTY in text:
        problems.append("nav con county hardcodeado sin parchear")

    # El pueblo se pide al puente en TODO archivo que tenga un resolver propio,
    # no solo en los canónicos nuevos: los componentes de tarjetas resolvían con
    # su propio literal y el valor de la sección nunca coincidía con el del h1.
    # Un statement ya puenteado no vuelve a coincidir, así que sigue idempotente.
    for name, old, sep in SHAPES:
        n = text.count(old)
        if n:
            text = text.replace(old, patched(old, sep))
            applied[name] = n
    n = text.count(C_OLD)
    if n:
        text = text.replace(C_OLD, patched_c())
        applied["C"] = n
    n = text.count(C3_OLD)
    if n:
        text = text.replace(C3_OLD, ALIAS + "\n    " + C3_NEW)
        applied["C3"] = n
    if resolvers and not any(applied.get(name) for name in A_SHAPES):
        problems.append("ninguna variante A (iltro) aplicada")

    if literals:
        text, town = apply_town_literals(text)
        if town:
            applied["titular"] = town

    text, gates, stray = tolerant_gates(text)
    if gates:
        applied["gates"] = gates
    if stray:
        problems.append(f"gate con otro número: {stray}")
    return text, applied, problems


def main() -> None:
    dry = "--check" in sys.argv
    helper = render_helper()
    touched = skipped = failed = 0
    totals: dict[str, int] = {}
    drift: list[str] = []

    files = sorted({*consumers(), *nav_files()})
    for p in files:
        rel = p.relative_to(REPO).as_posix()
        text = p.read_text(encoding="utf-8", errors="replace")
        canon = is_canonico(p)
        has_helper = helper_block(text) is not None
        is_bridge = "dv-ghl-values" in text
        new, applied, problems = patch(text, helper, resolvers=canon and not has_helper,
                                       bridge=is_bridge, literals=not is_legal(p))
        if dry and canon and "ilBV.slot(" not in new:
            problems.append("canónico sin ilBV.slot( en sus resolvers")
        if problems:
            failed += 1
            print(f"FAIL {rel}: {'; '.join(problems)}")
            continue
        if new == text:
            skipped += 1
            if dry and helper_block(text) != helper:
                drift.append(rel)
            continue
        if dry:
            drift.append(rel)
            continue
        p.write_text(new, encoding="utf-8", newline="")
        touched += 1
        for k, v in applied.items():
            totals[k] = totals.get(k, 0) + v
        print(f"OK   {rel}{' [canónico]' if canon else ''}: {applied or 'helper re-renderizado'}")

    if dry:
        for rel in drift:
            print(f"DRIFT {rel}: helper, gates o resolvers fuera del contrato")
        total = skipped + len(drift)
        print(f"archivos (puente + nav): {total} ({len(drift)} con drift)")
        print(f"helper: {total - len(drift)}/{total} idénticos al template (bridge/ilatek-bridge.html)")
        sys.exit(1 if (failed or drift) else 0)

    print(f"resumen: actualizados={touched} sin-cambios={skipped} fallidos={failed} por-forma={totals}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
