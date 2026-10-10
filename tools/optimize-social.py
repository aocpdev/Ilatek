#!/usr/bin/env python
"""Ilatek · OG social · genera assets/optimized/social/<slug>.jpg (1200 px, JPEG q85).

Dueño ÚNICO del emparejamiento "foto social → slug de landing" usado en los
<meta og:image> / <meta twitter:image> del sitio. Se empareja por el TÍTULO de
la foto (carpeta "Ilatek Images - Updated"); cuando la librería social no tiene
una foto con ese servicio exacto, se usa la más cercana del mismo tema y se
documenta abajo (FALLBACK). Los nombres de salida son ASCII por slug para que la
URL del meta tag sea limpia y estable (sin acentos ni espacios).

Uso:
    python Ilatek/tools/optimize-social.py
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOCIAL_SRC = Path.home() / "Downloads" / "Ilatek Images - Updated"
# La portada del hub de techos vive en la carpeta de servicios (no en la social).
EXTRA_SRC = Path.home() / "Downloads" / "Ilatek - Services Images" / "Techos"
SOURCES = (SOCIAL_SRC, EXTRA_SRC)
OUT = ROOT / "assets" / "optimized" / "social"

MAX_W = 1200
QUALITY = 85

# ── Techos: 33 landings (hub + 32) ──────────────────────────────────────────
TECHOS = {
    "techos": "Todos los Servicios de Mantenimiento de Techos en Puerto Rico - Ilatek.jpg",
    "reparacion-de-techos": "Reparación de Techos - Ilatek.jpg",
    "reparacion-de-goteras": "Reparación de Goteras - Ilatek.jpg",
    "reparacion-de-filtraciones": "Reparación de Filtraciones - Ilatek.jpg",
    "reparacion-de-grietas-techos": "Reparación de Grietas - Ilatek.jpg",
    "sellado-de-techos": "Sellado de Techos - Ilatek.jpg",
    "sellado-de-silicona": "Sellado con Silicona - Ilatek.jpg",
    "membrana-asfaltica": "Membrana Asfáltica - Ilatek.jpg",
    "recubrimiento-elastomerico": "Recubrimiento Elastomérico -Ilatek.jpg",
    "sellado-de-poliuretano": "Sellado de Poliuretano - Ilatek.jpg",
    "sellado-acrilico": "Sellado Acrílico  - Ilatek.jpg",
    "impermeabilizacion-de-techos": "Impermeabilización - Ilatek.jpg",
    "techos-de-concreto": "Techos de Concreto - Ilatek.jpg",
    "techos-planos": "Techos Planos - Ilatek.jpg",
    "sellado-de-techos-residencial": "Sellado Residencial  - Ilatek.jpg",
    "sellado-de-techos-comercial": "Sellado Comercial - Ilatek.jpg",
    "sellado-de-techos-industrial": "Sellado Industrial - Ilatek.jpg",
    "inspeccion-y-mantenimiento-de-techos": "Inspeccion y Mantenimiento - Ilatek.jpg",
    "inspeccion-de-techos": "Inspeccion de Techos - Ilatek.jpg",
    "mantenimiento-de-techos": "Mantenimiento Preventivo - Ilatek.jpg",
    "limpieza-de-techos-y-canaletas": "Limpieza de Techos y Canaletas - Ilatek.jpg",
    "canaletas-y-bajantes": "Canaletas y Bajantes - Ilatek.jpg",
    "lavado-a-presion-techos": "Lavado a Presión de Techos - Ilatek.jpg",
    "tragaluces": "Tragaluz y Skylights - Ilatek.jpg",
    "instalacion-y-reemplazo-de-techos": "Instalación y Reemplazo - Ilatek.jpg",
    # FALLBACK: la librería social no tiene foto con ese título exacto; se usa la
    # más cercana del mismo tema (filtración → agua estancada; techos de X → el
    # sistema que se aplica a ese material).
    "empozamiento-de-techos": "Reparación de Filtraciones - Ilatek.jpg",
    "oxidacion-de-techos": "Reparación de Techos - Ilatek.jpg",
    "reparacion-post-huracan": "Reparación de Techos - Ilatek.jpg",
    "techos-de-zinc": "Reparación de Techos - Ilatek.jpg",
    "techos-de-asfalto": "Membrana Asfáltica - Ilatek.jpg",
    "techos-de-teja": "Impermeabilización - Ilatek.jpg",
    "techos-de-madera": "Impermeabilización - Ilatek.jpg",
    "techos-por-segmento": "Sellado de Techos - Ilatek.jpg",
}

# ── Limpieza: 14 landings (hub /servicios + 13) ─────────────────────────────
LIMPIEZA = {
    # Home y hub de servicios comparten la portada de marca (no hay foto social
    # con el título exacto de esas dos páginas genéricas).
    "home": "Ilatek Property Solution.jpg",
    "servicios": "Ilatek Property Solution.jpg",
    "airbnb-turnover": "Airbnb & Turnover - Ilatek.jpg",
    "alfombras": "Alfombras - Ilatek.jpg",
    "electrodomesticos": "Electrodomésticos - Ilatek.jpg",
    "lavado-a-presion": "Lavado a Presión - Ilatek.jpg",
    "limpieza-comercial": "Limpieza Comercial - Ilatek.jpg",
    "limpieza-de-mudanza": "Limpieza de Mudanza - Ilatek.jpg",
    "limpieza-estandar": "Limpieza Estándar - Ilatek.jpg",
    "limpieza-industrial": "Limpieza Industrial - ilatek.jpg",
    "limpieza-profunda": "Limpieza Profunda - Ilatek.jpg",
    "limpieza-residencial": "Limpieza Residencial - Ilatek.jpg",
    "organizacion": "Organización - Ilatek.jpg",
    "post-construccion": "Post-Construcción - Ilatek.jpg",
    "ventanas": "Ventanas - Ilatek.jpg",
}


def main() -> int:
    if not SOCIAL_SRC.is_dir():
        print(f"✗ No existe la carpeta de fotos sociales: {SOCIAL_SRC}", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    mapping = {**TECHOS, **LIMPIEZA}
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    missing: list[str] = []
    used: set[str] = set()

    for slug, filename in sorted(mapping.items()):
        src = next((d / filename for d in SOURCES if (d / filename).is_file()), None)
        if src is None:
            missing.append(f"{slug} -> {filename}")
            continue
        used.add(filename)
        with Image.open(src) as im:
            im = im.convert("RGB")
            if im.width > MAX_W:
                h = round(im.height * MAX_W / im.width)
                im = im.resize((MAX_W, h), Image.LANCZOS)
            dest = OUT / f"{slug}.jpg"
            im.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        print(f"  {slug:<40} <- {filename}  ({dest.stat().st_size // 1024} KB)")

    print(f"\nGeneradas {len(mapping) - len(missing)} de {len(mapping)} imágenes OG en {OUT}")
    unused = sorted(p.name for p in SOCIAL_SRC.glob("*.jpg") if p.name not in used)
    if unused:
        print("Fotos sociales sin asignar:")
        for name in unused:
            print(f"  - {name}")
    if missing:
        print("✗ Faltan fotos de origen:", file=sys.stderr)
        for name in missing:
            print(f"  - {name}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
