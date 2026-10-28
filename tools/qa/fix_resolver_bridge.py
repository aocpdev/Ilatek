#!/usr/bin/env python3
"""Resolvers seccionales: data-* crudos se resuelven contra el puente dv-ghl-values.

Defecto (demostrado por tools/qa/qa_tokenized_headings.mjs, variante bridge-only):
los resolvers embebidos en los canónicos ghl-*-landing.html leen data-location-label,
data-primary-location, data-* de contacto desde los atributos de la sección; esos
atributos llevan el token crudo {{custom_values.*}} (GHL no los expande dentro del
Custom Code), el clean() local lo descarta y h1/h3 caen al literal 'Puerto Rico'.

Fix mínimo y uniforme, dentro de cada resolver:
  1. Un script-guía por archivo (uno solo) con el helper ILATEK_BRIDGE. Su cuerpo
     tiene UNA definición — bridge/ilatek-bridge.html — y este script la renderiza
     con custom-values.json (slots + separador); no hay copia del helper aquí.
  2. Cada statement que alimentaba el mapa de valores con clean(attr) pasa a
     ilBV.attr(attr) || ilBV.slot(N) || fallback. El N sale del contrato del puente
     (custom-values.json), no de una tabla duplicada.

Idempotente: un archivo con el marcador ILATEK_BRIDGE ya no se toca; con --check
además se verifica que su helper embebido sea byte a byte el del template.
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

MARKER = "ILATEK_BRIDGE"


def render_helper() -> str:
    """Helper ILATEK_BRIDGE desde su única definición (plantilla + contrato)."""
    slot_map = "{" + ",".join(f"{name}:{i}" for i, name in enumerate(SLOTS)) + "}"
    return (
        (HERE / "bridge" / "ilatek-bridge.html")
        .read_text(encoding="utf-8")
        .rstrip("\n")
        .replace("__SLOT_MAP__", slot_map)
        .replace("__SEPARATOR__", SEPARATOR)
        .replace("__SLOT_COUNT__", str(len(SLOTS)))
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
]
A_SHAPES = {"A-long", "A-short", "A-bare", "A-swap"}


def patched_c() -> str:
    head, rest = with_bridge(C_OLD).split("\n", 1)
    return head + "\n      " + ALIAS + "\n" + rest


def publishable_landings() -> list[Path]:
    out = []
    for p in sorted(REPO.rglob("*.html")):
        rel = p.relative_to(REPO).as_posix()
        if re.search(r"/\.tmp|tmp-|_preview|\.pre-|\.log$", "/" + rel):
            continue
        if any(part in {".backups-uiux", "archivo", "docs", "documentacion", "tools",
                        "node_modules", ".git", "src", "Comunidades"}
               for part in Path(rel).parts[:-1]):
            continue
        if "/landing-pages/" not in rel:
            continue
        if not re.match(r"ghl-.*-landing\.html$", p.name, re.I):
            continue
        out.append(p)
    return out


def helper_block(text: str) -> str | None:
    i = text.find("<!-- ILATEK")
    if i < 0:
        return None
    j = text.find("</script>", i)
    return text[i:j + len("</script>")] if j >= 0 else None


def patch(text: str, helper: str) -> tuple[str, dict[str, int], list[str]]:
    problems: list[str] = []
    applied: dict[str, int] = {}

    bodies = re.findall(r"<body\b[^>]*>", text, flags=re.I)
    if len(bodies) == 1:
        text = re.sub(r"(<body\b[^>]*>)", lambda m: m.group(1) + "\n" + helper, text, count=1, flags=re.I)
    elif len(bodies) == 0:
        text = helper + "\n" + text
    else:
        return text, applied, [f"<body> tags: {len(bodies)}"]

    for name, old, sep in SHAPES:
        n = text.count(old)
        if n:
            text = text.replace(old, patched(old, sep))
            applied[name] = n
    n = text.count(C_OLD)
    if n:
        text = text.replace(C_OLD, patched_c())
        applied["C"] = n

    if not any(applied.get(name) for name in A_SHAPES):
        problems.append("ninguna variante A (iltro) aplicada")
    return text, applied, problems


def main() -> None:
    dry = "--check" in sys.argv
    helper = render_helper()
    files_ok, skipped, failed = 0, 0, 0
    totals: dict[str, int] = {}
    drift: list[str] = []

    for p in publishable_landings():
        rel = p.relative_to(REPO).as_posix()
        text = p.read_text(encoding="utf-8", errors="replace")
        if MARKER in text:
            skipped += 1
            if dry and helper_block(text) != helper:
                drift.append(rel)
            continue
        new, applied, problems = patch(text, helper)
        if problems:
            failed += 1
            print(f"FAIL {rel}: {'; '.join(problems)}")
            continue
        if not dry:
            p.write_text(new, encoding="utf-8", newline="")
        files_ok += 1
        for k, v in applied.items():
            totals[k] = totals.get(k, 0) + v
        print(f"OK   {rel}: {applied}")

    print(f"resumen: parcheados={files_ok} ya-parcheados={skipped} fallidos={failed} por-forma={totals}")
    if dry:
        print(f"helper: {skipped - len(drift)}/{skipped} idénticos al template (bridge/ilatek-bridge.html)")
        for rel in drift:
            print(f"DRIFT {rel}: el helper embebido no coincide con el template")
    sys.exit(1 if (failed or drift) else 0)


if __name__ == "__main__":
    main()
