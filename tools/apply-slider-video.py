#!/usr/bin/env python
"""Ilatek · video de fondo de la seccion de servicios (carrusel/10 tarjetas).

La seccion `#ilatek-servicios-slider` (el carrusel de los 10 servicios de
limpieza) existe en varias copias dentro del repo. Su fondo de video debe ser el
MISMO en todas:

    https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6ac8f952bd6bb710ca0fd582.mp4

Este script es el dueno unico del tratamiento visual: lee las piezas canonicas
(video, overlay, reglas CSS y guard de reproduccion) del archivo de referencia
-- `home-page/ghl-servicios-carousel-embed.html`, que es la version embebible y
la mas pequena -- y las replica en cualquier archivo del repo que contenga la
seccion sin el video. Es idempotente: los archivos que ya lo tienen se saltan.

Uso:
    python Ilatek/tools/apply-slider-video.py            # aplica
    python Ilatek/tools/apply-slider-video.py --check     # solo reporta
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "home-page" / "ghl-servicios-carousel-embed.html"
SECTION_ID = "ilatek-servicios-slider"
# La landing /servicios tiene la MISMA seccion de 10 servicios con otro id y
# otras clases (anillo 3D). Se auditan ambas para que no quede una copia sin
# video; el catalogo ya trae su propio tratamiento (.ilsx-bgvideo).
AUDIT_IDS = (SECTION_ID, "ilatek-servicios-catalogo")
SKIP_DIRS = {".backups-uiux", ".git", "node_modules"}

VIDEO_MARK = 'class="ils-bgvideo"'

# Overlay azul de marca sobre el video. Se oscureció a pedido: más alpha en los
# tres puntos del degradado (antes .66/.52/.64). El reemplazo es idempotente:
# cualquier combinación de alphas en esos stops se normaliza a estos valores.
OVERLAY_RE = re.compile(
    r"linear-gradient\(180deg,rgba\(33,61,142,\.\d+\) 0%,rgba\(33,61,142,\.\d+\) 55%,"
    r"rgba\(33,61,142,\.\d+\) 100%\)"
)
OVERLAY_NEW = (
    "linear-gradient(180deg,rgba(33,61,142,.80) 0%,rgba(33,61,142,.68) 55%,"
    "rgba(33,61,142,.78) 100%)"
)
GUARD_MARK = "var ilBg=root.querySelector('.ils-bgvideo');"

# ── piezas canonicas (se extraen del archivo de referencia) ──────────────────
CANON_VIDEO_RE = re.compile(r'<video class="ils-bgvideo".*?</video>', re.S)
CANON_BG_RULE_RE = re.compile(r"\.ils-bgvideo\{[^}]*\}")
CANON_RM_RE = re.compile(r"@media\s*\(prefers-reduced-motion:reduce\)\{\.ils-bgvideo\{display:none\}\}")
CANON_OVERLAY_RE = re.compile(r"#" + SECTION_ID + r"::before\{[^}]*\}")
CANON_SLIDER_BG_RE = re.compile(r"#" + SECTION_ID + r"\{[^}]*\}")
# OJO: el guard tiene que llegar hasta la llave que cierra el `if(ilBg){`,
# si no el bloque queda desbalanceado y el IIFE entero lanza SyntaxError
# (y el carrusel deja de generar tarjetas).
CANON_GUARD_RE = re.compile(
    r"    var ilBg=root\.querySelector\('\.ils-bgvideo'\);.*?setInterval\(ilKick,4000\);\n\s*\}\n",
    re.S,
)


def load_canon() -> dict[str, str]:
    text = REFERENCE.read_text(encoding="utf-8")
    pieces = {}
    for key, rx in (
        ("video", CANON_VIDEO_RE),
        ("bg_rule", CANON_BG_RULE_RE),
        ("rm_rule", CANON_RM_RE),
        ("overlay", CANON_OVERLAY_RE),
        ("slider_rule", CANON_SLIDER_BG_RE),
        ("guard", CANON_GUARD_RE),
    ):
        m = rx.search(text)
        if not m:
            raise SystemExit(f"✗ no encontre la pieza canonica '{key}' en {REFERENCE.name}")
        pieces[key] = m.group(0)

    bg = re.search(r"background:([^;]*);", pieces["slider_rule"])
    if not bg:
        raise SystemExit("✗ la regla canonica no trae background")
    pieces["background"] = bg.group(1)
    return pieces


def scan() -> list[tuple[Path, str, str]]:
    """(archivo, id de seccion, src del video de fondo o '-')."""
    found: list[tuple[Path, str, str]] = []
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        # ignora temporales/ocultos y la hoja de contactos de revision
        if path.name.startswith(".") or "review" in path.name:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for sid in AUDIT_IDS:
            if f'id="{sid}"' not in text:
                continue
            src = "-"
            for rx in (r'<video class="ils-bgvideo"[^>]*src="([^"]+)"', r'<video class="ilsx-bgvideo"[^>]*src="([^"]+)"'):
                m = re.search(rx, text)
                if m:
                    src = m.group(1).rsplit("/", 1)[-1]
                    break
            found.append((path, sid, src))
    return found


def targets() -> list[Path]:
    return [p for p, sid, _ in scan() if sid == SECTION_ID]


def section_bounds(text: str) -> tuple[int, int]:
    start = text.index(f'<section id="{SECTION_ID}"')
    end = text.index("</section>", start)
    return start, end


def darken_overlay(path: Path, dry: bool) -> int:
    """Oscurece el overlay azul sobre el video. Devuelve cuántas reglas tocó."""
    text = path.read_text(encoding="utf-8")
    if "id=\"ilatek-servicios" not in text and "video" not in text:
        return 0
    new, n = OVERLAY_RE.subn(OVERLAY_NEW, text)
    if n and not dry:
        path.write_text(new, encoding="utf-8")
    return n


def apply_to(path: Path, canon: dict[str, str], dry: bool) -> str:
    text = path.read_text(encoding="utf-8")
    if VIDEO_MARK in text:
        return "ya tiene el video"
    if f'id="{SECTION_ID}"' not in text:
        return "no tiene la seccion"

    s, e = section_bounds(text)
    head, body, tail = text[:s], text[s:e], text[e:]

    # 1. fondo + posicion en la regla de la seccion
    rule = re.search(r"#" + SECTION_ID + r"\{[^}]*\}", body)
    if not rule:
        return "✗ la seccion no tiene regla de estilo propia"
    new_rule = rule.group(0)
    if "position:relative" not in new_rule:
        new_rule = new_rule.replace("{", "{position:relative;", 1)
    new_rule = re.sub(r"background:[^;]*;", f"background:{canon['background']};", new_rule, count=1)
    body = body[: rule.start()] + new_rule + body[rule.end() :]

    # 2. overlay + video + z-index del contenido + reduced-motion, tras la regla
    extra = (
        "\n    " + canon["overlay"]
        + "\n    #" + SECTION_ID + ">*:not(.ils-bgvideo):not(style):not(script){position:relative;z-index:2}"
        + "\n    " + canon["bg_rule"]
        + "\n    " + canon["rm_rule"]
        + "\n    "
    )
    at = body.index(new_rule) + len(new_rule)
    body = body[:at] + extra + body[at:]

    # 3. el elemento <video> justo dentro de la seccion
    open_tag_end = body.index(">", body.index(f'<section id="{SECTION_ID}"')) + 1
    body = body[:open_tag_end] + "\n  " + canon["video"] + body[open_tag_end:]

    # 4. guard de reproduccion dentro del IIFE de la seccion
    guard_target = re.search(
        r"^(\s*var root=document\.getElementById\('" + SECTION_ID + r"'\);[^\n]*\n)",
        body,
        re.M,
    )
    if not guard_target:
        return "✗ no encontre el IIFE de la seccion para insertar el guard"
    body = body[: guard_target.end()] + canon["guard"] + body[guard_target.end() :]

    if not dry:
        path.write_text(head + body + tail, encoding="utf-8")
    return "aplicado"


def main() -> int:
    dry = "--check" in sys.argv
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    canon = load_canon()
    print(f"Referencia: {REFERENCE.relative_to(ROOT).as_posix()}")
    print(f"  video    : {re.search(r'src=\"([^\"]+)\"', canon['video']).group(1)}")
    print(f"  overlay  : {'si' if canon['overlay'] else 'no'} · guard: {'si' if canon['guard'] else 'no'}")
    print()

    problems = 0
    overlay_hits = 0
    for path, sid, src in scan():
        rel = path.relative_to(ROOT).as_posix()
        status = apply_to(path, canon, dry) if sid == SECTION_ID else (
            "ya tiene el video" if src != "-" else "✗ sin video de fondo"
        )
        flag = "·" if status in ("aplicado", "ya tiene el video") else "✗"
        if flag == "✗":
            problems += 1
        print(f"  {flag} {rel:<52} #{sid:<28} video: {src:<8} {status}")
        overlay_hits += darken_overlay(path, dry)
    print(f"\n  overlay azul oscurecido en {overlay_hits} regla(s) "
          f"({OVERLAY_NEW.split('rgba')[1].split(')')[0]} 0% -> 100%)" if overlay_hits else
          "\n  overlay azul: ya estaba en los valores nuevos")
    if problems:
        print(f"\n✗ {problems} archivo(s) con problema", file=sys.stderr)
        return 1
    print("\n✓ todas las copias de la seccion usan el mismo video de fondo")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
