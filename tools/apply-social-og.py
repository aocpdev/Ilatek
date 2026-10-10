#!/usr/bin/env python
"""Ilatek · aplica las imágenes sociales (assets/optimized/social/<slug>.jpg) a los
<meta og:image> y <meta twitter:image> de las páginas de limpieza/home, que se
editan a mano (las landings de techos las genera techos/build-techos.mjs).

Es idempotente: correrlo dos veces deja el mismo resultado.

Uso:
    python Ilatek/tools/apply-social-og.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/assets/optimized/social/"

# Archivo de landing -> slug de su imagen social (debe existir <slug>.jpg en
# assets/optimized/social, generado por tools/optimize-social.py).
LANDINGS = {
    "home-page/ghl-home-multiservicios.html": "home",
    "home-page/ghl-servicios-landing.html": "servicios",
    "home-page/ghl-airbnb-turnover-landing.html": "airbnb-turnover",
    "home-page/ghl-alfombras-landing.html": "alfombras",
    "home-page/ghl-electrodomesticos-landing.html": "electrodomesticos",
    "home-page/ghl-lavado-a-presion-landing.html": "lavado-a-presion",
    "home-page/ghl-limpieza-comercial-landing.html": "limpieza-comercial",
    "home-page/ghl-limpieza-de-mudanza-landing.html": "limpieza-de-mudanza",
    "home-page/ghl-limpieza-estandar-landing.html": "limpieza-estandar",
    "home-page/ghl-limpieza-industrial-landing.html": "limpieza-industrial",
    "home-page/ghl-limpieza-profunda-landing.html": "limpieza-profunda",
    "home-page/ghl-limpieza-residencial-landing.html": "limpieza-residencial",
    "home-page/ghl-organizacion-landing.html": "organizacion",
    "home-page/ghl-post-construccion-landing.html": "post-construccion",
    "home-page/ghl-ventanas-landing.html": "ventanas",
}

# ghl-head-seo.html trae un bloque por página, delimitado por comentarios.
BLOCK_RE = re.compile(
    r"(<!-- ▼▼ /(?P<slug>[a-z0-9\-]+) ▼▼ -->)(?P<body>.*?)(<!-- ▲▲ fin /\2 ▲▲ -->)",
    re.S,
)
IMG_RE_TMPL = r'(<meta (?:property|name)="(?:og|twitter):image" content=")[^"]*(">)'


def og_meta(slug: str, indent: str = "") -> str:
    url = BASE + slug + ".jpg"
    return (
        f'{indent}<meta property="og:image" content="{url}">\n'
        f'{indent}<meta name="twitter:image" content="{url}">'
    )


def available(slug: str) -> bool:
    return (ROOT / "assets" / "optimized" / "social" / f"{slug}.jpg").is_file()


def rewrite_landing(path: Path, slug: str) -> int:
    text = path.read_text(encoding="utf-8")
    url = BASE + slug + ".jpg"
    new, n = re.subn(IMG_RE_TMPL, lambda m: m.group(1) + url + m.group(2), text)
    if n == 0:
        return 0
    if new != text:
        path.write_text(new, encoding="utf-8")
    return n


def rewrite_head_seo(path: Path) -> tuple[int, list[str]]:
    text = path.read_text(encoding="utf-8")
    done: list[str] = []
    misses: list[str] = []

    def repl(m: re.Match[str]) -> str:
        slug = m.group("slug")
        body = m.group("body")
        if not available(slug):
            misses.append(slug)
            return m.group(0)
        head = body.split('<meta property="og:image"', 1)[0]
        tail = body[len(head):]
        new_tail, n = re.subn(IMG_RE_TMPL, lambda mm: mm.group(1) + BASE + slug + ".jpg" + mm.group(2), tail)
        if n:
            done.append(slug)
        return m.group(1) + head + new_tail + m.group(4)

    new = BLOCK_RE.sub(repl, text)
    if new != text:
        path.write_text(new, encoding="utf-8")
    return len(done), misses


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    total = 0
    problems: list[str] = []

    for rel, slug in sorted(LANDINGS.items()):
        path = ROOT / rel
        if not path.is_file():
            problems.append(f"no existe {rel}")
            continue
        if not available(slug):
            problems.append(f"falta assets/optimized/social/{slug}.jpg")
            continue
        n = rewrite_landing(path, slug)
        if n < 2:
            problems.append(f"{rel}: solo {n} meta de imagen encontrados")
            continue
        total += n
        print(f"  {rel:<52} {slug:<24} {n} metas")

    # Landings de techos: el nombre del archivo es ghl-<slug>-landing.html, así que
    # el slug de la imagen social se deriva del nombre (no hay lista que mantener).
    techos_ok = 0
    for path in sorted((ROOT / "techos").glob("ghl-*-landing.html")):
        slug = path.name[len("ghl-") : -len("-landing.html")]
        if not available(slug):
            problems.append(f"falta assets/optimized/social/{slug}.jpg (para {path.name})")
            continue
        n = rewrite_landing(path, slug)
        if n < 2:
            problems.append(f"techos/{path.name}: solo {n} metas de imagen")
            continue
        techos_ok += 1
        total += n
    print(f"  techos/ghl-*-landing.html{'':<27} {techos_ok} landings")

    for rel in ("home-page/ghl-head-seo.html", "techos/ghl-techos-head-seo.html"):
        seo = ROOT / rel
        count, misses = rewrite_head_seo(seo)
        total += count * 2
        print(f"  {rel:<52} {count} bloques reescritos")
        if misses:
            print(f"  (sin imagen social propia, se dejan como estaban: {', '.join(misses)})")

    print(f"\n{total} metas de imagen apuntando al CDN de assets/optimized/social/")
    if problems:
        print("✗ Problemas:", file=sys.stderr)
        for p in problems:
            print(f"  - {p}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
