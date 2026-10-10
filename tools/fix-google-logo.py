#!/usr/bin/env python
"""Ilatek · logo de Google de la pestaña de reseñas.

Antes las pestañas usaban un JPG del logo de Google recortado en círculo
(`assets.cdn.filesafe.space/.../6ac6fe59195f9172eddf11b8.jpg`), que se ve
pixelado y fuera de lugar. Este script es el dueño único del reemplazo: cambia
ese <img> por el isotipo oficial de Google en SVG (4 trazos vectoriales) sobre
un disco blanco, para que se vea nítido y nativo en la pestaña clara y también
cuando la pestaña activa se pone azul marino.

Uso:
    python Ilatek/tools/fix-google-logo.py            # aplica
    python Ilatek/tools/fix-google-logo.py --check     # solo reporta
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".backups-uiux", ".git", "node_modules"}

OLD_IMG_RE = re.compile(
    r'<img class="il-sico" src="https://assets\.cdn\.filesafe\.space/'
    r'8OxUENFVM60EKzqsTcoD/media/6ac6fe59195f9172eddf11b8\.jpg"'
    r'[^>]*style="[^"]*border-radius:50%[^"]*"[^>]*>'
)

# Isotipo oficial de Google (el mismo trazo del botón "Sign in with Google").
GOOGLE_G = (
    '<span class="il-glogo" aria-hidden="true"><svg viewBox="0 0 48 48" '
    'xmlns="http://www.w3.org/2000/svg" focusable="false" role="presentation">'
    '<path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06'
    ' 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>'
    '<path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49'
    ' 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>'
    '<path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34'
    'C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>'
    '<path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2'
    ' 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/></svg></span>'
)

# Regla hermana de `.il-sico`, con el mismo prefijo de scope que ya usa el archivo.
SICO_RULE_RE = re.compile(r"^([^\n{]*\.il-reviews-tab \.il-sico\{[^}]*\})\s*$", re.M)
GLOGO_CSS = (
    ".il-reviews-tab .il-glogo{width:17px;height:17px;flex:none;margin-right:6px;"
    "display:inline-flex;align-items:center;justify-content:center;background:#fff;"
    "border-radius:50%;padding:2.5px;box-shadow:0 1px 3px rgba(11,16,61,.22)}"
    ".il-reviews-tab .il-glogo svg{width:100%;height:100%;display:block}"
)


def html_files() -> list[Path]:
    out = []
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        out.append(path)
    return out


def apply(path: Path, dry: bool) -> tuple[int, int]:
    text = path.read_text(encoding="utf-8")
    if "il-glogo" in text and not OLD_IMG_RE.search(text):
        return 0, 0
    new, n_imgs = OLD_IMG_RE.subn(GOOGLE_G, text)

    n_css = 0
    if n_imgs:
        rules = list(SICO_RULE_RE.finditer(new))
        inserts: list[tuple[int, str]] = []
        for m in rules:
            prefix = m.group(1).split(".il-reviews-tab")[0]
            if f"{prefix}.il-reviews-tab .il-glogo{{" in new:
                continue
            inserts.append((m.end(), "\n" + prefix + GLOGO_CSS))
        # de abajo hacia arriba para no mover los índices
        for pos, css in sorted(inserts, reverse=True):
            new = new[:pos] + css + new[pos:]
        n_css = len(inserts)
        if not rules:
            # sin regla .il-sico en el archivo: se agrega una global dentro del propio <style>
            for m in re.finditer(r"</style>", new):
                new = new[: m.start()] + ".il-reviews-tab .il-glogo{width:17px;height:17px;flex:none;margin-right:6px;display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:50%;padding:2.5px;box-shadow:0 1px 3px rgba(11,16,61,.22)}.il-reviews-tab .il-glogo svg{width:100%;height:100%;display:block}\n" + new[m.start():]
                n_css += 1
                break

    if n_imgs and not dry:
        path.write_text(new, encoding="utf-8")
    return n_imgs, n_css


def main() -> int:
    dry = "--check" in sys.argv
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    total_img = total_css = touched = 0
    pending: list[str] = []
    for path in html_files():
        n_img, n_css = apply(path, dry)
        if n_img or n_css:
            touched += 1
            total_img += n_img
            total_css += n_css
            if dry:
                pending.append(path.relative_to(ROOT).as_posix())

    if dry:
        print(f"Archivos con el JPG viejo: {touched}")
        for p in pending[:8]:
            print(f"  · {p}")
        if len(pending) > 8:
            print(f"  · … y {len(pending) - 8} más")
        return 0

    print(f"Archivos actualizados: {touched}")
    print(f"  logos reemplazados por el SVG : {total_img}")
    print(f"  reglas CSS .il-glogo añadidas : {total_css}")

    # verificación: no debe quedar ninguna copia del JPG viejo, y cada SVG debe
    # traer los 4 trazos oficiales.
    leftovers = [p.relative_to(ROOT).as_posix() for p in html_files() if OLD_IMG_RE.search(p.read_text(encoding="utf-8"))]
    bad_svg = 0
    for path in html_files():
        t = path.read_text(encoding="utf-8")
        for m in re.finditer(r'<span class="il-glogo"[^>]*>(.*?)</span>', t, re.S):
            if len(re.findall(r"<path ", m.group(1))) != 4:
                bad_svg += 1
    print(f"  JPG antiguos restantes         : {len(leftovers)}")
    print(f"  SVG con trazos != 4            : {bad_svg}")
    for p in leftovers[:8]:
        print(f"  ✗ {p}")
    return 1 if (leftovers or bad_svg) else 0


if __name__ == "__main__":
    raise SystemExit(main())
