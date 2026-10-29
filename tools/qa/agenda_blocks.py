#!/usr/bin/env python3
"""Agenda de GHL: un solo dueño del bloque de calendario en las canónicas.

Antes: la agenda eran 28 líneas copiadas a mano en 46 landings. Ningún gate
miraba widgets (`audit_tokens_global.py` audita tokens, `qa_tokenized_headings`
audita titulares), así que la landing siguiente se publicaba sin calendario —o
con el del vertical equivocado— y nada fallaba.

Ahora, todo sale de aquí:

  - VERTICALS     el calendario de cada vertical (widget + id del iframe).
  - agenda/*.html la plantilla del bloque, una sola copia por vertical.
  - LIMPIEZA      slug -> etiqueta del servicio: la única tabla de copy.
  - NO_AGENDA     las canónicas que se quedan sin agenda, con su razón.
  - audit()       las reglas: un solo `widget/booking`, el del vertical que
                  toca, un solo `form_embed.js`, ids únicos en el documento y
                  (donde el bloque es de este módulo) byte a byte la plantilla.
  - --check       recorre el corpus canónico y falla si algo se sale de la regla.
  - sin --check   reescribe el bloque propio desde la plantilla (idempotente).

Techos se valida pero no se reescribe: su bloque vive dentro del wrapper de la
página y usa la paleta de esa página (`var(--blue)`, `var(--muted)`), así que
moverlo o re-renderizarlo cambiaría el layout. Limpieza sí es de este módulo: su
bloque es hermano del wrapper, con su propio prefijo `ilcal`.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from repo_root import REPO

HERE = Path(__file__).resolve().parent
TEMPLATES = HERE / "agenda"

# El calendario de cada vertical. `template` vacío = plantilla no es nuestra.
VERTICALS: dict[str, dict[str, str | None]] = {
    "techos": {
        "calendar": "wM8KQhsYjEQAo0HbNGIh",
        "iframeId": "wM8KQhsYjEQAo0HbNGIh_1791075788803",
        "template": None,
    },
    "limpieza": {
        "calendar": "i5HZobZjuSZcDl43qgOG",
        "iframeId": "i5HZobZjuSZcDl43qgOG_1791075788804",
        "template": "ilcal-limpieza.html",
    },
}

# slug del servicio -> etiqueta que va en el H2 y en el `title` del iframe.
# Un servicio de limpieza nuevo entra aquí; si no, el gate lo para como techos.
LIMPIEZA: dict[str, str] = {
    "limpieza": "limpieza",
    "limpieza-comercial": "limpieza comercial",
    "limpieza-industrial": "limpieza industrial",
    "limpieza-residencial": "limpieza residencial",
    "airbnb-turnover": "limpieza de Airbnb y turnover",
    "alfombras": "limpieza de alfombras",
    "electrodomesticos": "limpieza de electrodomésticos",
    "lavado-a-presion": "lavado a presión",
    "limpieza-de-mudanza": "limpieza de mudanza",
    "limpieza-estandar": "limpieza estándar",
    "limpieza-profunda": "limpieza profunda",
    "organizacion": "organización",
    "post-construccion": "limpieza post-construcción",
    "ventanas": "limpieza de ventanas",
}

# Canónicas sin agenda, a propósito y con razón escrita.
NO_AGENDA: dict[str, str] = {
    "home/es/landing-pages/ghl-home-multiservicios.html":
        "portada: elige vertical y enruta a /cotizacion y /cotizacion-techos",
    "categorias/servicios/es/landing-pages/ghl-servicios-landing.html":
        "hub mixto techos+limpieza: cualquier calendario sería el del vertical equivocado",
}

CALENDAR_RE = re.compile(r"widget/booking/([A-Za-z0-9]+)")
IFRAME_RE = re.compile(r"<iframe[^>]*widget/booking/([A-Za-z0-9]+)")
EMBED_RE = re.compile(r"js/form_embed\.js")
ID_RE = re.compile(r'\bid="([^"]+)"')

# Marcas del bloque propio (limpieza): apertura y cierre del tramo reemplazable.
BLOCK_START = '<style id="ilcal-css">'
BLOCK_END = "</section>"
# Punto de inserción cuando la página no tiene bloque: antes del footer global.
SHELL_FOOTER = "<!-- ILATEK:SHELL:FOOTER:START -->"


def read(p: Path) -> str:
    """Texto con sus saltos de línea intactos (los canónicos son CRLF)."""
    with p.open(encoding="utf-8", newline="") as fh:
        return fh.read()


def write(p: Path, text: str) -> None:
    with p.open("w", encoding="utf-8", newline="") as fh:
        fh.write(text)


def canonical() -> list[Path]:
    """Corpus publicable: 11 `categorias/` + 36 `servicios/` + la home.

    La home no termina en `-landing.html` (es `ghl-home-multiservicios.html`),
    así que lleva su propio patrón: una regla por nombre la dejaría fuera del
    gate justo cuando es la página que más tráfico recibe.
    """
    out: list[Path] = []
    for group in ("categorias", "servicios"):
        out += sorted((REPO / group).glob("*/es/landing-pages/ghl-*-landing.html"))
    out += sorted((REPO / "home" / "es" / "landing-pages").glob("ghl-*.html"))
    return out


def rel(p: Path) -> str:
    return p.relative_to(REPO).as_posix()


def slug(relpath: str) -> str:
    parts = Path(relpath).parts
    return parts[1] if len(parts) > 2 and parts[0] != "home" else ""


def vertical_of(relpath: str) -> str | None:
    """Vertical de una canónica; None = sin agenda por política."""
    if relpath in NO_AGENDA:
        return None
    return "limpieza" if slug(relpath) in LIMPIEZA else "techos"


def newline_of(text: str) -> str:
    return "\r\n" if "\r\n" in text else "\n"


def render(vertical: str, label: str, nl: str) -> str:
    """Bloque desde la plantilla del vertical, con los saltos del archivo destino."""
    name = VERTICALS[vertical]["template"]
    if not name:
        raise SystemExit(f"{vertical} no tiene plantilla propia")
    tpl = (TEMPLATES / name).read_text(encoding="utf-8").rstrip("\n")
    block = (
        tpl.replace("__SERVICE__", label)
        .replace("__CALENDAR__", str(VERTICALS[vertical]["calendar"]))
        .replace("__IFRAME_ID__", str(VERTICALS[vertical]["iframeId"]))
    )
    return block.replace("\n", nl)


def expected_block(relpath: str, text: str) -> str | None:
    """Bloque esperado para esa página, o None si su agenda no es de este módulo."""
    vertical = vertical_of(relpath)
    if vertical is None or not VERTICALS[vertical]["template"]:
        return None
    label = LIMPIEZA.get(slug(relpath))
    if not label:
        return None
    return render(vertical, label, newline_of(text))


def block_span(text: str) -> tuple[int, int] | None:
    """Tramo `<style id="ilcal-css">…</section>` del bloque propio."""
    i = text.find(BLOCK_START)
    if i < 0:
        return None
    j = text.find(BLOCK_END, i)
    return (i, j + len(BLOCK_END)) if j >= 0 else None


def stray_ids(text: str) -> list[str]:
    ids = ID_RE.findall(text)
    return sorted({i for i in ids if ids.count(i) > 1})


def audit(relpath: str, text: str) -> list[str]:
    """Problemas de agenda de una canónica (vacío = cumple)."""
    vertical = vertical_of(relpath)
    if vertical is None:
        embeds = len(IFRAME_RE.findall(text))
        return [f"{embeds} calendario(s) embebido(s) en una página sin agenda por política"] if embeds else []

    want = VERTICALS[vertical]
    problems: list[str] = []
    calendars = CALENDAR_RE.findall(text)
    if len(calendars) != 1:
        problems.append(f"{len(calendars)} widget/booking (esperado 1)")
    elif calendars[0] != want["calendar"]:
        hint = ""
        if vertical == "techos" and calendars[0] == VERTICALS["limpieza"]["calendar"]:
            hint = " (si es un servicio de limpieza nuevo, decláralo en LIMPIEZA)"
        problems.append(
            f"calendario de otro vertical: {calendars[0]} (esperado {want['calendar']}){hint}"
        )

    iframes = IFRAME_RE.findall(text)
    if len(iframes) != 1:
        problems.append(f"{len(iframes)} iframe(s) de calendario (esperado 1)")
    elif iframes[0] != want["calendar"]:
        problems.append(f"iframe con calendario ajeno: {iframes[0]}")

    embeds = len(EMBED_RE.findall(text))
    if embeds != 1:
        problems.append(f"{embeds} form_embed.js (esperado 1)")

    dups = stray_ids(text)
    if dups:
        problems.append(f"ids duplicados: {', '.join(dups)}")

    expected = expected_block(relpath, text)
    if expected is not None:
        span = block_span(text)
        if span is None:
            problems.append("sin bloque `#ilcal-agenda` (la plantilla lo define)")
        elif text[span[0]:span[1]] != expected:
            problems.append("bloque fuera de la plantilla (drift)")
    return problems


def apply_block(relpath: str, text: str) -> tuple[str, str]:
    """Deja el bloque propio igual a la plantilla. Devuelve (texto, acción)."""
    expected = expected_block(relpath, text)
    if expected is None:
        return text, "sin bloque propio"
    span = block_span(text)
    if span is None:
        if SHELL_FOOTER not in text:
            raise SystemExit(f"{relpath}: sin `{SHELL_FOOTER}`, no sé dónde insertar")
        i = text.find(SHELL_FOOTER)
        return text[:i] + expected + newline_of(text) + text[i:], "insertado"
    if text[span[0]:span[1]] == expected:
        return text, "sin cambios"
    return text[:span[0]] + expected + text[span[1]:], "re-renderizado"


def main() -> None:
    dry = "--check" in sys.argv
    pages = canonical()
    per_vertical: dict[str, int] = {}
    excluded: list[str] = []
    failed: list[tuple[str, list[str]]] = []
    touched = unchanged = 0

    for p in pages:
        relpath = rel(p)
        text = read(p)
        vertical = vertical_of(relpath)
        if vertical is None:
            excluded.append(relpath)
        else:
            per_vertical[vertical] = per_vertical.get(vertical, 0) + 1

        if not dry:
            text, action = apply_block(relpath, text)
            if action in ("insertado", "re-renderizado"):
                write(p, text)
                touched += 1
                print(f"OK   {relpath}: {action}")

        problems = audit(relpath, text)
        if problems:
            failed.append((relpath, problems))
        elif not dry:
            unchanged += 1

    covered = sum(per_vertical.values())
    detail = " · ".join(f"{n} {v}" for v, n in sorted(per_vertical.items()))
    print(f"\nagenda: {covered}/{len(pages)} canónicas ({detail})")
    for relpath in excluded:
        print(f"  sin agenda por política: {relpath} — {NO_AGENDA[relpath]}")

    for relpath, problems in failed:
        print(f"FAIL {relpath}: {'; '.join(problems)}")

    if dry:
        print(f"\ncheck: {len(pages) - len(failed) - len(excluded)}/{covered} conformes, {len(failed)} con drift")
        sys.exit(1 if failed else 0)

    print(f"\nresumen: actualizados={touched} sin-cambios={unchanged} fallidos={len(failed)}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
